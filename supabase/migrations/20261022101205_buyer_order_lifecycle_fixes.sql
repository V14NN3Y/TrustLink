-- Migration: fix buyer-side order lifecycle, support messaging, reviews,
-- coupon tracking.
--
-- Context: the buyer app has a handful of "silent failure" bugs that all
-- share the same root cause: the RLS policies on `orders`/`messages` only
-- allow buyers select/insert (never update), so client code that tried to
-- flip order status after payment/delivery/dispute, or mark a message read,
-- was failing with 0 rows affected and no error. Rather than opening a
-- blanket `update` policy on `orders` for buyers (which would let a buyer
-- set ANY status on ANY of their orders, including self-marking "paid"
-- without having paid), each fix below is a narrowly scoped
-- SECURITY DEFINER function that performs exactly one legitimate
-- transition, re-checking ownership and the current status server-side.

-- 1. Let a buyer mark their own received messages as read.
create policy "Receivers can mark messages as read"
  on messages for update using (receiver_id = auth.uid())
  with check (receiver_id = auth.uid());

-- 2. Resolve a support admin to message, without needing to read the
--    `profiles` table directly (RLS blocks buyers from reading other
--    people's profiles, including admins).
create or replace function get_support_admin_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from profiles where role = 'admin' order by created_at asc limit 1;
$$;

-- 3. Buyer declares "produit conforme" -> order(s) move to 'confirmed'.
--    Only allowed from 'delivered'/'in_transit', only on the caller's own
--    order(s) (matches either the exact order id or, if it's part of a
--    multi-seller checkout, every order sharing the same group_id).
create or replace function confirm_order_receipt(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
begin
  select group_id into v_group_id from orders where id = p_order_id;
  update orders
  set status = 'confirmed', updated_at = now()
  where buyer_id = auth.uid()
    and status in ('delivered', 'in_transit')
    and (id = p_order_id or (v_group_id is not null and group_id = v_group_id));
end;
$$;

-- 4. Buyer declares "produit défectueux" -> records the unboxing video (if
--    any), opens the dispute, and moves the order(s) to 'disputed', all in
--    one atomic, ownership-checked transaction.
create or replace function open_order_dispute(
  p_order_id uuid,
  p_reason text,
  p_video_url text default null,
  p_duration_seconds integer default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_video_id uuid;
  v_dispute_id uuid;
  v_group_id uuid;
  v_owns boolean;
begin
  select (buyer_id = auth.uid()), group_id into v_owns, v_group_id
  from orders where id = p_order_id;

  if not coalesce(v_owns, false) then
    raise exception 'Order not found or not owned by caller';
  end if;

  if p_video_url is not null then
    insert into delivery_videos (order_id, buyer_id, video_url, duration_seconds)
    values (p_order_id, auth.uid(), p_video_url, p_duration_seconds)
    returning id into v_video_id;
  end if;

  insert into disputes (order_id, buyer_id, video_id, reason, status)
  values (p_order_id, auth.uid(), v_video_id, p_reason, 'open')
  returning id into v_dispute_id;

  update orders
  set status = 'disputed', updated_at = now()
  where buyer_id = auth.uid()
    and (id = p_order_id or (v_group_id is not null and group_id = v_group_id));

  return v_dispute_id;
end;
$$;

-- 5. Record the KkiaPay transaction reference right after the widget
--    reports success, WITHOUT marking the order as paid — only an admin
--    (who can reconcile against the KkiaPay dashboard) is trusted to do
--    that, matching the documented admin workflow. This at least means the
--    reference is no longer lost (previously the buyer-side update to
--    `orders.status='paid'` silently failed under RLS and payment_reference
--    was lost along with it).
create or replace function record_payment_reference(
  p_group_id uuid,
  p_reference text,
  p_method text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update orders
  set payment_reference = p_reference,
      payment_method = coalesce(p_method, payment_method),
      updated_at = now()
  where group_id = p_group_id
    and buyer_id = auth.uid()
    and status = 'pending';
end;
$$;

-- 6. Coupon usage counter — previously silently blocked by RLS (no update
--    policy for buyers on `coupons`), so `used_count`/`max_uses` were never
--    enforced via the buyer checkout path.
create or replace function increment_coupon_usage(p_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update coupons
  set used_count = used_count + 1
  where code = p_code
    and active = true
    and (max_uses is null or used_count < max_uses);
end;
$$;

-- 7. Let a buyer cancel their own order while it's still 'pending' (e.g. if
--    order_items insert fails mid-checkout). Previously createOrder()'s
--    rollback tried to delete the order it had just created, but buyers had
--    no delete policy on `orders` at all, so failed checkouts could leave
--    orphaned 'pending' orders behind.
create policy "Buyers can delete their own pending orders"
  on orders for delete using (buyer_id = auth.uid() and status = 'pending');

-- 8. Reviews: the purchase/delivery requirement was only enforced in the
--    UI (canBuyerReview), never in the database — any authenticated user
--    could insert a review for a product they never bought by calling the
--    API directly. Replace the blanket "manage own reviews" policy with
--    one that checks for a qualifying order at insert time.
drop policy if exists "Buyers can manage their own reviews" on reviews;

create policy "Buyers can insert reviews for delivered products"
  on reviews for insert with check (
    buyer_id = auth.uid()
    and exists (
      select 1 from order_items oi
      join orders o on o.id = oi.order_id
      where oi.product_id = reviews.product_id
        and o.buyer_id = auth.uid()
        and o.status in ('delivered', 'confirmed')
    )
  );
create policy "Buyers can update their own reviews"
  on reviews for update using (buyer_id = auth.uid());
create policy "Buyers can delete their own reviews"
  on reviews for delete using (buyer_id = auth.uid());
