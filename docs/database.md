# Database

PostgreSQL on Supabase. Base schema: `schema_new_updated.sql` (v3). Changes since then: `supabase/migrations/` (applied in file-name order — see [deployment.md](deployment.md)).

## Enums

| Type | Values |
|---|---|
| `user_role` | buyer, seller, admin |
| `order_status` | pending, paid, processing, in_transit, delivered, confirmed, disputed, cancelled, refunded |
| `dispute_status` | open, resolved_refund, resolved_no_refund |
| `product_status` | draft, pending_review, approved, rejected |
| `notification_type` | order_update, new_message, product_approved, product_rejected, dispute_update, new_order, payment_received, order_ready |
| `payout_status` | pending_review, approved, rejected, paid |
| `dispatch_status` | preparing, in_transit, delivered, cancelled |
| `message_status` | sent, read |

## Tables

### Users and configuration

| Table | Content |
|---|---|
| `profiles` | One row per `auth.users` row (created by `handle_new_user`). Role, contact, default address, business fields (internal supplier), KYC flags |
| `invitation_codes` | Single-use admin invitation codes (`generate_invitation_code()`) |
| `notification_preferences` | Per-user channel preferences |
| `exchange_rates` | NGN→XOF rate (unique on the currency pair). Single source of truth for conversions |
| `escrow_config` | `spread_pct` (escrow commission), `delivery_fee`, `customs_pct`, `release_delay_hours`, `auto_release`, `dispute_window_hours` (48), `reminder_hours` (24) |
| `payment_methods`, `delivery_cities`, `hubs` | Checkout and logistics reference data |
| `app_settings`, `system_announcements` | Maintenance mode, banners |

### Catalogue

| Table | Content |
|---|---|
| `categories` | Tree (`parent_id`), `slug` unique |
| `products` | Price in XOF (item price only — fees are added at checkout), stock, status. Sourcing columns: `source_url` (unique, import key), `source_site`, `source_price_ngn`, `source_old_price_ngn`, `exchange_rate_used`, `last_synced_at` |
| `product_variants`, `product_images`, `product_views` | Variants, images (`is_primary`, `sort_order`), view analytics |
| `reviews`, `product_questions`, `stock_notifications` | Reviews (only for delivered purchases), Q&A, back-in-stock alerts |

### Orders

| Table | Content |
|---|---|
| `carts`, `cart_items`, `wishlists` | One cart per buyer (unique `buyer_id`) |
| `orders` | One per seller and checkout, sharing a `group_id`. Amounts, shipping snapshot, payment reference, `delivered_at`, `inspected_at` |
| `order_items` | Product snapshot (name, price) at order time |
| `delivery_steps` | Reference list of tracking steps shown to the buyer |
| `order_tracking_events` | Timestamped history, one row per status change (trigger) |
| `order_inspections` | Lagos inspection photos (`photo_path` in the private `inspection-photos` bucket, `visible_to_buyer`) |
| `order_reminders` | Reminders already sent (`window_closing`, `window_closed`) |
| `delivery_videos`, `disputes` | Unboxing videos and disputes |
| `dispatches`, `dispatch_orders` | Trips Lagos → Cotonou and their orders |
| `payouts`, `coupons`, `saved_payments` | Payouts, promo codes, saved buyer payment methods |

### Communication and audit

`messages` (threads via `parent_id`), `notifications` (realtime), `admin_logs`, `seller_logs`.

## Triggers

| Trigger | Table | Effect |
|---|---|---|
| `on_auth_user_created` | auth.users | Creates the profile; `admin` only with a valid invitation code |
| `trg_profiles_protect_privileged` | profiles | Blocks changes to role / KYC flags / business_slug unless admin or service role |
| `set_updated_at_*` | profiles, products, orders, order_items | `updated_at = now()` |
| `trg_orders_set_delivered_at` | orders | Sets `delivered_at` when the status becomes `delivered` |
| `trg_orders_tracking_event` | orders | Appends to `order_tracking_events` on insert / status change |
| `trg_order_inspection_added`, `trg_order_inspection_published` | order_inspections | Sets `inspected_at`, `paid → processing`, notifies the buyer once |
| `trg_disputes_window` | disputes | Rejects buyer disputes more than 48h after delivery |

## Storage buckets

Created by `supabase/setup/00_buckets.sql`.

| Bucket | Public | Content |
|---|---|---|
| `product-images` | yes | Product photos (import script can re-host here under `sourced/<product id>/`) |
| `avatars` | yes | Profile pictures |
| `kyc-documents` | no | KYC documents |
| `delivery-videos` | no | `confirmations/<buyer id>/…` and `disputes/<buyer id>/…` |
| `inspection-photos` | no | `orders/<order id>/…` |

Private files are displayed with signed URLs (1 hour).
