# TrustLink

Cross-border marketplace (Nigeria → Benin) with escrow payments. Buyers in Benin order products sourced in Nigeria; their money stays in escrow until they confirm, with an unboxing video, that the parcel matches what they ordered.

Since October 2026 the TrustLink team sources and publishes every product itself (Konga, Jumia, Slot.ng, Shopify stores…). Products are attributed to a single internal supplier profile, **TrustLink Sourcing**; there is no external seller onboarding anymore.

## Repository layout

| Path | What it is |
|---|---|
| `buyer/` | Buyer web app (React + Vite) — catalogue, cart, checkout, KkiaPay payment, order tracking, disputes |
| `admin/` | Back-office (React + Vite) — orders, Lagos inspection, logistics, finance, moderation, users |
| `seller/` | Former seller app, **not deployed** (kept for reference) |
| `schema_new_updated.sql` | Complete v3 database schema (Supabase / PostgreSQL) |
| `supabase/migrations/` | Dated migrations applied on top of the v3 schema |
| `supabase/setup/` | One-off project setup (storage buckets, pg_cron job) |
| `supabase/functions/` | Edge Functions (`verify-payment`) |
| `supabase/tests/` | Local test bench: migrations, feature scenarios, security attacks |
| `scripts/` | Admin scripts run with the service-role key (internal supplier, product import) |
| `docs/` | Documentation (start with [docs/README.md](docs/README.md)) |

## Quick start

```bash
git clone https://github.com/V14NN3Y/TrustLink.git
cd TrustLink/buyer          # or admin/
npm install
cp .env.example .env        # fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

The database is set up once per Supabase project: see [docs/deployment.md](docs/deployment.md).

## Documentation

- [Architecture](docs/architecture.md)
- [Applications and features](docs/apps.md)
- [Database](docs/database.md)
- [Server API (RPCs and Edge Functions)](docs/api.md)
- [Order lifecycle, escrow and delivery tracking](docs/order-lifecycle.md)
- [Security model](docs/security.md)
- [Product import](docs/product-import.md)
- [Deployment](docs/deployment.md)
- [Testing](docs/testing.md)
- [Contributing](docs/contributing.md)
- [Backend audit (Nov 2026)](docs/AUDIT_BACKEND.md)

## Language

Code, comments and documentation are in English. Buyer- and admin-facing text (UI labels, notifications, error messages shown to users) stays in French, because the product targets French-speaking customers in Benin; the buyer app also ships an English translation (`buyer/src/lib/i18n.js`).
