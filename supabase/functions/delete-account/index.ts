// NexuLex AI — in-app account deletion (App Store 5.1.1(v) / Google Play). JWT required. Anthropic yok.
// The user id is taken only from the verified access token; a body-supplied id is rejected.
// Free-quota claim rows and the public shared-viewer bucket are intentionally left untouched:
// claim rows lose their user link via ON DELETE SET NULL, so re-registering cannot reset free usage.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const isUserMissing = (error: { status?: number; code?: string; message?: string } | null) =>
  !!error &&
  (error.code === 'user_not_found' ||
    error.status === 404 ||
    /user.*(not found|does not exist)|sub claim/i.test(String(error.message || '')));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'METHOD' }, 405);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!supabaseUrl || !service) return json({ error: 'CONFIG' }, 500);

    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
    if (!token) return json({ error: 'AUTH' }, 401);

    const body = await req.json().catch(() => ({}));
    if (body && typeof body === 'object' && ('userId' in body || 'user_id' in body)) {
      return json({ error: 'USER_ID_NOT_ACCEPTED' }, 400);
    }

    const admin = createClient(supabaseUrl, service, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: authData, error: authError } = await admin.auth.getUser(token);
    if (isUserMissing(authError)) return json({ ok: true });
    const userId = authData?.user?.id;
    if (authError || !userId) return json({ error: 'AUTH' }, 401);

    const analyses = await admin.from('analyses').delete().eq('user_id', userId);
    if (analyses.error) return json({ error: 'DELETE_ANALYSES' }, 500);

    const support = await admin.from('support_messages').delete().eq('user_id', userId);
    if (support.error) return json({ error: 'DELETE_SUPPORT' }, 500);

    // Cascades: profiles, analysis_shares, contract_reminders, advisor_seats, advisor_briefs.
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError && !isUserMissing(deleteError)) return json({ error: 'DELETE_USER' }, 500);

    return json({ ok: true });
  } catch {
    return json({ error: 'DELETE_FAILED' }, 500);
  }
});
