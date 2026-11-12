// Supabase Edge Function : aperçu d'un lien produit (Konga / Jumia) pour « Sourcing par lien ».
// Déploiement : supabase functions deploy sourcing-preview
import { createClient } from 'npm:@supabase/supabase-js@2';
import { parseProductPage, validateSourceUrl } from './parse.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const MAX_BYTES = 1_500_000;
const MAX_REDIRECTS = 3;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

// Redirections suivies à la main : chaque saut doit rester sur un domaine autorisé (anti-SSRF).
async function fetchAllowed(start: URL): Promise<Response> {
  let url = start;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const res = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TrustLinkBot/1.0; +https://trustlink.bj)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
      },
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      const next = loc ? validateSourceUrl(new URL(loc, url).toString()) : null;
      if (!next) throw new Error('redirect_not_allowed');
      url = next;
      continue;
    }
    return res;
  }
  throw new Error('too_many_redirects');
}

async function readCapped(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    total += value.length;
    chunks.push(value);
    if (total >= MAX_BYTES) { await reader.cancel(); break; }
  }
  const all = new Uint8Array(Math.min(total, MAX_BYTES));
  let off = 0;
  for (const c of chunks) {
    const part = c.subarray(0, Math.max(0, all.length - off));
    all.set(part, off);
    off += part.length;
  }
  return new TextDecoder('utf-8').decode(all);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  // Réservé aux utilisateurs connectés (la clé anon seule ne suffit pas)
  const authHeader = req.headers.get('Authorization') ?? '';
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: 'unauthorized' }, 401);

  let body: { url?: unknown };
  try { body = await req.json(); } catch { return json({ error: 'invalid_json' }, 400); }

  const target = validateSourceUrl(body.url);
  if (!target) return json({ error: 'unsupported_url' }, 422);

  try {
    const res = await fetchAllowed(target);
    if (!res.ok) return json({ error: 'source_unavailable', status: res.status }, 502);
    if (!(res.headers.get('content-type') ?? '').includes('html')) return json({ error: 'not_html' }, 502);
    const preview = parseProductPage(await readCapped(res), target.toString());
    if (!preview.title && !preview.price) return json({ error: 'no_product_found' }, 422);
    return json({ ...preview, host: target.hostname });
  } catch {
    return json({ error: 'fetch_failed' }, 502);
  }
});
