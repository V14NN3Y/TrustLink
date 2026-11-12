-- Migration: "sourced products" + "delivery steps" data model
-- (Evans + Ramdon task, TrustLink EIP board).
--
-- 1. PRODUCTS — products no longer come from external sellers but from the
--    team's sourcing (Konga, Jumia, Slot.ng, Shopify stores...). The source is
--    kept so that a product can be re-imported without duplicates (upsert on
--    source_url) and its price recomputed when the Naira moves.
--
-- 2. DELIVERY STEPS — `delivery_steps` reference table (the 4 steps of buyer
--    tracking: payment secured → Lagos inspection → in transit → delivered)
--    + timestamped `order_tracking_events` history, filled AUTOMATICALLY by a
--    trigger on every order status change. No frontend code has to write to it.
--
-- Compatible with the `temp` branch (Joseph): same names for
-- escrow_config.customs_pct, orders.delivered_at and the
-- trg_orders_set_delivered_at trigger ("if not exists" / "create or replace"),
-- so both migrations can be applied in any order.
--
-- Idempotent: can be re-run without errors.

-- ============================================================
-- 1. SOURCED PRODUCTS
-- ============================================================

alter table products add column if not exists source_url text;
alter table products add column if not exists source_site text;            -- e.g. 'konga', 'jumia', 'slot', 'shopify:<store>'
alter table products add column if not exists source_price_ngn numeric(14, 2);
alter table products add column if not exists source_old_price_ngn numeric(14, 2);
alter table products add column if not exists exchange_rate_used numeric(12, 4); -- NGN→XOF rate applied at the last import
alter table products add column if not exists last_synced_at timestamptz;

-- A real unique constraint (not a partial index): PostgREST / supabase-js
-- `upsert(..., { onConflict: 'source_url' })` requires one.
-- Several NULLs are still allowed (products created by hand in the admin).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_source_url_key') then
    alter table products add constraint products_source_url_key unique (source_url);
  end if;
end $$;

-- Customs duty as a % of the item price (same column as Joseph's migration).
alter table escrow_config add column if not exists customs_pct numeric(5, 2) not null default 0;

-- NGN → XOF conversion at the current rate of the exchange_rates table.
create or replace function ngn_to_xof(p_amount_ngn numeric)
returns numeric
language sql
stable
set search_path = public
as $$
  select round(p_amount_ngn * rate)
  from exchange_rates
  where from_currency = 'NGN' and to_currency = 'XOF'
  order by updated_at desc nulls last
  limit 1;
$$;

-- "All-inclusive" price shown to the buyer, same formula as
-- buyer/src/lib/pricing.js (temp branch):
--   item + transport + customs (customs_pct) + escrow (spread_pct).
-- products.price stays the ITEM price in XOF; fees are added at display /
-- checkout time, so never include them twice.
create or replace function all_inclusive_price_xof(p_price_xof numeric)
returns numeric
language sql
stable
set search_path = public
as $$
  select round(p_price_xof)
       + coalesce(c.delivery_fee, 0)
       + round(p_price_xof * coalesce(c.customs_pct, 0) / 100)
       + round(p_price_xof * coalesce(c.spread_pct, 0) / 100)
  from (select 1) one
  left join lateral (
    select delivery_fee, customs_pct, spread_pct
    from escrow_config order by updated_at desc nulls last limit 1
  ) c on true;
$$;

grant execute on function ngn_to_xof(numeric) to anon, authenticated;
grant execute on function all_inclusive_price_xof(numeric) to anon, authenticated;

-- ============================================================
-- 2. DELIVERY STEPS
-- ============================================================

-- Delivery date, set automatically when the order becomes 'delivered'.
-- Used by the 48h dispute window and the automatic reminder.
alter table orders add column if not exists delivered_at timestamptz;

update orders set delivered_at = updated_at
where status in ('delivered', 'confirmed') and delivered_at is null;

create or replace function set_delivered_at() returns trigger as $$
begin
  if new.status = 'delivered' and (old.status is distinct from 'delivered') and new.delivered_at is null then
    new.delivered_at := now();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_orders_set_delivered_at on orders;
create trigger trg_orders_set_delivered_at
  before update on orders
  for each row execute function set_delivered_at();

-- Reference list of the steps shown to the buyer (labels are buyer-facing
-- copy, in French like the rest of the buyer UI).
create table if not exists delivery_steps (
  code text primary key,
  label text not null,
  description text,
  icon text,
  position integer not null,
  is_main_step boolean not null default true  -- false = off-journey step (dispute, cancellation...)
);

insert into delivery_steps (code, label, description, icon, position, is_main_step) values
  ('ordered',    'Commande passée',      'En attente du paiement',              'ri-time-line',          0, false),
  ('paid',       'Paiement sécurisé',    'Fonds bloqués en séquestre',          'ri-shield-check-line',  1, true),
  ('inspection', 'Inspection à Lagos',   'Photo de contrôle avant expédition',  'ri-camera-lens-line',   2, true),
  ('in_transit', 'En transit',           'Lagos → Cotonou',                     'ri-truck-line',         3, true),
  ('delivered',  'Livré',                'Remis à votre adresse',               'ri-map-pin-line',       4, true),
  ('confirmed',  'Réception confirmée',  'Fonds libérés',                       'ri-check-double-line',  5, false),
  ('disputed',   'Litige ouvert',        'Analyse de la vidéo de déballage',    'ri-error-warning-line', 90, false),
  ('cancelled',  'Commande annulée',     null,                                  'ri-close-circle-line',  91, false),
  ('refunded',   'Remboursée',           null,                                  'ri-refund-2-line',      92, false)
on conflict (code) do update set
  label = excluded.label, description = excluded.description,
  icon = excluded.icon, position = excluded.position, is_main_step = excluded.is_main_step;

-- Order status → step mapping (database statuses are unchanged).
create or replace function order_status_to_step(p_status order_status)
returns text
language sql
immutable
as $$
  select case p_status
    when 'pending'    then 'ordered'
    when 'paid'       then 'paid'
    when 'processing' then 'inspection'
    when 'in_transit' then 'in_transit'
    when 'delivered'  then 'delivered'
    when 'confirmed'  then 'confirmed'
    when 'disputed'   then 'disputed'
    when 'cancelled'  then 'cancelled'
    when 'refunded'   then 'refunded'
  end;
$$;

-- Timestamped journey history of each order.
create table if not exists order_tracking_events (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  step text not null references delivery_steps(code),
  status order_status,
  note text,
  location text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_tracking_events_order on order_tracking_events(order_id, created_at);

alter table order_tracking_events enable row level security;
alter table delivery_steps enable row level security;

drop policy if exists "Anyone can view delivery steps" on delivery_steps;
create policy "Anyone can view delivery steps"
  on delivery_steps for select using (true);
drop policy if exists "Admins can manage delivery steps" on delivery_steps;
create policy "Admins can manage delivery steps"
  on delivery_steps for all using (is_admin(auth.uid()));

drop policy if exists "Buyers can view tracking of their orders" on order_tracking_events;
create policy "Buyers can view tracking of their orders"
  on order_tracking_events for select using (
    exists (select 1 from orders o where o.id = order_tracking_events.order_id and o.buyer_id = auth.uid())
  );
drop policy if exists "Admins can manage tracking events" on order_tracking_events;
create policy "Admins can manage tracking events"
  on order_tracking_events for all using (is_admin(auth.uid()));

-- Trigger: every order creation / status change appends a history row.
-- SECURITY DEFINER because status changes made by buyer RPCs
-- (confirm_order_receipt, open_order_dispute) must be tracked too, although
-- the buyer has no write access to this table.
create or replace function log_order_tracking_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into order_tracking_events (order_id, step, status, created_by)
    values (new.id, order_status_to_step(new.status), new.status, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_orders_tracking_event on orders;
create trigger trg_orders_tracking_event
  after insert or update of status on orders
  for each row execute function log_order_tracking_event();

-- Backfill: one "current state" row for existing orders without history.
insert into order_tracking_events (order_id, step, status, created_at)
select o.id, order_status_to_step(o.status), o.status, coalesce(o.updated_at, o.created_at, now())
from orders o
where not exists (select 1 from order_tracking_events e where e.order_id = o.id);
