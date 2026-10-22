-- Migration: internal supplier profile + admin RLS fixes for product images
--
-- Context: TrustLink no longer onboards external sellers. Products are now
-- sourced and published directly by the TrustLink admin team, attributed to
-- a single internal "fournisseur interne" profile (business_slug =
-- 'trustlink-sourcing') instead of a real external seller account.
--
-- This migration assumes the internal supplier's `auth.users` row and its
-- `profiles` row have ALREADY been created by running
-- scripts/create-internal-supplier.mjs (requires the Supabase service-role
-- key — auth.users cannot be inserted via plain SQL). Run that script first,
-- then apply this migration.

-- 1. Admin RLS on the `product_images` table (previously had no admin
--    policy at all — only public SELECT and seller-owned ALL via a subquery
--    on products.seller_id). Mirrors the existing admin pattern already used
--    on `products` / `product_variants`.
create policy "Admins can manage all product images"
  on product_images for all using (is_admin(auth.uid()));

-- 2. Admin RLS on the `product-images` storage bucket (previously had no
--    admin policy — only public SELECT and seller-only INSERT gated on
--    role='seller'). Mirrors the existing "Admins can manage all KYC
--    documents" policy already defined on the kyc-documents bucket.
create policy "Admins can manage product images storage"
  on storage.objects for all
  using ( bucket_id = 'product-images' and is_admin(auth.uid()) );

-- Note: "Sellers can view all categories" (categories) and
-- "Sellers can upload product images" (storage, role='seller') are left
-- untouched. They are harmless now that no new external seller account will
-- ever be created through a client app — only the internal supplier profile
-- (which never authenticates through any app) carries role='seller'.
