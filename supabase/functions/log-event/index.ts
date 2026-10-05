// NEXULEX AI — WAVE G: anonymous product events and error reports.
//
// The app sends small batches of allow-listed events. The function re-validates everything, so a
// modified client cannot store free text, contract content or identifiers other than the random
// install id. No user id, email or IP address is stored.
//
// Deploy:  supabase functions deploy log-event --no-verify-jwt
// The EVENTS / PROP_KEYS lists must match services/telemetry.js (scripts/verify-ui.js checks this).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EVENTS = new Set([
  'app_open',
  'analysis_start',
  'analysis_done',
  'analysis_fail',
  'paywall_view',
  'purchase_start',
  'purchase_ok',
  'purchase_cancel',
  'purchase_fail',
  'restore_ok',
  'share_minted',
  'app_error',
  'consent_choice',
  'sample_loaded',
  'first_value',
  'reminder_set',
  'nudge_toggle',
  'invite_shared',
  'referral_redeem',
]);

const PROP_KEYS = new Set([
  'source',
  'category',
  'country',
  'lang',
  'tier',
  'plan',
  'code',
  'ms',
  'count',
  'ok',
  'screen',
  'msg',
  'hook',
  'signed_in',
]);

const MAX_BATCH = 25;
const MAX_BODY_BYTES = 16 * 1024;
const MAX_STRING = 120;
const DAILY_CAP_PER_INSTALL = 400;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const cleanString = (value: unknown, max = MAX_STRING) =>
  String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[email]')
    .replace(/\d{6,}/g, '#')
    .trim()
    .slice(0, max);

function cleanProps(input: unknown): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return out;
  for (const [key, raw] of Object.entries(input as Record<string, unknown>)) {
    if (!PROP_KEYS.has(key)) continue;
    if (typeof raw === 'boolean') out[key] = raw;
    else if (typeof raw === 'number' && Number.isFinite(raw)) out[key] = Math.round(raw);
    else if (typeof raw === 'string') out[key] = cleanString(raw);
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'METHOD' }, 405);

  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return json({ error: 'TOO_LARGE' }, 413);
    const body = JSON.parse(raw);

    const installId = String(body?.install_id || '');
    if (!/^[a-f0-9]{16,64}$/.test(installId)) return json({ error: 'BAD_INSTALL' }, 400);

    const list = Array.isArray(body?.events) ? body.events.slice(0, MAX_BATCH) : [];
    const appVersion = cleanString(body?.app_version, 20) || null;
    const platform = cleanString(body?.platform, 12) || null;
    const lang = cleanString(body?.lang, 8) || null;

    const rows = list
      .filter((e: { event?: unknown }) => typeof e?.event === 'string' && EVENTS.has(e.event))
      .map((e: { event: string; props?: unknown }) => ({
        install_id: installId,
        event: e.event,
        props: cleanProps(e.props),
        app_version: appVersion,
        platform,
        lang,
      }));

    if (!rows.length) return json({ stored: 0 });

    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return json({ error: 'SERVER_CONFIG' }, 500);
    const admin = createClient(url, key, { auth: { persistSession: false } });

    // Cheap abuse guard: one install cannot flood the table.
    const today = new Date().toISOString().slice(0, 10);
    const { count } = await admin
      .from('app_events')
      .select('id', { count: 'exact', head: true })
      .eq('install_id', installId)
      .eq('day', today);
    if ((count ?? 0) >= DAILY_CAP_PER_INSTALL) return json({ stored: 0, capped: true });

    const { error } = await admin.from('app_events').insert(rows);
    if (error) throw error;
    return json({ stored: rows.length });
  } catch (error) {
    console.error('log-event error:', error);
    // The app treats any failure as "try again later"; never leak details.
    return json({ error: 'FAILED' }, 500);
  }
});
