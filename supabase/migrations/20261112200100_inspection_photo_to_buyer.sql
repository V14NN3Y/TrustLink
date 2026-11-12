-- Migration: envoi de la photo d'inspection de Lagos à l'acheteur
-- (tâche Evans + Samuel, tableau TrustLink EIP).
--
-- S'appuie sur la table `order_inspections` + le bucket privé
-- `inspection-photos` créés par 20261110120000_order_inspections.sql
-- (branche feat/beta-setup). Jusqu'ici seul l'admin voyait la photo ; cette
-- migration la "livre" à l'acheteur :
--
--   1. `visible_to_buyer` : l'admin peut garder une photo interne.
--   2. L'acheteur peut LIRE les inspections visibles de SES commandes, et
--      générer une URL signée sur le fichier correspondant (bucket privé).
--   3. Trigger à l'ajout d'une photo : `orders.inspected_at` est posé, la
--      commande passe de 'paid' à 'processing' (= étape "Inspection à Lagos"
--      du suivi), et l'acheteur reçoit une notification in-app (realtime).
--
-- Remarque pour Joseph (branche temp) : la colonne `orders.inspection_photo_url`
-- de ta migration n'est plus nécessaire — la photo est dans `order_inspections`
-- (plusieurs photos possibles, bucket privé → URL signée, pas d'URL publique).
-- `orders.inspected_at` est conservé avec le même nom.
--
-- Idempotente.

alter table order_inspections add column if not exists visible_to_buyer boolean not null default true;
alter table orders add column if not exists inspected_at timestamptz;

-- 1. Lecture côté acheteur (table)
drop policy if exists "Buyers can view inspections of their orders" on order_inspections;
create policy "Buyers can view inspections of their orders"
  on order_inspections for select using (
    visible_to_buyer
    and exists (select 1 from orders o where o.id = order_inspections.order_id and o.buyer_id = auth.uid())
  );

-- 2. Lecture côté acheteur (fichier) — nécessaire pour createSignedUrl().
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

-- 3. Effets de l'ajout d'une photo d'inspection.
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

  -- Une seule notification par commande, même si plusieurs photos sont ajoutées.
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

-- Une photo passée de "interne" à "visible" après coup déclenche aussi la notification.
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
