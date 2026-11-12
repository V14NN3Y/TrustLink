// Supabase Edge Function : vérifie un paiement KkiaPay côté serveur et passe la
// commande en 'paid' (audit #6 — avant, seul l'admin pouvait le faire à la main).
//
// Appelée par le checkout acheteur juste après le succès du widget KkiaPay :
//   supabase.functions.invoke('verify-payment', { body: { group_id, transaction_id } })
//
// Déploiement :
//   supabase functions deploy verify-payment
//   supabase secrets set KKIAPAY_PUBLIC_KEY=... KKIAPAY_PRIVATE_KEY=... KKIAPAY_SECRET_KEY=... KKIAPAY_SANDBOX=true
// (SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont fournis automatiquement par Supabase.)
//
// API KkiaPay : POST {base}/api/v1/transactions/status, body { transactionId },
// en-têtes x-api-key (clé publique), x-private-key, x-secret-key — identique au
// SDK officiel @kkiapay-org/nodejs-sdk.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { decide, validateInput, type KkiapayTransaction, type OrderRow } from './logic.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

async function fetchKkiapayTransaction(transactionId: string): Promise<KkiapayTransaction | null> {
  const sandbox = (Deno.env.get('KKIAPAY_SANDBOX') ?? 'true') !== 'false';
  const base = sandbox ? 'https://api-sandbox.kkiapay.me' : 'https://api.kkiapay.me';
  const res = await fetch(`${base}/api/v1/transactions/status`, {
    method: 'POST',
    signal: AbortSignal.timeout(10_000),
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': Deno.env.get('KKIAPAY_PUBLIC_KEY') ?? '',
      'x-private-key': Deno.env.get('KKIAPAY_PRIVATE_KEY') ?? '',
      'x-secret-key': Deno.env.get('KKIAPAY_SECRET_KEY') ?? '',
    },
    body: JSON.stringify({ transactionId }),
  });
  if (res.status === 404 || res.status === 400) return null; // transaction inconnue
  if (!res.ok) throw new Error(`kkiapay_http_${res.status}`);
  return await res.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  for (const key of ['KKIAPAY_PUBLIC_KEY', 'KKIAPAY_PRIVATE_KEY', 'KKIAPAY_SECRET_KEY']) {
    if (!Deno.env.get(key)) return json({ error: 'payment_verification_not_configured' }, 503);
  }

  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!jwt) return json({ error: 'unauthorized' }, 401);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
  if (userErr || !userData?.user) return json({ error: 'unauthorized' }, 401);
  const buyerId = userData.user.id;

  let body: unknown;
  try { body = await req.json(); } catch { return json({ error: 'invalid_body' }, 400); }
  const input = validateInput(body);
  if ('error' in input) return json({ error: input.error }, 400);

  const { data: orders, error: ordErr } = await admin
    .from('orders')
    .select('id, status, total_amount, payment_reference')
    .eq('group_id', input.groupId)
    .eq('buyer_id', buyerId);
  if (ordErr) return json({ error: 'db_error' }, 500);

  const { count: reuse, error: reuseErr } = await admin
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('payment_reference', input.transactionId)
    .neq('group_id', input.groupId);
  if (reuseErr) return json({ error: 'db_error' }, 500);

  const needsKkiapay = (orders ?? []).some((o) => o.status === 'pending');
  let kkiapay: KkiapayTransaction | null = null;
  if (needsKkiapay && !reuse) {
    try {
      kkiapay = await fetchKkiapayTransaction(input.transactionId);
    } catch (e) {
      console.error('[verify-payment] KkiaPay unreachable', e);
      return json({ error: 'kkiapay_unreachable' }, 502);
    }
  }

  const decision = decide({ orders: (orders ?? []) as OrderRow[], transactionId: input.transactionId, usedByOtherGroup: (reuse ?? 0) > 0, kkiapay });

  if (decision.action === 'reject') {
    // Garde la trace pour l'admin, sans valider la commande.
    if (decision.reason !== 'transaction_already_used') {
      await admin.from('orders').update({ payment_reference: input.transactionId })
        .eq('group_id', input.groupId).eq('buyer_id', buyerId).eq('status', 'pending');
    }
    return json({ paid: false, reason: decision.reason }, decision.httpStatus);
  }
  if (decision.action === 'already_paid') return json({ paid: true, already: true });

  const { error: updErr } = await admin
    .from('orders')
    .update({ status: 'paid', payment_reference: input.transactionId, payment_method: 'kkiapay' })
    .eq('group_id', input.groupId)
    .eq('buyer_id', buyerId)
    .eq('status', 'pending');
  if (updErr) return json({ error: 'db_error' }, 500);

  await admin.from('notifications').insert({
    user_id: buyerId,
    type: 'payment_received',
    title: 'Paiement confirmé',
    body: 'Votre paiement est sécurisé en séquestre. Nous préparons votre commande.',
    resource_type: 'order',
    resource_id: (orders ?? [])[0]?.id ?? null,
  });

  return json({ paid: true, amount: decision.paid });
});
