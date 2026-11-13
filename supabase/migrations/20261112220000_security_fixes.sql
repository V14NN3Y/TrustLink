-- Migration: security fixes from the 12/11/2026 backend audit (docs/AUDIT_BACKEND.md).
--
--   #1  Sign-up: the role no longer comes from client-sent metadata.
--       Admin only with a code from the invitation_codes table, checked in the database.
--   #2  Users can no longer change their own role or KYC flags.
--   #3  Checkout: prices, fees, commission and coupon recomputed server-side
--       (create_checkout_order RPC); buyers can no longer insert directly into
--       orders / order_items.
--   #4  Admins can create notifications (previously rejected with no visible error).
--   #5  stock_notifications emails are no longer publicly readable.
--   #7  Delivery video uploads restricted to the user's own folder.
--   +   RPCs no longer needed client-side revoked from public roles.
--
-- (#6, server-side payment verification: Edge Function supabase/functions/verify-payment.)
--
-- Idempotent.

-- ============================================================
-- Helper: "trusted" caller (signed-in admin, SQL editor, service_role key).
-- ============================================================
create or replace function is_privileged_caller()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select is_admin(auth.uid())
      or session_user in ('postgres', 'supabase_admin')
      or current_setting('request.jwt.claim.role', true) = 'service_role'
      or coalesce(current_setting('request.jwt.claims', true), '') like '%"role":"service_role"%';
$$;

-- ============================================================
-- #1 Sign-up: role decided by the database
-- ============================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role user_role := 'buyer';
  v_code text := nullif(trim(new.raw_user_meta_data->>'invite_code'), '');
  v_invite_id uuid;
begin
  -- Only a valid invitation code (invitation_codes table) grants the admin role.
  -- The "role" field sent by the client is ignored: anyone can write it.
  if v_code is not null then
    select id into v_invite_id
    from invitation_codes
    where code = upper(v_code)
      and is_active
      and used_by is null
      and (expires_at is null or expires_at > now())
    for update;

    if v_invite_id is not null then
      v_role := 'admin';
    end if;
  end if;

  insert into public.profiles (id, email, role, full_name)
  values (new.id, new.email, v_role, nullif(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;

  if v_invite_id is not null then
    update invitation_codes
    set used_by = new.id, used_at = now(), is_active = false
    where id = v_invite_id;
  end if;

  return new;
end;
$$;

-- The internal supplier (scripts/create-internal-supplier.mjs) is created as
-- 'buyer' by this trigger, then switched to 'seller' by the script with the
-- service_role key: allowed by trigger #2 below.

-- ============================================================
-- #2 Protected profile fields
-- ============================================================
create or replace function protect_profile_privileged_fields()
returns trigger
language plpgsql
as $$
begin
  if is_privileged_caller() then
    return new;
  end if;
  if new.role is distinct from old.role
     or new.kyc_identity_verified is distinct from old.kyc_identity_verified
     or new.kyc_address_verified  is distinct from old.kyc_address_verified
     or new.kyc_business_verified is distinct from old.kyc_business_verified
     or new.business_slug is distinct from old.business_slug then
    raise exception 'Modification non autorisée (rôle, KYC ou identifiant boutique)'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_protect_privileged on profiles;
create trigger trg_profiles_protect_privileged
  before update on profiles
  for each row execute function protect_profile_privileged_fields();

-- ============================================================
-- #3 Server-side checkout
-- ============================================================
-- p_items    : [{"product_id": "<uuid>", "quantity": 2}, ...]
-- p_shipping : {"district": "...", "city": "Cotonou", "phone": "..."}
-- Returns    : {"group_id", "order_ids", "subtotal", "delivery_fee",
--               "commission_amount", "coupon_discount", "total_amount", "seller_count"}
-- The frontend must use the returned total_amount (not its own computation) for KkiaPay.
create or replace function create_checkout_order(
  p_items jsonb,
  p_shipping jsonb,
  p_payment_method text,
  p_coupon_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_buyer uuid := auth.uid();
  v_group uuid := gen_random_uuid();
  v_subtotal numeric := 0;
  v_spread numeric := 0;
  v_delivery numeric := 0;
  v_commission numeric;
  v_discount numeric := 0;
  v_total numeric;
  v_coupon coupons;
  v_code text := nullif(upper(trim(coalesce(p_coupon_code, ''))), '');
  v_city text := nullif(trim(coalesce(p_shipping->>'city', '')), '');
  v_district text := nullif(trim(coalesce(p_shipping->>'district', '')), '');
  v_seller_count integer;
  v_i integer := 0;
  v_alloc_delivery numeric := 0;
  v_alloc_commission numeric := 0;
  v_alloc_discount numeric := 0;
  v_order_delivery numeric;
  v_order_commission numeric;
  v_order_discount numeric;
  v_order_id uuid;
  v_order_ids uuid[] := '{}';
  v_bad text;
  s record;
begin
  if v_buyer is null then
    raise exception 'Connexion requise pour commander' using errcode = '42501';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Panier vide';
  end if;
  if v_city is null then
    raise exception 'Ville de livraison manquante';
  end if;
  if not exists (select 1 from payment_methods where code = p_payment_method and is_active) then
    raise exception 'Moyen de paiement indisponible';
  end if;

  -- Cart lines, grouped by product.
  create temporary table if not exists _checkout_lines (product_id uuid, quantity integer, seller_id uuid, name text, price numeric, stock integer, status product_status) on commit drop;
  truncate _checkout_lines;

  insert into _checkout_lines (product_id, quantity)
  select (e->>'product_id')::uuid, sum((e->>'quantity')::integer)
  from jsonb_array_elements(p_items) e
  group by 1;

  if exists (select 1 from _checkout_lines where product_id is null or quantity is null or quantity < 1 or quantity > 100) then
    raise exception 'Quantité invalide';
  end if;

  update _checkout_lines l
  set seller_id = p.seller_id, name = p.name, price = p.price, stock = p.stock_quantity, status = p.status
  from products p
  where p.id = l.product_id;

  select string_agg(coalesce(name, product_id::text), ', ') into v_bad
  from _checkout_lines where status is distinct from 'approved';
  if v_bad is not null then
    raise exception 'Produit indisponible : %', v_bad;
  end if;

  select string_agg(name, ', ') into v_bad
  from _checkout_lines where quantity > stock;
  if v_bad is not null then
    raise exception 'Stock insuffisant : %', v_bad;
  end if;

  select sum(price * quantity) into v_subtotal from _checkout_lines;

  select coalesce(spread_pct, 0), coalesce(delivery_fee, 0) into v_spread, v_delivery
  from escrow_config order by updated_at desc nulls last limit 1;
  v_spread := coalesce(v_spread, 0);
  v_delivery := coalesce(v_delivery, 0);
  v_commission := round(v_subtotal * v_spread / 100);

  -- Coupon: same rules as the checkout screen, enforced here.
  if v_code is not null then
    select * into v_coupon from coupons where code = v_code and active for update;
    if v_coupon.id is null then
      raise exception 'Code promo invalide';
    elsif v_coupon.expires_at is not null and v_coupon.expires_at < now() then
      raise exception 'Code promo expiré';
    elsif v_coupon.max_uses is not null and v_coupon.used_count >= v_coupon.max_uses then
      raise exception 'Code promo épuisé';
    elsif coalesce(v_coupon.min_order_amount, 0) > v_subtotal then
      raise exception 'Montant minimum non atteint pour ce code promo';
    end if;
    v_discount := case v_coupon.discount_type
      when 'percentage' then round(v_subtotal * v_coupon.discount_value / 100)
      else round(v_coupon.discount_value)
    end;
    v_discount := least(v_discount, v_subtotal);
    update coupons set used_count = used_count + 1 where id = v_coupon.id;
  end if;

  v_total := v_subtotal + v_delivery + v_commission - v_discount;

  -- One order per seller (same group_id), fees split pro rata;
  -- the last one absorbs the rounding so that the sum is exact.
  select count(distinct seller_id) into v_seller_count from _checkout_lines;

  for s in
    select seller_id, sum(price * quantity) as sub
    from _checkout_lines group by seller_id order by seller_id
  loop
    v_i := v_i + 1;
    if v_i = v_seller_count then
      v_order_delivery := v_delivery - v_alloc_delivery;
      v_order_commission := v_commission - v_alloc_commission;
      v_order_discount := v_discount - v_alloc_discount;
    else
      v_order_delivery := round(v_delivery * s.sub / nullif(v_subtotal, 0));
      v_order_commission := round(v_commission * s.sub / nullif(v_subtotal, 0));
      v_order_discount := round(v_discount * s.sub / nullif(v_subtotal, 0));
    end if;
    v_alloc_delivery := v_alloc_delivery + v_order_delivery;
    v_alloc_commission := v_alloc_commission + v_order_commission;
    v_alloc_discount := v_alloc_discount + v_order_discount;

    insert into orders (
      buyer_id, group_id, status, shipping_address_line1, shipping_city, shipping_country,
      total_amount, commission_amount, delivery_fee, coupon_code, coupon_discount,
      currency, payment_method, notes
    ) values (
      v_buyer, v_group, 'pending', v_district, v_city, 'Bénin',
      s.sub + v_order_delivery + v_order_commission - v_order_discount,
      v_order_commission, v_order_delivery, v_code, v_order_discount,
      'XOF', p_payment_method, 'Paiement via ' || p_payment_method
    ) returning id into v_order_id;

    v_order_ids := v_order_ids || v_order_id;

    insert into order_items (order_id, seller_id, product_id, product_name, product_price, quantity, subtotal, status)
    select v_order_id, l.seller_id, l.product_id, l.name, l.price, l.quantity, l.price * l.quantity, 'pending'
    from _checkout_lines l where l.seller_id = s.seller_id;
  end loop;

  return jsonb_build_object(
    'group_id', v_group,
    'order_ids', to_jsonb(v_order_ids),
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery,
    'commission_amount', v_commission,
    'coupon_discount', v_discount,
    'total_amount', v_total,
    'seller_count', v_seller_count
  );
end;
$$;

revoke execute on function create_checkout_order(jsonb, jsonb, text, text) from public, anon;
grant execute on function create_checkout_order(jsonb, jsonb, text, text) to authenticated;

-- No more direct inserts by buyers: everything goes through create_checkout_order.
drop policy if exists "Buyers can create orders" on orders;
drop policy if exists "Buyers can insert order items for their own orders" on order_items;

-- The coupon counter is incremented by create_checkout_order; the old RPC let
-- anyone exhaust a promo code.
revoke execute on function increment_coupon_usage(text) from public, anon, authenticated;
-- Replaced by the check in handle_new_user; it let anyone "burn" invitation codes.
revoke execute on function use_invitation_code(text) from public, anon, authenticated;

-- ============================================================
-- #4 Notifications created by admins
-- ============================================================
drop policy if exists "Admins can create notifications" on notifications;
create policy "Admins can create notifications"
  on notifications for insert with check (is_admin(auth.uid()));
drop policy if exists "Admins can view all notifications" on notifications;
create policy "Admins can view all notifications"
  on notifications for select using (is_admin(auth.uid()));

-- ============================================================
-- #5 Stock alert emails
-- ============================================================
drop policy if exists "Anyone can view stock notifications" on stock_notifications;

-- ============================================================
-- #7 Video uploads: only into confirmations/<uid>/ or disputes/<uid>/
-- ============================================================
drop policy if exists "Authenticated users can upload delivery videos" on storage.objects;
drop policy if exists "Buyers can upload delivery videos to their folder" on storage.objects;
create policy "Buyers can upload delivery videos to their folder"
  on storage.objects for insert
  with check (
    bucket_id = 'delivery-videos'
    and auth.uid() is not null
    and split_part(name, '/', 1) in ('confirmations', 'disputes')
    and split_part(name, '/', 2) = auth.uid()::text
  );
