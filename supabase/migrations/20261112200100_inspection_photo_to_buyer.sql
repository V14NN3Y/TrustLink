-- Migration: send the Lagos inspection photo to the buyer
-- (Evans + Samuel task, TrustLink EIP board).
--
-- Builds on the `order_inspections` table + the private `inspection-photos`
-- bucket created by 20261110120000_order_inspections.sql (feat/beta-setup
-- branch). Until now only the admin could see the photo; this migration
-- "delivers" it to the buyer:
--
--   1. `visible_to_buyer`: the admin can keep a photo internal.
--   2. The buyer can READ the visible inspections of THEIR orders and create a
--      signed URL on the matching file (private bucket).
--   3. Trigger when a photo is added: `orders.inspected_at` is set, the order
--      moves from 'paid' to 'processing' (= "Lagos inspection" tracking step)
--      and the buyer gets an in-app (realtime) notification.
--
-- Note for Joseph (temp branch): the `orders.inspection_photo_url` column of
-- your migration is no longer needed — photos live in `order_inspections`
-- (several photos per order, private bucket → signed URL, no public URL).
-- `orders.inspected_at` keeps the same name.
--
-- Idempotent.

alter table order_inspections add column if not exists visible_to_buyer boolean not null default true;
alter table orders add column if not exists inspected_at timestamptz;

-- 1. Buyer read access (table)
drop policy if exists "Buyers can view inspections of their orders" on order_inspections;
create policy "Buyers can view inspections of their orders"
  on order_inspections for select using (
    visible_to_buyer
    and exists (select 1 from orders o where o.id = order_inspections.order_id and o.buyer_id = auth.uid())
  );

-- 2. Buyer read access (file) — required by createSignedUrl().
drop policy if exists "Buyers can view inspection photos of their orders" on storage.objects;
create policy "Buyers can view inspection photos of their orders"
  on storage.objects for select using (
    bucket_id = 'inspection-photos'
    and exists (
      select 1
      from public.order_inspections oi
      join public.orders o on o.id = oi.order_id
      where oi.photo_path = storage.objects.name
        and oi.visible_to_buyer
        and o.buyer_id = auth.uid()
    )
  );

-- 3. Side effects of adding an inspection photo.
create or replace function on_order_inspection_added()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_buyer uuid;
begin
  update orders
  set inspected_at = coalesce(inspected_at, new.created_at, now()),
      status = case when status = 'paid' then 'processing'::order_status else status end
  where id = new.order_id
  returning buyer_id into v_buyer;

  -- Only one notification per order, even when several photos are added.
  if new.visible_to_buyer and v_buyer is not null and not exists (
    select 1 from order_inspections
    where order_id = new.order_id and id <> new.id and visible_to_buyer
  ) then
    insert into notifications (user_id, type, title, body, resource_type, resource_id)
    values (
      v_buyer,
      'order_update',
      'Votre colis a été inspecté à Lagos',
      'Notre agent a contrôlé votre article avant expédition. La photo d''inspection est disponible dans le suivi de votre commande.',
      'order',
      new.order_id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_order_inspection_added on order_inspections;
create trigger trg_order_inspection_added
  after insert on order_inspections
  for each row execute function on_order_inspection_added();

-- A photo switched from "internal" to "visible" later also triggers the notification.
create or replace function on_order_inspection_published()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_buyer uuid;
begin
  if new.visible_to_buyer and not old.visible_to_buyer and not exists (
    select 1 from order_inspections
    where order_id = new.order_id and id <> new.id and visible_to_buyer
  ) then
    select buyer_id into v_buyer from orders where id = new.order_id;
    if v_buyer is not null then
      insert into notifications (user_id, type, title, body, resource_type, resource_id)
      values (v_buyer, 'order_update', 'Votre colis a été inspecté à Lagos',
        'La photo d''inspection de votre article est disponible dans le suivi de votre commande.',
        'order', new.order_id);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_order_inspection_published on order_inspections;
create trigger trg_order_inspection_published
  after update of visible_to_buyer on order_inspections
  for each row execute function on_order_inspection_published();
