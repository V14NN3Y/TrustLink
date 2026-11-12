# TrustLink — Admin app

Back-office of TrustLink: orders and payments, Lagos inspection photos, logistics (trips Lagos → Cotonou), disputes and unboxing videos, catalogue of the internal supplier, users, coupons, reports.

Only accounts with `role = 'admin'` can sign in.

## Getting started

```bash
cd admin
npm install
cp .env.example .env     # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm run dev
```

Scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.

## Admin accounts

New admins register on `/register` with a **single-use invitation code**:

1. An existing admin opens **Profile → Team → Invite a member** and generates a code (valid 30 days).
2. The new admin signs up with that code; the database grants the admin role only if the code is valid.

First admin of a project: see [docs/deployment.md](../docs/deployment.md#first-admin).

## Structure

```
src/
├── components/   base/ (StatusBadge, SignedMedia…), feature/ (AdminLayout, Sidebar, TopHeader), ui/ (shadcn)
├── constants/    order statuses and journey steps
├── hooks/        useSupabaseOrders, useSupabaseLogistics, useSupabaseDisputes, useSupabaseFinance…
├── lib/          Supabase client, AuthContext (admin-only), internal supplier helper, export
└── pages/        one folder per route (orders, logistics, finance, moderation, delivery-videos, products…)
```

Routes: see [docs/apps.md](../docs/apps.md#admin-app-admin).

## Notes

- The **Lagos inspection** tab of the order modal uploads photos to the private `inspection-photos` bucket; "send to buyer" notifies the buyer and moves a `paid` order to `processing`.
- Every status change is recorded automatically in `order_tracking_events` (database trigger).
- Products created here are attributed to the internal supplier profile (`business_slug = 'trustlink-sourcing'`).

More: [docs/](../docs/README.md)
