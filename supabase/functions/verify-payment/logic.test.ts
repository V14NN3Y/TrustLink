// Run: node --experimental-strip-types --test supabase/functions/verify-payment/logic.test.ts
//  or: deno test supabase/functions/verify-payment/logic.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decide, validateInput } from './logic.ts';

const G = '30000000-0000-0000-0000-000000000001';
const pending = [
  { id: 'a', status: 'pending', total_amount: '300000.00', payment_reference: null },
  { id: 'b', status: 'pending', total_amount: 190462, payment_reference: null },
];

test('validates input', () => {
  assert.deepEqual(validateInput({ group_id: G, transaction_id: 'Tx_123' }), { groupId: G, transactionId: 'Tx_123' });
  assert.ok('error' in validateInput({ group_id: 'x', transaction_id: 'Tx_123' }));
  assert.ok('error' in validateInput({ group_id: G, transaction_id: "x'; drop" }));
  assert.ok('error' in validateInput(null));
});

test('marks paid when KkiaPay confirms the full amount', () => {
  const d = decide({ orders: pending, transactionId: 'T1', usedByOtherGroup: false, kkiapay: { status: 'SUCCESS', amount: 490462 } });
  assert.deepEqual(d, { action: 'mark_paid', expected: 490462, paid: 490462 });
});

test('rejects an underpaid, failed or unknown transaction', () => {
  assert.equal(decide({ orders: pending, transactionId: 'T1', usedByOtherGroup: false, kkiapay: { status: 'SUCCESS', amount: 1 } }).action, 'reject');
  const failed = decide({ orders: pending, transactionId: 'T1', usedByOtherGroup: false, kkiapay: { status: 'FAILED', amount: 490462 } });
  assert.equal(failed.action === 'reject' && failed.reason, 'transaction_failed');
  assert.equal(decide({ orders: pending, transactionId: 'T1', usedByOtherGroup: false, kkiapay: null }).action, 'reject');
});

test('rejects a transaction replayed on another order group', () => {
  const d = decide({ orders: pending, transactionId: 'T1', usedByOtherGroup: true, kkiapay: { status: 'SUCCESS', amount: 490462 } });
  assert.equal(d.action === 'reject' && d.reason, 'transaction_already_used');
});

test('is idempotent once paid with the same transaction', () => {
  const paid = pending.map((o) => ({ ...o, status: 'paid', payment_reference: 'T1' }));
  assert.deepEqual(decide({ orders: paid, transactionId: 'T1', usedByOtherGroup: false, kkiapay: null }), { action: 'already_paid' });
  assert.equal(decide({ orders: paid, transactionId: 'T2', usedByOtherGroup: false, kkiapay: null }).action, 'reject');
  assert.equal(decide({ orders: [], transactionId: 'T1', usedByOtherGroup: false, kkiapay: null }).action, 'reject');
});
