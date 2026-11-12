-- Migration: base de données "produits sourcés" + "étapes de livraison"
-- (tâche Evans + Ramdon, tableau TrustLink EIP).
--
-- 1. PRODUITS — les produits ne viennent plus de vendeurs mais du sourcing
--    de l'équipe (Konga, Jumia, Slot.ng, boutiques Shopify...). On garde la
--    trace de la source pour pouvoir ré-importer sans doublon (upsert sur
--    source_url) et recalculer le prix si le Naira bouge.
--
-- 2. ÉTAPES DE LIVRAISON — référentiel `delivery_steps` (les 4 étapes du
--    suivi acheteur : paiement sécurisé → inspection Lagos → en transit →
--    livré) + historique horodaté `order_tracking_events`, rempli
--    AUTOMATIQUEMENT par trigger à chaque changement de statut d'une commande.
--    Aucun code front n'a besoin d'écrire dans l'historique.
--
-- Compatible avec la branche `temp` (Joseph) : mêmes noms pour
-- escrow_config.customs_pct, orders.delivered_at et le trigger
-- trg_orders_set_delivered_at ("if not exists" / "create or replace"), donc
-- les deux migrations peuvent être appliquées dans n'importe quel ordre.
--
-- Idempotente : peut être relancée sans erreur.

-- ============================================================
-- 1. PRODUITS SOURCÉS
-- ============================================================

alter table products add column if not exists source_url text;
alter table products add column if not exists source_site text;            -- ex. 'konga', 'jumia', 'slot', 'shopify:<boutique>'
alter table products add column if not exists source_price_ngn numeric(14, 2);
alter table products add column if not exists source_old_price_ngn numeric(14, 2);
alter table products add column if not exists exchange_rate_used numeric(12, 4); -- taux NGN→XOF appliqué au dernier import
alter table products add column if not exists last_synced_at timestamptz;

-- Contrainte unique (et non index partiel) : PostgREST / supabase-js
-- `upsert(..., { onConflict: 'source_url' })` exige une vraie contrainte.
-- Plusieurs NULL restent autorisés (produits saisis à la main dans l'admin).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_source_url_key') then
    alter table products add constraint products_source_url_key unique (source_url);
  end if;
end $$;

-- Douane en % du prix article (même colonne que la migration de Joseph).
alter table escrow_config add column if not exists customs_pct numeric(5, 2) not null default 0;

-- Conversion NGN → XOF au taux courant de la table exchange_rates.
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

-- Prix "tout compris" affiché à l'acheteur, même formule que
-- buyer/src/lib/pricing.js (branche temp) :
--   article + transport + douane (customs_pct) + séquestre (spread_pct).
-- Le prix stocké dans products.price reste le prix ARTICLE en XOF, les frais
-- sont ajoutés à l'affichage / au checkout : ne pas les inclure deux fois.
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
-- 2. ÉTAPES DE LIVRAISON
-- ============================================================

-- Date de livraison, posée automatiquement au passage en 'delivered'.
-- Sert à la fenêtre de litige de 48h et au rappel automatique.
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

-- Référentiel des étapes affichées à l'acheteur.
create table if not exists delivery_steps (
  code text primary key,
  label text not null,
  description text,
  icon text,
  position integer not null,
  is_main_step boolean not null default true  -- false = étape "hors parcours" (litige, annulation...)
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

-- Correspondance statut de commande → étape (les statuts DB ne changent pas).
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

-- Historique horodaté du parcours de chaque commande.
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

-- Trigger : chaque création de commande / changement de statut ajoute une
-- ligne d'historique. SECURITY DEFINER car les changements de statut faits
-- par les RPC acheteur (confirm_order_receipt, open_order_dispute) doivent
-- aussi être tracés alors que l'acheteur n'a pas le droit d'écrire ici.
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

-- Rattrapage : une ligne "état actuel" pour les commandes existantes sans historique.
insert into order_tracking_events (order_id, step, status, created_at)
select o.id, order_status_to_step(o.status), o.status, coalesce(o.updated_at, o.created_at, now())
from orders o
where not exists (select 1 from order_tracking_events e where e.order_id = o.id);
