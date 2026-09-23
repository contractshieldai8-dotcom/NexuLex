// NexuLex AI — view-only brief mint. JWT zorunlu. Anthropic yok.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AUDIENCES = ['household', 'advisor', 'counterparty'] as const;
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const FREE_ACTIVE = 1;
const PRO_ACTIVE = 25;

const DISCLAIMERS: Record<string, string> = {
  tr: 'Genel bilgidir, hukuki tavsiye değildir.',
  en: 'General information, not legal advice.',
  de: 'Allgemeine Information, keine Rechtsberatung.',
  fr: 'Information générale, pas un conseil juridique.',
  es: 'Información general, no es asesoramiento jurídico.',
  ar: 'معلومات عامة وليست استشارة قانونية.',
  it: 'Informazione generale, non consulenza legale.',
  zh: '一般信息，并非法律意见。',
  ru: 'Общая информация, не юридическая консультация.',
  fa: 'اطلاعات عمومی است، مشاوره حقوقی نیست.',
  ja: '一般情報であり、法的助言ではありません。',
  pt: 'Informação geral, não é aconselhamento jurídico.',
  nl: 'Algemene informatie, geen juridisch advies.',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const asArray = (value: unknown) => (Array.isArray(value) ? value : []);
const asObject = (value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

const collapse = (text: unknown) => String(text || '').replace(/\s+/g, ' ').trim();

const clipSentences = (text: unknown, max = 3) => {
  const raw = collapse(text);
  if (!raw) return '';
  const parts: string[] = [];
  let buf = '';
  for (let i = 0; i < raw.length; i += 1) {
    buf += raw[i];
    if (/[.!?…]/.test(raw[i])) {
      const piece = buf.trim();
      if (piece) parts.push(piece);
      buf = '';
      if (parts.length >= max) return parts.join(' ');
    }
  }
  if (buf.trim() && parts.length < max) parts.push(buf.trim());
  return parts.slice(0, max).join(' ');
};

const pickFlags = (analysis: Record<string, unknown>) =>
  asArray(analysis.redFlags || analysis.red_flags)
    .map((flag) => {
      const row = asObject(flag) || {};
      return {
        title: String(row.title || row.clauseTitle || '').trim(),
        severity: String(row.severity || row.riskLevel || 'RED').toUpperCase(),
        explanation: String(row.explanation || row.issue || '').trim(),
        counterOffer: String(row.counterOffer || row.counter_offer || '').trim(),
      };
    })
    .filter((flag) => flag.title || flag.explanation || flag.counterOffer)
    .slice(0, 4);

const pickMissing = (analysis: Record<string, unknown>) =>
  asArray(analysis.missingProtections || analysis.missing_protections)
    .map((item) => {
      const row = asObject(item) || {};
      return {
        playbookId: String(row.playbookId || row.playbook_id || '').trim(),
        status: String(row.status || '').toUpperCase(),
        whyItHurts: String(row.whyItHurts || row.why_it_hurts || '').trim(),
        insertClause: String(row.insertClause || row.insert_clause || '').trim(),
      };
    })
    .filter((item) => item.playbookId || item.whyItHurts || item.insertClause)
    .slice(0, 5);

const pickTrap = (analysis: Record<string, unknown>) => {
  const calendar = asObject(analysis.trapCalendar || analysis.trap_calendar);
  if (calendar && Object.keys(calendar).length) {
    const trap: Record<string, { date_or_rule: string; note: string }> = {};
    Object.keys(calendar).forEach((key) => {
      const slot = asObject(calendar[key]) || {};
      trap[key] = {
        date_or_rule: String(slot.date_or_rule || slot.dateOrRule || slot.date || '').trim(),
        note: String(slot.note || '').trim(),
      };
    });
    return trap;
  }
  return asArray(analysis.importantDates || analysis.important_dates || analysis.contractEvents)
    .map((item) => {
      const row = asObject(item) || {};
      return {
        label: String(row.label || row.eventTitle || row.kind || '').trim(),
        date: String(row.date || row.eventDateOrOffset || row.date_or_rule || '').trim(),
        note: String(row.note || '').trim(),
        kind: String(row.kind || row.eventType || '').trim(),
      };
    })
    .filter((item) => item.label || item.date || item.note)
    .slice(0, 8);
};

const pickDecision = (analysis: Record<string, unknown>) => {
  const decision = asObject(analysis.decision) || {};
  const reasons = asArray(decision.reasons)
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 3);
  return {
    action: String(decision.action || '').toUpperCase() || 'NEGOTIATE',
    headline: String(decision.headline || '').trim(),
    reasons: reasons.slice(0, 3),
    estimatedHarm: String(decision.estimatedHarm || decision.estimated_harm || '').trim(),
  };
};

const leakHaystack = (snapshot: Record<string, unknown>) => {
  const clone = JSON.parse(JSON.stringify(snapshot || {})) as Record<string, unknown>;
  clone.shieldText = '';
  asArray(clone.flags).forEach((flag) => {
    const row = asObject(flag);
    if (row) row.counterOffer = '';
  });
  asArray(clone.missing).forEach((item) => {
    const row = asObject(item);
    if (row) row.insertClause = '';
  });
  return JSON.stringify(clone);
};

function assertNoSourceLeak(snapshot: Record<string, unknown>, sourceText = '') {
  const packed = JSON.stringify(snapshot || {});
  if (/"contract_text"|"contractText"|"originalText"|"original_text"/.test(packed)) {
    throw new Error('SHARE_LEAK');
  }
  const source = collapse(sourceText);
  if (source.length < 40) return snapshot;
  const hay = leakHaystack(snapshot);
  for (let i = 0; i <= source.length - 40; i += 23) {
    const slice = source.slice(i, i + 40);
    if (slice.length < 40) continue;
    let count = 0;
    let at = 0;
    while (at >= 0 && count < 3) {
      const found = source.indexOf(slice, at);
      if (found < 0) break;
      count += 1;
      at = found + 1;
    }
    if (count !== 1) continue;
    if (hay.includes(slice)) throw new Error('SHARE_LEAK');
  }
  return snapshot;
}

function buildShareSnapshot(analysis: Record<string, unknown>, audience: string, locale: string) {
  const lang = String(locale || 'en').slice(0, 2).toLowerCase();
  const jurisdiction = asObject(analysis.jurisdiction) || {};
  const snapshot = {
    audience,
    locale: lang,
    countryLabel: String(jurisdiction.country || '').trim(),
    partyLabel: String(analysis.partyRole || analysis.party_role || '').trim(),
    dateISO: String(analysis.created_at || new Date().toISOString()).slice(0, 10),
    lifecycle: String(analysis.lifecycle || 'draft').toLowerCase(),
    score: Number.isFinite(Number(analysis.score)) ? Number(analysis.score) : 0,
    overallRisk: String(analysis.overallRisk || analysis.overall_risk || analysis.risk || '').toUpperCase(),
    decision: pickDecision(analysis),
    summary: clipSentences(analysis.summary, 3),
    flags: pickFlags(analysis),
    missing: pickMissing(analysis),
    trap: pickTrap(analysis),
    shieldText: String(analysis.revised_contract_text || analysis.revisedContractText || '').trim(),
    disclaimer: DISCLAIMERS[lang] || DISCLAIMERS.en,
  };
  return assertNoSourceLeak(snapshot, String(analysis.contract_text || analysis.contractText || ''));
}

function randomCode() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) out += CROCKFORD[bytes[i] % 32];
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'METHOD' }, 405);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const anon = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!supabaseUrl || !anon || !service) return json({ error: 'CONFIG' }, 500);

    const authHeader = req.headers.get('Authorization') || '';
    const userClient = createClient(supabaseUrl, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: authData, error: authError } = await userClient.auth.getUser();
    const user = authData?.user;
    if (authError || !user) return json({ error: 'AUTH' }, 401);

    const body = await req.json().catch(() => ({}));
    const analysisId = String(body.analysisId || body.analysis_id || '').trim();
    const audience = String(body.audience || '').toLowerCase().trim();
    const locale = String(body.locale || 'en').slice(0, 2).toLowerCase();
    if (!analysisId) return json({ error: 'SHARE_UNAVAILABLE' }, 404);
    if (!AUDIENCES.includes(audience as (typeof AUDIENCES)[number])) {
      return json({ error: 'SHARE_AUDIENCE' }, 400);
    }

    const admin = createClient(supabaseUrl, service);
    const { data: analysis, error: analysisError } = await admin
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (analysisError || !analysis) return json({ error: 'SHARE_UNAVAILABLE' }, 404);

    const { data: profile } = await admin.from('profiles').select('is_pro').eq('id', user.id).maybeSingle();
    const isPro = !!profile?.is_pro;
    const { count } = await admin
      .from('analysis_shares')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString());
    const active = count || 0;
    const cap = isPro ? PRO_ACTIVE : FREE_ACTIVE;
    if (active >= cap) return json({ error: 'SHARE_LIMIT' }, 402);

    let snapshot: Record<string, unknown>;
    try {
      snapshot = buildShareSnapshot(analysis as Record<string, unknown>, audience, locale);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'SHARE_LEAK';
      return json({ error: message === 'SHARE_LEAK' ? 'SHARE_LEAK' : 'SHARE_UNAVAILABLE' }, 400);
    }

    let inserted: { code: string; expires_at: string; audience: string } | null = null;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const code = randomCode();
      const { data, error } = await admin
        .from('analysis_shares')
        .insert({
          owner_id: user.id,
          analysis_id: analysisId,
          code,
          audience,
          snapshot,
        })
        .select('code, expires_at, audience')
        .maybeSingle();
      if (!error && data) {
        inserted = data as { code: string; expires_at: string; audience: string };
        break;
      }
      if (error && !/duplicate|unique/i.test(error.message || '')) {
        return json({ error: 'SHARE_UNAVAILABLE' }, 500);
      }
    }
    if (!inserted) return json({ error: 'SHARE_UNAVAILABLE' }, 500);

    return json({
      code: inserted.code,
      expiresAt: inserted.expires_at,
      audience: inserted.audience,
    });
  } catch {
    return json({ error: 'SHARE_UNAVAILABLE' }, 500);
  }
});
