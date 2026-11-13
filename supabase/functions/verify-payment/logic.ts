// Pure decision logic of the verify-payment Edge Function (unit-tested in logic.test.ts).

export type KkiapayTransaction = {
  status?: string;
  amount?: number | string;
  transactionId?: string;
  [key: string]: unknown;
};

export type OrderRow = { id: string; status: string; total_amount: number | string; payment_reference: string | null };

export type Decision =
  | { action: 'mark_paid'; expected: number; paid: number }
  | { action: 'already_paid' }
  | { action: 'reject'; reason: string; httpStatus: number };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateInput(body: unknown): { groupId: string; transactionId: string } | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'invalid_body' };
  const { group_id, transaction_id } = body as Record<string, unknown>;
  if (typeof group_id !== 'string' || !UUID_RE.test(group_id)) return { error: 'invalid_group_id' };
  if (typeof transaction_id !== 'string' || !/^[A-Za-z0-9_-]{3,100}$/.test(transaction_id)) return { error: 'invalid_transaction_id' };
  return { groupId: group_id, transactionId: transaction_id };
}

/**
 * Decides what to do with a buyer's order group given KkiaPay's answer.
 * - every order of the group must belong to the caller (checked by the query)
 * - the transaction must be SUCCESS and cover the server-computed total
 * - a transaction id already used by another group is refused (replay)
 */
export function decide(params: {
  orders: OrderRow[];
  transactionId: string;
  usedByOtherGroup: boolean;
  kkiapay: KkiapayTransaction | null;
}): Decision {
  const { orders, transactionId, usedByOtherGroup, kkiapay } = params;
  if (!orders.length) return { action: 'reject', reason: 'order_not_found', httpStatus: 404 };
  if (usedByOtherGroup) return { action: 'reject', reason: 'transaction_already_used', httpStatus: 409 };

  const pending = orders.filter((o) => o.status === 'pending');
  if (!pending.length) {
    const allPaidWithThisTx = orders.every((o) => o.payment_reference === transactionId && o.status !== 'cancelled');
    return allPaidWithThisTx ? { action: 'already_paid' } : { action: 'reject', reason: 'order_not_pending', httpStatus: 409 };
  }
  if (pending.length !== orders.length) return { action: 'reject', reason: 'order_group_inconsistent', httpStatus: 409 };

  if (!kkiapay) return { action: 'reject', reason: 'transaction_not_found', httpStatus: 402 };
  if (String(kkiapay.status || '').toUpperCase() !== 'SUCCESS') {
    return { action: 'reject', reason: `transaction_${String(kkiapay.status || 'unknown').toLowerCase()}`, httpStatus: 402 };
  }

  const expected = Math.round(orders.reduce((s, o) => s + Number(o.total_amount || 0), 0));
  const paid = Math.round(Number(kkiapay.amount));
  if (!Number.isFinite(paid)) return { action: 'reject', reason: 'amount_missing', httpStatus: 402 };
  // 1 FCFA of tolerance for rounding on the widget side.
  if (paid + 1 < expected) return { action: 'reject', reason: 'amount_too_low', httpStatus: 402 };

  return { action: 'mark_paid', expected, paid };
}
