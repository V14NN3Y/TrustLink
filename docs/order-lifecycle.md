# Order lifecycle, escrow and delivery tracking

## Statuses and buyer-facing steps

| `orders.status` | Tracking step (`delivery_steps`) | Who moves it there |
|---|---|---|
| `pending` | ordered | `create_checkout_order` |
| `paid` | paid — *Payment secured* | `verify-payment` Edge Function, or an admin |
| `processing` | inspection — *Lagos inspection* | automatically when an inspection photo is added, or an admin |
| `in_transit` | in_transit — *Lagos → Cotonou* | admin |
| `delivered` | delivered | admin (sets `delivered_at`) |
| `confirmed` | confirmed | buyer (`confirm_order_receipt`), admin, or auto-confirm after 48h if enabled |
| `disputed` | disputed | buyer (`open_order_dispute`) or admin |
| `refunded` / `cancelled` | refunded / cancelled | admin |

Every change is recorded in `order_tracking_events` by a trigger, whoever makes it.

## Step by step

1. **Checkout** — the buyer validates the cart. `create_checkout_order` creates one order per seller under a common `group_id` (today there is a single internal supplier, so usually one order) and returns the total.
2. **Payment** — KkiaPay (card / Mobile Money) is opened with the server total. Offline methods (MTN, Moov, Wave) leave the order `pending` until an admin confirms the transfer.
3. **Verification** — `verify-payment` checks the transaction with KkiaPay and marks the group `paid`. If it cannot (function not deployed, KkiaPay down), the reference is stored and an admin validates from the KkiaPay dashboard.
4. **Sourcing and inspection** — the team buys the item in Nigeria. The Lagos agent photographs it; the photo is uploaded in the admin order modal (*Lagos inspection* tab). With "send to buyer" ticked, the buyer is notified and sees the photo in their order.
5. **Transit** — the order is grouped in a dispatch (trip) Lagos → Cotonou and moved to `in_transit`, then `delivered`.
6. **Unboxing** — the buyer films the opening of the parcel in the app and declares it compliant (`confirmed`) or defective (dispute).
7. **48-hour window** — reminders are sent automatically:
   - delivery + 24h: "24h left to check your parcel";
   - delivery + 48h: "48h window over" (and, if `escrow_config.auto_release` is true, the order is confirmed automatically).
   After 48h a buyer can no longer open a dispute; an admin still can.
8. **Disputes** — the admin compares the Lagos photo with the unboxing video (dispute centre) and resolves: refund (`resolved_refund` → order `refunded`) or no refund (`resolved_no_refund` → order `confirmed`).

## Amounts

```
subtotal    = Σ product price × quantity            (XOF)
commission  = round(subtotal × spread_pct / 100)    (escrow fee)
total       = subtotal + delivery_fee + commission − coupon discount
```

Configured in `escrow_config` (admin → Finance). Product prices are stored as the item price only; the import script converts the Nigerian price with the `exchange_rates` NGN→XOF rate.
