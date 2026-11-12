# TrustLink backend audit — 12 November 2026

> **Status:** issues #1 to #8, #11 and #12 are fixed on the `feat/evans-backend-tasks` branch (see §4). #9 and #10 concern Joseph's `temp` branch.

Scope: Supabase (schema `schema_new_updated.sql`, `supabase/migrations/`, RLS, functions, storage) and the state of the `main`, `feat/beta-setup` and `temp` branches.
Issues marked **tested** were reproduced on a PostgreSQL 16 database loaded with the repository schema. The production database was not inspected: policies added by hand there may already fix some points.

## 1. Current state

| Item | State |
|---|---|
| Stack | Supabase (Postgres + Auth + Realtime + Storage), no custom API. Business logic lives either in the React apps or in `SECURITY DEFINER` SQL functions |
| Schema | One monolithic file (34 tables, 9 enums) + 3 migrations on `main`, also copied at the end of the monolith |
| Migrations | No tooling: no `supabase/config.toml`, no seed, applied by hand in the SQL editor. Two competing folders: `supabase/migrations/` (main, beta-setup) and `migrations/` (temp) |
| Server functions | Clean buyer RPCs (`confirm_order_receipt`, `open_order_dispute`, `record_payment_reference`…). No Edge Function on `main`; `sourcing-preview` on `temp` |
| Automation | 5 triggers (profile on sign-up, `updated_at`). No scheduled job before this branch |
| Notifications | Created from the admin frontend, except those added by triggers on this branch |
| Payment | KkiaPay client-side only; the reference is stored, the switch to "paid" is manual (admin). No webhook |

### Branches

| Branch | Base | Content | Risk |
|---|---|---|---|
| `main` | — | Internal-sourcing pivot, buyer order lifecycle fixes | — |
| `feat/beta-setup` (10 Nov) | up-to-date `main` | Admin-side Lagos inspection (`order_inspections`, `inspection-photos` bucket), shared-screen disputes, `vercel.json` | Easy merge |
| `temp` (Joseph, 12 Nov) | commit of **24 August** | All-inclusive pricing, sourcing by link, 4-step tracking, 48h dispute, Konga scraper (60 products) | **~100 commits behind `main` → heavy conflicts** (`buyer/src/lib/supabase/products.js`, `account/page.jsx`…). Also commits `__pycache__` and `trustlink_modifs.zip` |
| `feat/evans-backend-tasks` (this work) | `feat/beta-setup` | Evans' tasks + fixes (see §3–4) | Rebase `temp` on it |

**Duplicate to settle:** the inspection photo exists twice — `order_inspections` (beta-setup, several photos, private bucket) and `orders.inspection_photo_url` (temp, a single URL). This branch keeps `order_inspections` and connects it to buyer tracking; `inspection_photo_url` should be dropped from `temp`.

## 2. Issues by priority

| # | Severity | Issue | Evidence | Fix |
|---|---|---|---|---|
| 1 | 🔴 Critical | **Anyone could become admin at sign-up**: `handle_new_user` took the role from `raw_user_meta_data`, which the client controls. The invitation code was only checked in the admin frontend | tested | Trigger ignores the client role; admin only with a valid `invitation_codes` code |
| 2 | 🔴 Critical | **A buyer could make themselves admin**: "Users can update their own profile" had no column restriction | tested | `before update` trigger protecting `role` / KYC flags / `business_slug` |
| 3 | 🔴 Critical | **Buyer-controlled prices**: the buyer inserted `orders.total_amount` and `order_items.product_price` themselves (a 500,000 FCFA TV ordered at 1 FCFA) | tested | `create_checkout_order()` RPC computing everything server-side; direct inserts removed |
| 4 | 🟠 High | **Admin notifications failed silently**: no `insert` policy on `notifications` → buyers were never told about status changes | tested | Admin `insert` policy + trigger-generated notifications |
| 5 | 🟠 High | **Email leak**: `stock_notifications` readable by anyone, even signed out | tested | Public read policy dropped |
| 6 | 🟠 High | Payment not verified server-side (no KkiaPay check) | reading | `verify-payment` Edge Function |
| 7 | 🟡 Medium | `delivery-videos` upload open to any signed-in user, any path | reading | Path restricted to `confirmations/<uid>/` and `disputes/<uid>/` |
| 8 | 🟡 Medium | 48h dispute window on `temp`: an admin opening a dispute after 48h (videos page) got an error | reading | Admins exempted |
| 9 | 🟡 Medium | `temp` scraper: TVs filed under the `audio-casques` slug (name "Électronique & TV") | data | Fix the scraper category mapping |
| 10 | 🟡 Medium | `temp`: the buyer catalogue falls back to `scrapedProducts.json` shipped in the bundle; those products have `tl-…` ids that do not exist in the database → cannot be added to the cart / ordered | reading | Import them with `scripts/import-products.mjs` and remove the JSON from the frontend |
| 11 | ⚪ Low | Inconsistent docs: NGN→XOF rate 0.89 (docs) / 0.41 (schema) / 0.42 (scraper) | reading | Single source: `exchange_rates` |
| 12 | ⚪ Low | Migrations copied at the end of the monolith → risk of double application | reading | Monolith = "v3 state", then only dated migrations |

## 3. Delivered on `feat/evans-backend-tasks`

| Task | Deliverable | Tested |
|---|---|---|
| Database: products and delivery steps | `20261112200000`: sourcing columns on `products` (`source_url` unique = import key), `ngn_to_xof()`, `all_inclusive_price_xof()`, `delivery_steps`, `order_tracking_events` filled by trigger, `orders.delivered_at` | Yes |
| Send products to the app | `scripts/import-products.mjs`: validation, NGN→FCFA, upsert without duplicates, status kept on re-import, categories created, optional image re-hosting, `--dry-run`, `--limit 30` | 10 unit tests + dry run on the 60 Konga products; real import not run (no project keys) |
| Lagos inspection photo | `20261112200100`: buyer read access (table + bucket), notification, `paid → processing`. Admin "send to buyer" option and publish/hide toggle; buyer "Lagos inspection" block | SQL tested; admin and buyer builds OK |
| Automatic 48h reminder | `20261112200200` + `setup/01_cron_delivery_reminders.sql`: 24h reminder, 48h notice (auto-confirm if `auto_release`), never duplicated, one per order group; 48h dispute window in the database | Yes |

## 4. Fixes applied

| # | Fix | Where | Verified |
|---|---|---|---|
| 1 | Role no longer read from sign-up metadata; admin only with a valid single-use `invitation_codes` code checked in `handle_new_user`. Codes generated in Profile → Team | `20261112220000`, `admin/src/lib/AuthContext.jsx`, `Register.jsx`, `TeamManagement.jsx` | Sign-up with `role: admin` → buyer; valid code → admin; reused code → buyer |
| 2 | `trg_profiles_protect_privileged` | migration | Buyer blocked; normal profile update OK; admin and service-role script OK |
| 3 | `create_checkout_order` RPC: price, delivery fee, commission, coupon (rules + counter), stock / published / quantity checks; direct inserts removed | migration, `buyer/src/lib/supabase/orders.js`, `checkout/page.jsx` | 1 FCFA order rejected; server total exact (sum of orders = total); exhausted coupon, stock, draft, negative quantity rejected |
| 4 | Admin `insert` policy on `notifications` | migration | OK |
| 5 | Public read on `stock_notifications` removed | migration | 0 visible rows |
| 6 | `verify-payment` Edge Function: KkiaPay status SUCCESS, amount ≥ server total, transaction not reused → order `paid`; otherwise reference kept for manual review | `supabase/functions/verify-payment/` | 5 logic tests, Deno type check OK; not deployed (KkiaPay keys needed) |
| 7 | `delivery-videos` upload restricted to the caller's folders | migration | Other folder rejected, own folder OK |
| 8 | Admins exempt from the 48h window | `20261112200200` | OK |
| + | `increment_coupon_usage` and `use_invitation_code` revoked from public roles (allowed exhausting coupons / codes) | migration | OK |
| 11–12 | Application order and single rate source documented | `docs/deployment.md`, `supabase/README.md` | — |

**To do by Joseph on `temp`:** replace `createOrder` (direct inserts, now rejected) with the `create_checkout_order` call from this branch; fix the TV category mapping (#9); remove `scrapedProducts.json` from the frontend and import the products with `scripts/import-products.mjs` (#10).
