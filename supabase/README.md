# TrustLink database (Supabase)

| Folder | Content |
|---|---|
| `../schema_new_updated.sql` | Complete v3 schema. The "MIGRATION" blocks copied at its end are already included: do **not** re-apply the October 2026 migrations on a database created from this file |
| `migrations/` | Dated migrations, applied in file-name order |
| `setup/` | One-off project setup: storage buckets (`00_buckets.sql`), pg_cron reminder job (`01_cron_delivery_reminders.sql`) |
| `functions/verify-payment/` | Edge Function verifying KkiaPay payments |
| `tests/` | Local test bench (`run.sh`) |

Application order, first admin, Edge Function secrets: [docs/deployment.md](../docs/deployment.md).
Tables, triggers, buckets: [docs/database.md](../docs/database.md). RPC reference: [docs/api.md](../docs/api.md).

## Rules for app code

- Orders: only through the `create_checkout_order` RPC (direct inserts into `orders` / `order_items` are rejected).
- Payment: the amount sent to KkiaPay is the `total_amount` returned by that RPC.
- A profile's role, KYC flags and `business_slug` can only be changed by an admin or the service-role key.
