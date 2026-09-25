// NEXULEX AI — WAVE LR.5 plan sync.
//
// The only writer of profiles.plan / is_pro. It asks RevenueCat which entitlements the signed-in
// user really has and stores the result, so a client can never grant itself Pro or Professional.
//
//   supabase db push                              (migration 20260929120000_professional_tier.sql)
//   supabase secrets set REVENUECAT_SECRET_KEY=sk_...
//   supabase functions deploy sync-entitlement
// Secrets used: REVENUECAT_SECRET_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const REVENUECAT_API = 'https://api.revenuecat.com/v1/subscribers/';
const ENTITLEMENT_PRO = 'pro';
const ENTITLEMENT_PROFESSIONAL = 'professional';
// Rows written by an earlier sync or by the old client write; manual grants are never downgraded.
const DOWNGRADABLE_SOURCES = ['store', 'legacy'];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

type Entitlement = { expires_date?: string | null; grace_period_expires_date?: string | null };

function activeUntil(entitlement: Entitlement | undefined, now: number) {
  if (!entitlement) return { active: false, expires: null as string | null };
  const expires = entitlement.expires_date || null;
  const grace = entitlement.grace_period_expires_date || null;
  if (!expires) return { active: true, expires: null };
  const until = Math.max(Date.parse(expires) || 0, Date.parse(grace || '') || 0);
  return { active: until > now, expires: new Date(until).toISOString() };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'METHOD' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const anon = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const revenueCatKey = Deno.env.get('REVENUECAT_SECRET_KEY') || '';
  if (!supabaseUrl || !anon || !service || !revenueCatKey) return json({ error: 'CONFIG' }, 503);

  const userClient = createClient(supabaseUrl, anon, {
    global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
  });
  const { data: authData, error: authError } = await userClient.auth.getUser();
  const user = authData?.user;
  if (authError || !user) return json({ error: 'AUTH' }, 401);

  const admin = createClient(supabaseUrl, service);
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('plan, plan_source, plan_expires_at')
    .eq('id', user.id)
    .maybeSingle();
  if (profileError) return json({ error: 'UNAVAILABLE' }, 503);
  if (!profile) return json({ plan: 'free', source: 'none', expiresAt: null });

  let subscriber: { entitlements?: Record<string, Entitlement> } | null = null;
  try {
    const response = await fetch(`${REVENUECAT_API}${encodeURIComponent(user.id)}`, {
      headers: { Authorization: `Bearer ${revenueCatKey}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      console.error('sync-entitlement revenuecat', response.status);
      return json({ error: 'UNAVAILABLE' }, 503);
    }
    const payload = await response.json().catch(() => null);
    subscriber = payload?.subscriber || null;
  } catch (error) {
    console.error('sync-entitlement revenuecat failure', error instanceof Error ? error.name : 'unknown');
    return json({ error: 'UNAVAILABLE' }, 503);
  }
  if (!subscriber) return json({ error: 'UNAVAILABLE' }, 503);

  const now = Date.now();
  const professional = activeUntil(subscriber.entitlements?.[ENTITLEMENT_PROFESSIONAL], now);
  const pro = activeUntil(subscriber.entitlements?.[ENTITLEMENT_PRO], now);

  let next: { plan: string; plan_source: string; plan_expires_at: string | null } | null = null;
  if (professional.active) next = { plan: 'professional', plan_source: 'store', plan_expires_at: professional.expires };
  else if (pro.active) next = { plan: 'pro', plan_source: 'store', plan_expires_at: pro.expires };
  else if (DOWNGRADABLE_SOURCES.includes(String(profile.plan_source)) && profile.plan !== 'free') {
    next = { plan: 'free', plan_source: 'none', plan_expires_at: null };
  }

  if (!next) {
    await admin.from('profiles').update({ plan_synced_at: new Date(now).toISOString() }).eq('id', user.id);
    return json({ plan: profile.plan, source: profile.plan_source, expiresAt: profile.plan_expires_at });
  }

  const { error: updateError } = await admin
    .from('profiles')
    .update({
      ...next,
      is_pro: next.plan !== 'free',
      plan_synced_at: new Date(now).toISOString(),
      updated_at: new Date(now).toISOString(),
    })
    .eq('id', user.id);
  if (updateError) return json({ error: 'UNAVAILABLE' }, 503);

  return json({ plan: next.plan, source: next.plan_source, expiresAt: next.plan_expires_at });
});
