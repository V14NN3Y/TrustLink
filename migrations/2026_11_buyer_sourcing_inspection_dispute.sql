-- ============================================
-- TRUSTLINK - Migration : prix tout compris, sourcing par lien,
-- inspection Lagos, fenêtre de litige 48h
-- À exécuter une fois dans l'éditeur SQL Supabase.
-- ============================================

-- 1) Prix tout compris : taux de douane (en % du prix article), 0 par défaut.
--    Peut être surchargé côté front par VITE_CUSTOMS_PCT (prioritaire).
--    À RENSEIGNER par l'admin : aucun taux n'a été supposé.
alter table escrow_config add column if not exists customs_pct numeric(5,2) not null default 0;

-- 2) Suivi : photo d'inspection à Lagos + date de livraison
alter table orders add column if not exists inspection_photo_url text;
alter table orders add column if not exists inspected_at timestamptz;
alter table orders add column if not exists delivered_at timestamptz;

-- Rattrapage des commandes déjà livrées
update orders set delivered_at = updated_at
where status in ('delivered', 'confirmed') and delivered_at is null;

-- delivered_at est posé automatiquement au passage au statut 'delivered'
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

-- 3) Fenêtre de litige de 48h après livraison, appliquée côté base
create or replace function enforce_dispute_window() returns trigger as $$
declare d timestamptz;
begin
  select delivered_at into d from orders where id = new.order_id;
  if d is null then
    raise exception 'Litige impossible : commande non livrée';
  end if;
  if now() > d + interval '48 hours' then
    raise exception 'Délai de 48h après livraison dépassé';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_disputes_window on disputes;
create trigger trg_disputes_window
  before insert on disputes
  for each row execute function enforce_dispute_window();

-- 4) Sourcing par lien
create table if not exists sourcing_requests (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references profiles(id),
  product_url text not null,
  title text,
  quantity integer not null default 1 check (quantity > 0),
  budget_xof numeric(12,2),
  notes text,
  status text not null default 'new',
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table sourcing_requests enable row level security;

create policy "Buyers can create their sourcing requests"
  on sourcing_requests for insert with check (buyer_id = auth.uid());
create policy "Buyers can view their sourcing requests"
  on sourcing_requests for select using (buyer_id = auth.uid());
create policy "Admins manage sourcing requests"
  on sourcing_requests for all using (is_admin(auth.uid()));

create index if not exists idx_sourcing_requests_buyer_id on sourcing_requests(buyer_id);
