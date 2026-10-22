// One-off script: creates the internal "fournisseur interne" account that all
// admin-created products are attributed to (seller_id), since TrustLink no
// longer onboards external sellers.
//
// Run once per environment (dev/staging/prod), manually, with the
// Supabase service-role key. Safe to re-run: it's idempotent (does nothing
// if a profile with the target business_slug already exists).
//
// Usage:
//   cd scripts && npm install
//   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx node create-internal-supplier.mjs
//
// The service-role key is found in the Supabase dashboard under
// Project Settings > API > service_role (secret). Never commit it, never put
// it in a .env file an app ships with — it bypasses RLS entirely.

import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BUSINESS_SLUG = 'trustlink-sourcing';
const EMAIL = 'sourcing@trustlink.internal';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: existing, error: lookupError } = await supabase
    .from('profiles')
    .select('id, business_slug')
    .eq('business_slug', BUSINESS_SLUG)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Lookup failed: ${lookupError.message}`);
  }

  if (existing) {
    console.log(`Internal supplier profile already exists: id=${existing.id}, business_slug=${existing.business_slug}`);
    return;
  }

  const randomPassword = crypto.randomBytes(24).toString('base64url');

  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: randomPassword,
    email_confirm: true,
    user_metadata: { role: 'seller', internal: true },
  });

  if (userError) {
    throw new Error(`auth.admin.createUser failed: ${userError.message}`);
  }

  const userId = userData.user.id;

  // The `handle_new_user` trigger auto-creates a `profiles` row on signup;
  // update it with the internal-supplier business details rather than
  // inserting a duplicate row.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({
      role: 'seller',
      full_name: 'TrustLink Sourcing',
      business_name: 'TrustLink Sourcing',
      business_slug: BUSINESS_SLUG,
      business_description: 'Fournisseur interne TrustLink — produits sourcés et publiés directement par l\'équipe TrustLink.',
      kyc_identity_verified: true,
      kyc_address_verified: true,
      kyc_business_verified: true,
    })
    .eq('id', userId)
    .select('id, business_slug')
    .single();

  if (profileError) {
    throw new Error(`profiles update failed (user ${userId} was created in auth.users): ${profileError.message}`);
  }

  console.log(`Internal supplier created: id=${profile.id}, business_slug=${profile.business_slug}`);
  console.log('This account has no usable password and is never meant to log in through any app.');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
