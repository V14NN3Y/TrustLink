# TrustLink — Buyer app

Shopping app of the TrustLink cross-border marketplace (Nigeria → Benin): catalogue, cart, escrow checkout with KkiaPay, order tracking with the Lagos inspection photo, unboxing video and disputes.

## Stack

React 18 · Vite · React Router 6 · Tailwind CSS + shadcn/ui · TanStack Query · Supabase JS v2 · KkiaPay widget · Remix Icon

## Getting started

```bash
cd buyer
npm install
cp .env.example .env
npm run dev
```

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL (Project Settings → API) |
| `VITE_SUPABASE_ANON_KEY` | Public anon key — RLS protects the data |
| `VITE_KKIAPAY_PUBLIC_KEY` | KkiaPay **public** key |
| `VITE_KKIAPAY_SANDBOX` | `true` for test payments, `false` in production |

| Script | |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (`dist/`) |
| `npm run preview` | Serve the build locally |
| `npm run lint` | ESLint |

## Structure

```
src/
├── components/       ui/ (shadcn), feature/ (Header, Footer, NotificationBell…), ProtectedRoute
├── hooks/            useCart, useOrders, useProducts, useWishlist, useCurrency…
├── lib/
│   ├── supabase/     one data module per entity (cart, orders, products, tracking, disputes…)
│   ├── AuthContext, CurrencyContext, I18nContext, i18n.js (fr / en)
│   └── kkiapay.js    payment widget wrapper
├── pages/            home, product, cart, checkout, account, wishlist, notifications, support, faq, help, legal, escrow, returns, invoice, auth
└── router/           routes (public / protected)
```

## Routes

See [docs/apps.md](../docs/apps.md#buyer-app-buyer).

## Rules to keep in mind

- **Orders** are created only through `createOrder()` → `create_checkout_order` RPC. Use the returned `totalAmount` for payment; the totals on screen are a preview.
- **Payment**: after the KkiaPay widget succeeds, call `recordPaymentReference()` then `verifyPayment()`.
- **Status changes** go through RPCs (`confirm_order_receipt`, `open_order_dispute`); buyers cannot update `orders`.
- **Private media** (unboxing videos, inspection photos) are shown with signed URLs.
- UI text is in French with an English translation in `src/lib/i18n.js`; code and comments are in English.

More: [docs/](../docs/README.md)
