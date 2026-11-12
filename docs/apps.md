# Applications and features

## Buyer app (`buyer/`)

### Routes

| Route | Access | Page |
|---|---|---|
| `/` | public | Marketplace: hero, category bar, product grid, search (`?search=`) |
| `/product/:id` | public | Product: gallery, variants, stock, reviews, Q&A, stock alert, similar products |
| `/faq`, `/help`, `/support` | public | FAQ, help centre, support messaging (threads with an admin) |
| `/escrow`, `/policy/returns`, `/legal` | public | How escrow works, returns policy, legal pages |
| `/login`, `/register`, `/forgot-password`, `/auth/reset-password`, `/auth/callback` | public | Email/password and Google OAuth |
| `/cart` | signed in | Cart with quantities and totals preview |
| `/checkout` | signed in | 1. address → 2. payment → 3. confirmation |
| `/account` | signed in | Orders (tracking, Lagos inspection photos, confirm delivery, dispute), wishlist, disputes, settings |
| `/wishlist`, `/notifications`, `/invoice/:id` | signed in | Wishlist, notification centre (realtime), invoice |

### Key flows

- **Checkout** — `createOrder()` calls the `create_checkout_order` RPC, which computes every amount server-side. Online payment opens the KkiaPay widget with the **server** total; on success the app stores the transaction reference (`record_payment_reference`) and asks the `verify-payment` Edge Function to confirm it.
- **Lagos inspection** — `InspectionPhotos` shows the photos the team shared for the order (signed URLs, private bucket).
- **Delivery confirmation** — `ConfirmDeliveryModal` records an unboxing video (MediaRecorder → WebM → `delivery-videos` bucket), then either `confirm_order_receipt` or `open_order_dispute`.
- **Notifications** — realtime subscription on `notifications`; bell in the header and `/notifications` page.
- **i18n / currency** — French and English (`src/lib/i18n.js`); prices shown in FCFA, NGN rate from `exchange_rates` refreshed periodically.

## Admin app (`admin/`)

Only profiles with `role = 'admin'` can sign in. New admins register with an invitation code generated in **Profile → Team**.

| Route | Purpose |
|---|---|
| `/` | Dashboard: KPIs, volume chart, recent activity |
| `/orders` | Orders table, status changes (buyer notified), order modal with **Journey**, **Lagos inspection** (upload + share photo with the buyer) and dispute video tabs |
| `/orders/dispatch` | Dispatch queue |
| `/logistics` | Trips (dispatches) Lagos → Cotonou, manifest, parcel timeline |
| `/finance` | Escrow bridge (rate, spread), payouts, audit trail |
| `/moderation` | Catalogue inspection, dispute centre (Lagos photo next to the buyer's video) |
| `/delivery-videos` | Review unboxing videos, mark compliant / defective |
| `/products`, `/products/new`, `/categories` | Catalogue management for the internal supplier |
| `/users` | Users, KYC flags |
| `/messages` | Conversations with buyers |
| `/coupons`, `/payment-methods`, `/delivery-cities` | Checkout configuration |
| `/reviews`, `/questions`, `/stock-notifications` | Moderation of reviews, product Q&A, stock alerts |
| `/reports`, `/analytics`, `/activity-calendar`, `/admin-logs` | Reporting and audit log |
| `/announcements`, `/maintenance`, `/notifications`, `/profile` | Site announcements, maintenance mode, notifications, profile and team |

## Seller app (`seller/`)

Not deployed since the October 2026 sourcing pivot (seller sign-up closed). The code is kept as a reference for a possible future "restricted admin" role.
