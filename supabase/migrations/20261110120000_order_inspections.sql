-- Migration: Lagos inspection photo, attached to the ORDER (not the dispute).
--
-- Why on the order: the Lagos agent photographs the goods before dispatch,
-- i.e. before any dispute exists. The admin disputes view then shows this
-- photo next to the buyer's Cotonou unboxing video (delivery_videos).
--
-- PROPOSAL for the team to confirm (Evans / Joseph). Only admins touch this
-- data, so RLS is admin-only. The photo lives in the private bucket
-- 'inspection-photos' (created by supabase/setup/00_buckets.sql); the table
-- stores the object PATH, and the admin app creates a signed URL to display it.

create table order_inspections (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  photo_path text not null,
  agent_name text,
  notes text,
  inspected_by uuid references profiles(id),
  created_at timestamptz default now()
);

create index idx_order_inspections_order_id on order_inspections(order_id);

alter table order_inspections enable row level security;

create policy "Admins can manage order inspections"
  on order_inspections for all using (is_admin(auth.uid()));

create policy "Admins can manage inspection photos storage"
  on storage.objects for all
  using ( bucket_id = 'inspection-photos' and is_admin(auth.uid()) );
