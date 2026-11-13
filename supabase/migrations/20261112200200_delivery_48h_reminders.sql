-- Migration: automatic reminder after delivery (48h window)
-- (Evans task, TrustLink EIP board).
--
-- Business rule (docs + buyer FAQ): after delivery the buyer has 48h to film
-- the unboxing and confirm, or to open a dispute.
--
-- `send_delivery_reminders()` is called every 15 min by pg_cron
-- (see supabase/setup/01_cron_delivery_reminders.sql) and, for every order
-- still 'delivered' (neither confirmed nor disputed):
--
--   • delivery + 24h → "24h left" reminder              (kind = 'window_closing')
--   • delivery + 48h → "48h window over" notice         (kind = 'window_closed')
--                      + if escrow_config.auto_release = true, the order is
--                        moved to 'confirmed' automatically.
--
-- Delays are configurable in escrow_config (reminder_hours, dispute_window_hours).
-- The `order_reminders` table guarantees a reminder is never sent twice.
--
-- Also enforces the 48h dispute window in the database (same function/trigger
-- names as Joseph's migration on `temp`), with one fix: an ADMIN can always
-- open a dispute after 48h (otherwise the "Delivery videos" page, which
-- creates a dispute when a video is judged defective, failed whenever the
-- review happened after the deadline).
--
-- Depends on 20261112200000 (orders.delivered_at). Idempotent.

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

  -- 1) "X hours left" reminder (one notification per order group).
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

  -- Mark every matching order (including the other orders of the same group).
  insert into order_reminders (order_id, kind)
  select o.id, 'window_closing'
  from orders o
  where o.status = 'delivered'
    and o.delivered_at is not null
    and now() >= o.delivered_at + make_interval(hours => v_reminder)
    and now() <  o.delivered_at + make_interval(hours => v_window)
  on conflict (order_id, kind) do nothing;

  -- 2) Window over.
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

-- Reserved to the cron job (postgres role) and service_role: never called from the apps.
revoke execute on function send_delivery_reminders() from public, anon, authenticated;

-- 48h dispute window enforced in the database.
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
    return new;  -- admins can always open a dispute (late video review, edge cases)
  end if;

  select delivered_at, status into d, v_status from orders where id = new.order_id;
  select coalesce(dispute_window_hours, 48) into v_window
  from escrow_config order by updated_at desc nulls last limit 1;

  if d is null then
    -- The parcel can arrive before the admin moves the order to 'delivered':
    -- the buyer app already offers "Defective product" from 'in_transit', so accept it.
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
