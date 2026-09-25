// NexuLex AI — durable advisor seats. JWT required. Anthropic yok.
// analyses row is never returned to the client.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const SHARE_CODE_RE = /^[0-9A-HJKMNP-TV-Z]{8}$/;
const ADVISOR_SEAT_CAP = 2;
const HOUSEHOLD_SEAT_CAP = 1;
const PROFESSIONAL_ADVISOR_SEAT_CAP = 10;
const SEAT_ROLES = ['advisor', 'household'] as const;

const normalizeSeatRole = (value: unknown) => {
  const role = String(value || 'advisor').toLowerCase().trim();
  return SEAT_ROLES.includes(role as (typeof SEAT_ROLES)[number]) ? role : '';
};

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

function publicSnapshot(value: unknown) {
  const row = asObject(value);
  if (!row) return null;
  const packed = JSON.stringify(row);
  if (/"contract_text"|"contractText"|"originalText"|"original_text"/.test(packed)) return null;
  return row;
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
    const action = String(body.action || '').toLowerCase().trim();
    const admin = createClient(supabaseUrl, service);

    if (action === 'list') {
      const { data: ownedSeats } = await admin
        .from('advisor_seats')
        .select('id, owner_id, member_id, code, role, created_at')
        .eq('owner_id', user.id)
        .is('revoked_at', null)
        .order('created_at', { ascending: true });
      const { data: memberBriefs } = await admin
        .from('advisor_briefs')
        .select('id, created_at, snapshot')
        .eq('member_id', user.id)
        .is('revoked_at', null)
        .order('created_at', { ascending: false })
        .limit(40);
      const briefs = (memberBriefs || [])
        .map((row) => {
          const snapshot = publicSnapshot(row.snapshot);
          if (!snapshot) return null;
          return { id: row.id, created_at: row.created_at, snapshot };
        })
        .filter(Boolean);
      return json({
        seats: ownedSeats || [],
        briefs,
      });
    }

    if (action === 'mint') {
      const role = normalizeSeatRole(body.role || 'advisor');
      if (!role) return json({ error: 'SEAT_INVALID' }, 400);
      // The plan column arrives with the LR.5 migration; until then is_pro alone decides.
      const planned = await admin.from('profiles').select('is_pro, plan').eq('id', user.id).maybeSingle();
      const profile = planned.error
        ? (await admin.from('profiles').select('is_pro').eq('id', user.id).maybeSingle()).data
        : planned.data;
      if (!profile?.is_pro) return json({ error: 'SEAT_LIMIT' }, 402);
      const professional = profile?.plan === 'professional';
      const cap = role === 'household'
        ? HOUSEHOLD_SEAT_CAP
        : professional ? PROFESSIONAL_ADVISOR_SEAT_CAP : ADVISOR_SEAT_CAP;

      const { data: active } = await admin
        .from('advisor_seats')
        .select('id, code, member_id, role')
        .eq('owner_id', user.id)
        .eq('role', role)
        .is('revoked_at', null);
      const rows = active || [];
      const pending = rows.find((row) => !row.member_id);
      if (pending?.code) return json({ code: pending.code, role });
      if (rows.length >= cap) return json({ error: 'SEAT_LIMIT' }, 402);

      let inserted: { code: string } | null = null;
      for (let attempt = 0; attempt < 6; attempt += 1) {
        const code = randomCode();
        const { data, error } = await admin
          .from('advisor_seats')
          .insert({ owner_id: user.id, code, role })
          .select('code')
          .maybeSingle();
        if (!error && data) {
          inserted = data as { code: string };
          break;
        }
        if (error && !/duplicate|unique/i.test(error.message || '')) {
          return json({ error: 'SEAT_UNAVAILABLE' }, 500);
        }
      }
      if (!inserted) return json({ error: 'SEAT_UNAVAILABLE' }, 500);
      return json({ code: inserted.code, role });
    }

    if (action === 'redeem') {
      const code = String(body.code || '').trim().toUpperCase();
      if (!SHARE_CODE_RE.test(code)) return json({ error: 'SEAT_INVALID' }, 400);
      const { data: seat } = await admin
        .from('advisor_seats')
        .select('id, owner_id, member_id, revoked_at')
        .eq('code', code)
        .maybeSingle();
      if (!seat || seat.revoked_at) return json({ error: 'SEAT_NOT_FOUND' }, 404);
      if (seat.owner_id === user.id) return json({ error: 'SEAT_OWN' }, 400);
      if (seat.member_id) return json({ error: 'SEAT_TAKEN' }, 400);
      const { error } = await admin
        .from('advisor_seats')
        .update({ member_id: user.id })
        .eq('id', seat.id)
        .is('member_id', null)
        .is('revoked_at', null);
      if (error) {
        if (/unique/i.test(error.message || '')) return json({ error: 'SEAT_TAKEN' }, 400);
        return json({ error: 'SEAT_UNAVAILABLE' }, 500);
      }
      return json({ ok: true });
    }

    if (action === 'revoke') {
      const code = String(body.code || '').trim().toUpperCase();
      if (!SHARE_CODE_RE.test(code)) return json({ error: 'SEAT_INVALID' }, 400);
      const { data: seat } = await admin
        .from('advisor_seats')
        .select('id, owner_id, member_id')
        .eq('code', code)
        .eq('owner_id', user.id)
        .is('revoked_at', null)
        .maybeSingle();
      if (!seat) return json({ error: 'SEAT_NOT_FOUND' }, 404);
      const now = new Date().toISOString();
      await admin.from('advisor_seats').update({ revoked_at: now }).eq('id', seat.id);
      if (seat.member_id) {
        await admin
          .from('advisor_briefs')
          .update({ revoked_at: now })
          .eq('owner_id', user.id)
          .eq('member_id', seat.member_id)
          .is('revoked_at', null);
      }
      return json({ ok: true });
    }

    if (action === 'push') {
      const analysisId = String(body.analysisId || body.analysis_id || '').trim();
      const memberId = String(body.memberId || body.member_id || '').trim();
      const locale = String(body.locale || 'en').slice(0, 2).toLowerCase();
      if (!analysisId || !memberId) return json({ error: 'SEAT_UNAVAILABLE' }, 400);

      const { data: seat } = await admin
        .from('advisor_seats')
        .select('id, role')
        .eq('owner_id', user.id)
        .eq('member_id', memberId)
        .is('revoked_at', null)
        .maybeSingle();
      const seatRole = normalizeSeatRole(seat?.role);
      if (!seat || !seatRole) return json({ error: 'SEAT_NOT_FOUND' }, 404);

      const { data: analysis, error: analysisError } = await admin
        .from('analyses')
        .select('*')
        .eq('id', analysisId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (analysisError || !analysis) return json({ error: 'SEAT_UNAVAILABLE' }, 404);

      let snapshot: Record<string, unknown>;
      try {
        snapshot = buildShareSnapshot(analysis as Record<string, unknown>, seatRole, locale);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'SHARE_LEAK';
        return json({ error: message === 'SHARE_LEAK' ? 'SHARE_LEAK' : 'SEAT_UNAVAILABLE' }, 400);
      }

      const { data: inserted, error: insertError } = await admin
        .from('advisor_briefs')
        .insert({
          owner_id: user.id,
          member_id: memberId,
          analysis_id: analysisId,
          snapshot,
        })
        .select('id')
        .maybeSingle();
      if (insertError || !inserted) return json({ error: 'SEAT_UNAVAILABLE' }, 500);
      return json({ ok: true, id: inserted.id });
    }

    return json({ error: 'SEAT_INVALID' }, 400);
  } catch {
    return json({ error: 'SEAT_UNAVAILABLE' }, 500);
  }
});
