# Architecture

## Overview

```
 Buyer app (React/Vite)      Admin app (React/Vite)
        │  anon key + user JWT         │
        └───────────────┬──────────────┘
                        ▼
                  Supabase project
   ┌──────────────┬───────────────┬───────────────┬──────────────┐
   │ Auth         │ PostgreSQL    │ Storage       │ Edge Function│
   │ (email,      │ tables + RLS, │ product-images│ verify-payment│
   │  Google)     │ RPCs, triggers│ avatars, KYC, │ (Deno)       │
   │              │ pg_cron job   │ delivery-     │      │       │
   │              │               │ videos,       │      ▼       │
   │              │               │ inspection-   │   KkiaPay API│
   │              │               │ photos        │              │
   └──────────────┴───────────────┴───────────────┴──────────────┘
        ▲
        │ service-role key (never shipped in an app)
   scripts/ (internal supplier, product import)
```

There is no custom backend server. The apps talk to Supabase directly with the public anon key; **row-level security (RLS)** decides what each user can read or write. Anything a client must not be trusted with runs server-side:

| Concern | Where it runs |
|---|---|
| Who is admin | `handle_new_user` trigger + `invitation_codes` |
| Order amounts | `create_checkout_order` RPC |
| Payment confirmation | `verify-payment` Edge Function (KkiaPay API) |
| Order status changes by buyers | `confirm_order_receipt`, `open_order_dispute` RPCs |
| Delivery tracking history | `trg_orders_tracking_event` trigger |
| Lagos inspection side effects | `trg_order_inspection_added` trigger |
| 48h reminders | `send_delivery_reminders()` run by pg_cron |

## Frontend stack

React 18, Vite, React Router 6, Tailwind CSS + shadcn/ui (Radix), TanStack Query (buyer), Supabase JS v2, Remix Icon. Each app is an independent Vite project with its own `package.json` and `.env`, deployed on Vercel (`vercel.json` rewrites every path to `index.html`).

Data access lives in:
- buyer: `buyer/src/lib/supabase/*.js` (one module per entity) wrapped by hooks in `buyer/src/hooks/`
- admin: hooks in `admin/src/hooks/useSupabase*.js`

## Business model in one paragraph

The buyer pays the item price + a flat delivery fee + an escrow commission (`escrow_config.spread_pct`) − an optional coupon. The money stays in escrow. TrustLink buys the item in Nigeria, an agent photographs it in Lagos (inspection), it travels to Cotonou and is delivered. The buyer films the unboxing and either confirms (funds released) or opens a dispute within 48 hours; an admin reviews the video and refunds or closes the case. Details: [order-lifecycle.md](order-lifecycle.md).

## Roles

| Role | Who | App |
|---|---|---|
| `buyer` | anyone who signs up | buyer |
| `admin` | TrustLink team, created with an invitation code | admin |
| `seller` | only the internal supplier profile *TrustLink Sourcing* (never logs in) | — |
