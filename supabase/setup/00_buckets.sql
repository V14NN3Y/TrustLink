-- Storage buckets for a fresh TrustLink Supabase project.
-- The main schema creates the storage POLICIES but not the buckets themselves,
-- so run this once per project (SQL editor), after schema_new_updated.sql.
-- Safe to re-run.

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('avatars',           'avatars',           true,  5242880),    -- 5 MB
  ('product-images',    'product-images',    true,  10485760),   -- 10 MB
  ('kyc-documents',     'kyc-documents',     false, 10485760),
  ('delivery-videos',   'delivery-videos',   false, 52428800),   -- 50 MB (free-tier max)
  ('inspection-photos', 'inspection-photos', false, 10485760)
on conflict (id) do nothing;
