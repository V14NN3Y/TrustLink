# Server API

Apps call these with `supabase.rpc(name, params)` or `supabase.functions.invoke(name, { body })`. All functions below are `SECURITY DEFINER` and re-check the caller themselves.

## Buyer RPCs

### `create_checkout_order(p_items, p_shipping, p_payment_method, p_coupon_code)`
Creates the order(s) for a checkout. The **only** way for a buyer to create an order.

| Param | Type | Example |
|---|---|---|
| `p_items` | jsonb | `[{"product_id": "<uuid>", "quantity": 2}]` |
| `p_shipping` | jsonb | `{"district": "Akpakpa", "city": "Cotonou", "phone": "+229…"}` |
| `p_payment_method` | text | an active `payment_methods.code` (`kkiapay`, `mtn`…) |
| `p_coupon_code` | text, optional | `PROMO10` |

Returns `{ group_id, order_ids, subtotal, delivery_fee, commission_amount, coupon_discount, total_amount, seller_count }`.
Computes `subtotal = Σ price × quantity`, `commission = round(subtotal × spread_pct / 100)`, applies and counts the coupon, splits fees pro rata across sellers (the last order absorbs rounding). Errors (French, shown to the buyer): empty cart, missing city, unavailable payment method, invalid quantity, unpublished product, insufficient stock, invalid / expired / exhausted coupon, minimum amount not reached.

### `record_payment_reference(p_group_id, p_reference, p_method)`
Stores the KkiaPay transaction reference on the caller's pending orders. Does **not** mark them paid.

### `confirm_order_receipt(p_order_id)`
Buyer declares the parcel compliant: orders of the group move from `delivered` / `in_transit` to `confirmed`.

### `open_order_dispute(p_order_id, p_reason, p_video_url, p_duration_seconds)`
Stores the unboxing video, opens the dispute and moves the group to `disputed` in one transaction. Rejected more than 48h after delivery (admins exempt). Returns the dispute id.

### `get_support_admin_id()`
Returns an admin id to address a support message to, without exposing `profiles`.

## Shared helpers

| Function | Returns |
|---|---|
| `ngn_to_xof(amount_ngn)` | Amount converted at the current `exchange_rates` rate, rounded |
| `all_inclusive_price_xof(price_xof)` | Item + delivery fee + customs + escrow commission (same formula as the buyer price display) |
| `order_status_to_step(status)` | Tracking step code for an order status |
| `is_admin(user_id)` | Whether the user is an admin |

## Admin RPCs

| Function | Purpose |
|---|---|
| `generate_invitation_code()` | New single-use admin invitation code, valid 30 days (admins only) |

## Scheduled

| Function | Caller | Purpose |
|---|---|---|
| `send_delivery_reminders()` | pg_cron every 15 min (`trustlink-delivery-reminders`) | 24h reminder and 48h notice after delivery; auto-confirm when `escrow_config.auto_release` is on. Returns the number of notifications sent. Not callable by app users |

## Edge Function `verify-payment`

`POST /functions/v1/verify-payment` with the buyer's JWT.

```json
{ "group_id": "<uuid>", "transaction_id": "<KkiaPay transaction id>" }
```

1. Loads the caller's orders of the group.
2. Refuses a transaction id already used by another order group.
3. Asks KkiaPay (`POST /api/v1/transactions/status`) for the transaction.
4. Requires `status = SUCCESS` and `amount ≥ Σ total_amount` (1 FCFA tolerance).
5. Moves the group to `paid`, stores the reference, notifies the buyer (`payment_received`).

| Response | Meaning |
|---|---|
| `200 { paid: true, amount }` | Order paid |
| `200 { paid: true, already: true }` | Already paid with this transaction (idempotent) |
| `402 { paid: false, reason }` | Transaction failed / unknown / amount too low (reference kept for the admin) |
| `409 { paid: false, reason }` | Transaction reused, or order not pending |
| `401`, `400`, `503`, `502` | Not signed in, bad body, KkiaPay keys missing, KkiaPay unreachable |
