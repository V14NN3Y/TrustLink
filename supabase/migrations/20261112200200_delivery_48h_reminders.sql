-- Migration: rappel automatique après la réception (fenêtre de 48h)
-- (tâche Evans, tableau TrustLink EIP).
--
-- Règle métier (doc + FAQ acheteur) : après la livraison, l'acheteur a 48h
-- pour filmer le déballage et confirmer, ou ouvrir un litige.
--
-- `send_delivery_reminders()` est appelée toutes les 15 min par pg_cron
-- (voir supabase/setup/01_cron_delivery_reminders.sql) et, pour chaque
-- commande encore 'delivered' (ni confirmée, ni en litige) :
--
--   • à livraison + 24h  → rappel "il vous reste 24h"          (kind = 'window_closing')
--   • à livraison + 48h  → rappel "délai de 48h écoulé"       (kind = 'window_closed')
--                          + si escrow_config.auto_release = true, la commande
--                            passe automatiquement en 'confirmed'.
--
-- Les délais sont réglables dans escrow_config (reminder_hours, dispute_window_hours).
-- La table `order_reminders` garantit qu'un rappel n'est jamais envoyé deux fois.
--
-- Inclut aussi la fenêtre de litige de 48h appliquée côté base (même nom de
-- fonction/trigger que la migration de Joseph sur `temp`), avec une
-- correction : un ADMIN peut toujours ouvrir un litige après 48h (sinon la
-- page "Vidéos de réception", qui crée un litige quand une vidéo est jugée
-- défectueuse, plantait dès que la revue avait lieu après le délai).
--
-- Dépend de 20261112200000 (orders.delivered_at). Idempotente.

alter table escrow_config add column if not exists dispute_window_hours integer not null default 48;
alter table escrow_config add column if not exists reminder_hours integer not null default 24;

create table if not exists order_reminders (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  kind text not null check (kind in ('window_closing', 'window_closed')),
  sent_at timestamptz not null default now(),
  unique (order_id, kind)
);

alter table order_reminders enable row level security;
drop policy if exists "Admins can view reminders" on order_reminders;
create policy "Admins can view reminders"
  on order_reminders for select using (is_admin(auth.uid()));

create or replace function send_delivery_reminders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window integer;
  v_reminder integer;
  v_auto boolean;
  v_count integer := 0;
  r record;
begin
  select coalesce(dispute_window_hours, 48), coalesce(reminder_hours, 24), coalesce(auto_release, false)
  into v_window, v_reminder, v_auto
  from escrow_config order by updated_at desc nulls last limit 1;

  v_window := coalesce(v_window, 48);
  v_reminder := coalesce(v_reminder, 24);
  v_auto := coalesce(v_auto, false);

  -- 1) Rappel "il vous reste X h" (une notification par groupe de commande).
  for r in
    select distinct on (coalesce(o.group_id, o.id)) o.id, o.buyer_id
    from orders o
    where o.status = 'delivered'
      and o.delivered_at is not null
      and now() >= o.delivered_at + make_interval(hours => v_reminder)
      and now() <  o.delivered_at + make_interval(hours => v_window)
      and not exists (select 1 from order_reminders x where x.order_id = o.id and x.kind = 'window_closing')
    order by coalesce(o.group_id, o.id), o.delivered_at
  loop
    insert into notifications (user_id, type, title, body, resource_type, resource_id)
    values (
      r.buyer_id, 'order_update',
      'Plus que ' || (v_window - v_reminder) || 'h pour vérifier votre colis',
      'Filmez le déballage puis confirmez la réception, ou signalez un problème avant la fin du délai de '
        || v_window || 'h. Passé ce délai, aucune réclamation ne sera acceptée.',
      'order', r.id
    );
    v_count := v_count + 1;
  end loop;

  -- Marque toutes les commandes concernées (y compris les autres commandes du même groupe).
  insert into order_reminders (order_id, kind)
  select o.id, 'window_closing'
  from orders o
  where o.status = 'delivered'
    and o.delivered_at is not null
    and now() >= o.delivered_at + make_interval(hours => v_reminder)
    and now() <  o.delivered_at + make_interval(hours => v_window)
  on conflict (order_id, kind) do nothing;

  -- 2) Délai écoulé.
  for r in
    select distinct on (coalesce(o.group_id, o.id)) o.id, o.buyer_id
    from orders o
    where o.status = 'delivered'
      and o.delivered_at is not null
      and now() >= o.delivered_at + make_interval(hours => v_window)
      and not exists (select 1 from order_reminders x where x.order_id = o.id and x.kind = 'window_closed')
    order by coalesce(o.group_id, o.id), o.delivered_at
  loop
    insert into notifications (user_id, type, title, body, resource_type, resource_id)
    values (
      r.buyer_id, 'order_update',
      case when v_auto then 'Commande confirmée automatiquement' else 'Délai de ' || v_window || 'h écoulé' end,
      case when v_auto
        then 'Le délai de ' || v_window || 'h après livraison est écoulé sans réclamation : votre commande est considérée comme conforme.'
        else 'Le délai de ' || v_window || 'h après livraison est écoulé. Pensez à confirmer la réception de votre commande.'
      end,
      'order', r.id
    );
    v_count := v_count + 1;
  end loop;

  with due as (
    select o.id
    from orders o
    where o.status = 'delivered'
      and o.delivered_at is not null
      and now() >= o.delivered_at + make_interval(hours => v_window)
  ), marked as (
    insert into order_reminders (order_id, kind)
    select id, 'window_closed' from due
    on conflict (order_id, kind) do nothing
    returning order_id
  )
  update orders set status = 'confirmed'
  where v_auto and id in (select id from due);

  return v_count;
end;
$$;

-- Réservé au cron (rôle postgres) et à l'admin via service_role : pas d'appel depuis les apps.
revoke execute on function send_delivery_reminders() from public, anon, authenticated;

-- Fenêtre de litige de 48h appliquée côté base.
create or replace function enforce_dispute_window() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  d timestamptz;
  v_status order_status;
  v_window integer;
begin
  if is_admin(auth.uid()) then
    return new;  -- l'admin peut toujours ouvrir un litige (revue vidéo tardive, cas exceptionnel)
  end if;

  select delivered_at, status into d, v_status from orders where id = new.order_id;
  select coalesce(dispute_window_hours, 48) into v_window
  from escrow_config order by updated_at desc nulls last limit 1;

  if d is null then
    -- Le colis peut arriver avant que l'admin ne passe la commande en 'delivered' :
    -- l'app acheteur propose déjà "Produit défectueux" dès 'in_transit', on l'accepte.
    if v_status = 'in_transit' then
      return new;
    end if;
    raise exception 'Litige impossible : commande non livrée';
  end if;
  if now() > d + make_interval(hours => coalesce(v_window, 48)) then
    raise exception 'Délai de % h après livraison dépassé', coalesce(v_window, 48);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_disputes_window on disputes;
create trigger trg_disputes_window
  before insert on disputes
  for each row execute function enforce_dispute_window();
