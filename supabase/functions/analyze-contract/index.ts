// NEXULEX AI — Claude proxy'si.
//
// Anthropic API anahtarı yalnızca burada, Supabase Secrets üzerinden okunur;
// mobil uygulamada hiçbir zaman bulunmaz.
//
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase functions deploy analyze-contract
//
// JWT doğrulaması Supabase tarafından varsayılan olarak yapılır: yalnızca
// oturum açmış kullanıcılar bu uç noktayı çağırabilir.
//
// WAVE ECON.3: the gateway also accepts the public anon key, so the function itself now requires a real
// user (JWT "sub"), resolves the plan, allows "deep" only on Professional, caps request text by plan and
// counts calls per user per day (public.consume_analyze_call). Plan lookups and the counter fail OPEN
// when the database is unreachable, so an outage never blocks a paying user.
// Optional rollback switches (unset = the defaults below): ANALYZE_MODEL_DEFAULT, ANALYZE_MODEL_DEEP, ANALYZE_MODEL_FAST.
// Secrets used: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

// BEGIN claude-model-profile
// Identical in all three Claude functions (scripts/verify-ui.js, WAVE ECON.3, keeps the copies in sync).
// Thinking rules per model family: platform.claude.com/docs/en/build-with-claude/thinking (checked Oct 2026).
const envModel = (name: string, fallback: string) => (Deno.env.get(name) || '').trim() || fallback;

// Fable, Mythos and Opus 5.5 cannot turn thinking off.
const ALWAYS_THINKS = /^claude-(fable|mythos|opus-5-5)/;

const thinkingParams = (model: string) => {
  // Claude Sonnet 5.5 answers 400 to "disabled"; "between_tools" is its no-up-front-thinking setting (effort high or below).
  if (/^claude-sonnet-5-5/.test(model)) return { thinking: { type: 'between_tools' } };
  // Keep thinking adaptive at low effort so the output bill stays bounded (thinking tokens are billed as output).
  if (ALWAYS_THINKS.test(model)) return { thinking: { type: 'adaptive' }, output_config: { effort: 'low' } };
  // Sonnet 5, Haiku 4.5 and Haiku 5.5 accept "disabled" (Haiku 5.5 at effort high or below; its default is medium).
  return { thinking: { type: 'disabled' } };
};

// One retry after a 400: no thinking field, low effort. Pointless where thinking is already adaptive at low effort.
const lowEffortParams = () => ({ output_config: { effort: 'low' } });
const canRetryLowEffort = (model: string) => !ALWAYS_THINKS.test(model);
// END claude-model-profile

// İstemci yalnızca bir "mode" gönderir; model kimlikleri sunucuda tutulur.
const CLAUDE_MODELS: Record<string, string> = {
  default: envModel('ANALYZE_MODEL_DEFAULT', 'claude-sonnet-5-5'),
  deep: envModel('ANALYZE_MODEL_DEEP', 'claude-fable-5-1'),
  fast: envModel('ANALYZE_MODEL_FAST', 'claude-haiku-5-5'),
};
const CLAUDE_MODES = ['default', 'deep', 'fast'];

type Plan = 'free' | 'pro' | 'professional';
// Abuse backstops, not product quotas: one analysis is several calls (OCR batches, the analysis, a continuation).
const DAILY_CALL_LIMIT: Record<Plan, number> = { free: 30, pro: 200, professional: 400 };
// Request text per call, media (base64) excluded. The app slices contracts to 24k characters.
const MAX_TEXT_CHARS: Record<Plan, number> = { free: 120_000, pro: 300_000, professional: 400_000 };

// Uç noktanın açık uçlu bir Claude proxy'sine dönüşmemesi için üst sınırlar.
// EXTRACT istemci 8192 clamp; uzun analiz 16384 buradan geçer. GENERATE 8192 kalır.
const MAX_ALLOWED_TOKENS = 16384;
const DEFAULT_MAX_TOKENS = 5000;
const MAX_MESSAGES = 12;
const MAX_BODY_CHARS = 4 * 1024 * 1024;
const MAX_MESSAGE_CHARS = 2_500_000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const clampNumber = (value: unknown, fallback: number, min: number, max: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

const weighContent = (content: unknown): number => {
  if (typeof content === 'string') return content.length;
  if (!Array.isArray(content)) return 0;
  let total = 0;
  for (const block of content) {
    if (typeof block === 'string') {
      total += block.length;
      continue;
    }
    if (block && typeof block === 'object') {
      const data = (block as { source?: { data?: unknown } }).source?.data;
      if (typeof data === 'string') total += data.length;
      const text = (block as { text?: unknown }).text;
      if (typeof text === 'string') total += text.length;
    }
  }
  return total;
};

// Characters of readable text only (base64 media is weighed by weighContent, not here).
const weighText = (content: unknown): number => {
  if (typeof content === 'string') return content.length;
  if (!Array.isArray(content)) return 0;
  let total = 0;
  for (const block of content) {
    if (typeof block === 'string') total += block.length;
    else if (block && typeof block === 'object') {
      const text = (block as { text?: unknown }).text;
      if (typeof text === 'string') total += text.length;
    }
  }
  return total;
};

const stripMarkdownFences = (text: string) =>
  String(text || '')
    .replace(/^\uFEFF/, '')
    .replace(/```(?:json|JSON)?\s*/gi, '')
    .replace(/```/g, '')
    .trim();

const tryParseJson = (value: string) => {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
  } catch {
    /* next repair */
  }
  return null;
};

const extractJsonCandidate = (text: string) => {
  const cleaned = stripMarkdownFences(text);
  const start = cleaned.indexOf('{');
  return start === -1 ? cleaned : cleaned.slice(start);
};

const scanJsonState = (text: string) => {
  let inString = false;
  let escaped = false;
  const stack: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{') stack.push('}');
    else if (ch === '[') stack.push(']');
    else if ((ch === '}' || ch === ']') && stack[stack.length - 1] === ch) stack.pop();
  }
  return { inString, escaped, stack };
};

const repairTruncatedJson = (rawText: string) => {
  let text = extractJsonCandidate(rawText);
  if (!text) return text;
  text = text.replace(/\\u[0-9a-fA-F]{0,3}$/, '').replace(/\\$/, '');
  let state = scanJsonState(text);
  if (state.escaped) {
    text = text.slice(0, -1);
    state = scanJsonState(text);
  }
  if (state.inString) text += '"';
  text = text.replace(/,(\s*)$/, '$1');
  state = scanJsonState(text);
  while (state.stack.length) text += state.stack.pop();
  return text;
};

const JSON_FALLBACKS: Record<string, Record<string, unknown>> = {
  analysis: {
    summary: '',
    overallRisk: 'YELLOW',
    score: 0,
    clauses: [],
    redFlags: [],
    decision: { action: 'NEGOTIATE', headline: '', reasons: [], estimatedHarm: '' },
    trap_calendar: {
      termination: { date_or_rule: 'UNSPECIFIED', note: '' },
      confidentiality: { date_or_rule: 'UNSPECIFIED', note: '' },
      return_or_refund: { date_or_rule: 'UNSPECIFIED', note: '' },
    },
    missing_protections: [],
    importantDates: [],
  },
  revise: { revised_text: '', summary: '', who_gained: 'MIXED', changes: [] },
  compare: { revised_text: '', summary: '', who_gained: 'MIXED', changes: [], sign_conditions_eval: [] },
  generate: { title: '', draft: '', summary: '', key_protections: [] },
};

const stripInnerTrailingCommas = (text: string) =>
  String(text || '').replace(/,(\s*[}\]])/g, '$1');

const dropIncompleteTail = (text: string) => {
  const lastComma = text.lastIndexOf(',');
  const lastColon = text.lastIndexOf(':');
  const cutAt = Math.max(lastComma, lastColon);
  if (cutAt <= 0) return text;
  return repairTruncatedJson(text.slice(0, cutAt));
};

const headingFromMarkdown = (text: string) => {
  const match = String(text || '').match(/^\s{0,3}#{1,3}\s+(.+)$/m);
  return match ? String(match[1] || '').trim().slice(0, 120) : '';
};

const safeParseJSON = (rawText: string): Record<string, unknown> | null => {
  const cleaned = stripMarkdownFences(rawText);
  if (!cleaned) return null;
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  const sliced = start !== -1 && end > start ? cleaned.slice(start, end + 1) : '';
  const candidates = [
    sliced,
    stripInnerTrailingCommas(sliced),
    repairTruncatedJson(cleaned),
    stripInnerTrailingCommas(repairTruncatedJson(cleaned)),
    dropIncompleteTail(extractJsonCandidate(cleaned)),
    repairTruncatedJson(rawText),
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const parsed = tryParseJson(candidate);
    if (parsed) return parsed;
  }
  return null;
};

const pickGenerateDraft = (parsed: Record<string, unknown> | null) => {
  if (!parsed) return '';
  const keys = ['draft', 'revised_text', 'revisedText', 'contract', 'contract_text', 'contractText', 'body', 'text'];
  for (const key of keys) {
    const value = String(parsed[key] ?? '').trim();
    if (value.length > 40) return value;
  }
  return '';
};

const looksLikeAuditJson = (parsed: Record<string, unknown> | null) =>
  Boolean(
    parsed &&
      (parsed.redFlags ||
        parsed.red_flags ||
        parsed.decision ||
        parsed.clauses ||
        parsed.trap_calendar ||
        parsed.decision_card)
  );

const wrapGenerate = (rawText: string) => {
  const cleaned = stripMarkdownFences(rawText);
  const parsed = safeParseJSON(cleaned);
  const jsonDraft = !looksLikeAuditJson(parsed) ? pickGenerateDraft(parsed) : '';
  const markdown = looksLikeAuditJson(parsed) ? '' : cleaned;
  const draft = jsonDraft || markdown;
  const protections = Array.isArray(parsed?.key_protections)
    ? parsed.key_protections
    : Array.isArray(parsed?.keyProtections)
      ? parsed.keyProtections
      : [];
  return {
    title: String(parsed?.title ?? headingFromMarkdown(draft) ?? ''),
    draft,
    summary: String(parsed?.summary ?? ''),
    key_protections: protections,
  };
};

const extractJson = (rawText: string, schema = 'analysis') => {
  if (schema === 'generate' || schema === 'markdown') {
    return JSON.stringify(wrapGenerate(rawText));
  }
  const parsed = safeParseJSON(rawText);
  if (parsed) return JSON.stringify(parsed);
  // Analizde boş şema basma: istemci AI_PARSE fırlatsın, sahte 0/100 olmasın.
  if (schema === 'analysis') return String(rawText || '');
  return JSON.stringify(JSON_FALLBACKS[schema] || {});
};

// ---------------------------------------------------------------------------
// ECON.2 cost telemetry. Anonymous token totals only (public.record_ai_cost: day, feature, plan,
// model; no user id is stored). Plain PostgREST calls, so no extra dependency; it never blocks,
// delays or fails an analysis.
// ---------------------------------------------------------------------------
const COST_SCHEMAS = ['analysis', 'revise', 'compare', 'generate', 'markdown'];

const jwtSubject = (authHeader: string | null): string => {
  try {
    const token = String(authHeader || '').replace(/^Bearer\s+/i, '');
    const part = token.split('.')[1] || '';
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4)));
    const sub = String(payload?.sub || '');
    return /^[0-9a-f-]{36}$/i.test(sub) ? sub : '';
  } catch {
    return '';
  }
};

// Database access (PostgREST, service role). Every call has a short timeout; callers treat null as "unknown".
const GUARD_TIMEOUT_MS = 3000;
const dbHeaders = (serviceKey: string) => ({
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  'content-type': 'application/json',
});

// Returns the plan, or null when the profile could not be read (the caller then fails open).
const resolvePlan = async (baseUrl: string, serviceKey: string, userId: string): Promise<Plan | null> => {
  const fetchProfile = async (columns: string) => {
    try {
      const res = await fetch(`${baseUrl}/rest/v1/profiles?id=eq.${userId}&select=${columns}&limit=1`, {
        headers: dbHeaders(serviceKey),
        signal: AbortSignal.timeout(GUARD_TIMEOUT_MS),
      });
      return res.ok ? ((await res.json().catch(() => null)) as Array<Record<string, unknown>> | null) : null;
    } catch {
      return null;
    }
  };
  // The plan column arrives with the LR.5 migration; until then is_pro alone decides.
  const rows = (await fetchProfile('is_pro,plan')) ?? (await fetchProfile('is_pro'));
  if (!rows) return null;
  const profile = rows[0];
  if (profile?.plan === 'professional') return 'professional';
  return profile?.is_pro ? 'pro' : 'free';
};

const callRpc = async (baseUrl: string, serviceKey: string, name: string, args: Record<string, unknown>) => {
  try {
    const res = await fetch(`${baseUrl}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: dbHeaders(serviceKey),
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(GUARD_TIMEOUT_MS),
    });
    return res.ok ? { ok: true as const, data: await res.json().catch(() => null) } : { ok: false as const, data: null };
  } catch {
    return { ok: false as const, data: null };
  }
};

const trackScanCost = async (
  plan: Plan,
  info: { schema: string; model: string; usage: any; stopReason?: string; failed: boolean }
) => {
  try {
    const baseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!baseUrl || !serviceKey) return;
    const kind = info.schema ? (COST_SCHEMAS.includes(info.schema) ? info.schema : 'other') : 'text';
    // Cache tokens are billed too (none are used today); fold them into the input total.
    const input =
      (Number(info.usage?.input_tokens) || 0) +
      (Number(info.usage?.cache_creation_input_tokens) || 0) +
      (Number(info.usage?.cache_read_input_tokens) || 0);
    await callRpc(baseUrl, serviceKey, 'record_ai_cost', {
      p_feature: `analyze:${kind}`,
      p_plan: plan,
      p_model: info.model,
      p_input: input,
      p_output: Number(info.usage?.output_tokens) || 0,
      p_truncated: info.stopReason === 'max_tokens',
      p_failed: info.failed,
    });
  } catch {
    /* telemetry only */
  }
};

// Keeps the isolate alive until the write finishes without making the caller wait for it.
const runInBackground = (work: Promise<unknown>) => {
  const runtime = (globalThis as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime;
  if (runtime?.waitUntil) runtime.waitUntil(work);
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Yalnızca POST destekleniyor.' }, 405);
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY secret tanımlı değil.');
    return json({ error: 'Sunucu yapılandırması eksik: ANTHROPIC_API_KEY tanımlı değil.' }, 500);
  }

  const declaredLength = Number(req.headers.get('content-length') || 0);
  if (declaredLength > MAX_BODY_CHARS) {
    return json({ error: 'PAYLOAD_TOO_LARGE' }, 413);
  }

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return json({ error: 'Geçersiz gövde.' }, 400);
  }

  if (raw.length > MAX_BODY_CHARS) {
    return json({ error: 'PAYLOAD_TOO_LARGE' }, 413);
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ error: 'Geçersiz JSON gövdesi.' }, 400);
  }
  raw = '';

  const { mode, system, messages, maxTokens, expectJson } = payload ?? {};
  // İstemciden gelse bile temperature / generationConfig asla Claude'a iletilmez.

  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: '"messages" alanı zorunludur.' }, 400);
  }

  if (messages.length > MAX_MESSAGES) {
    return json({ error: `En fazla ${MAX_MESSAGES} mesaj gönderilebilir.` }, 400);
  }

  let messageChars = 0;
  let textChars = 0;
  for (const message of messages) {
    messageChars += weighContent(message?.content);
    textChars += weighText(message?.content);
    if (messageChars > MAX_MESSAGE_CHARS) {
      return json({ error: 'PAYLOAD_TOO_LARGE' }, 413);
    }
  }

  // Konuşma her zaman bir "user" mesajı ile bitmelidir; assistant prefill
  // güncel modellerde 400 hatası veriyor.
  const last = messages[messages.length - 1];
  if (!last || last.role !== 'user') {
    return json({ error: 'Mesaj dizisi bir "user" mesajı ile bitmelidir.' }, 400);
  }

  for (const message of messages) {
    if (message?.role !== 'user' && message?.role !== 'assistant') {
      return json({ error: 'Geçersiz mesaj rolü.' }, 400);
    }
    if (typeof message.content !== 'string' && !Array.isArray(message.content)) {
      return json({ error: 'Geçersiz mesaj içeriği.' }, 400);
    }
  }

  if (system !== undefined && typeof system !== 'string') {
    return json({ error: '"system" bir metin olmalıdır.' }, 400);
  }

  // --- ECON.3 guard: who is calling, on which plan, and may this call go ahead? ---------------------
  const authHeader = req.headers.get('Authorization');
  const userId = jwtSubject(authHeader);
  // The gateway lets the public anon key through; it has no "sub", so it is never a real user.
  if (!userId) return json({ error: 'AUTH' }, 401);

  const baseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const knownPlan = baseUrl && serviceKey ? await resolvePlan(baseUrl, serviceKey, userId) : null;
  const plan: Plan = knownPlan ?? 'free'; // strictest text cap and no "deep" when the plan is unknown

  if (textChars > MAX_TEXT_CHARS[plan]) {
    return json({ error: 'PAYLOAD_TOO_LARGE' }, 413);
  }

  // "deep" (the most expensive model) is a Professional feature. Anyone else gets the default model.
  const requestedMode = CLAUDE_MODES.includes(mode as string) ? (mode as string) : 'default';
  const effectiveMode = requestedMode === 'deep' && plan !== 'professional' ? 'default' : requestedMode;
  if (effectiveMode !== requestedMode) console.warn('deep mode downgraded to default', { plan });

  let counted = false;
  if (knownPlan) {
    const used = await callRpc(baseUrl, serviceKey, 'consume_analyze_call', {
      p_user: userId,
      p_limit: DAILY_CALL_LIMIT[plan],
    });
    if (used.ok && used.data?.allowed === false) {
      return json({ error: 'ANALYZE_DAILY_LIMIT', limit: DAILY_CALL_LIMIT[plan] }, 429);
    }
    counted = used.ok; // a failed counter fails open
  }
  // A call the model never served (upstream error, crash) is given back.
  const refund = () => {
    if (counted) runInBackground(callRpc(baseUrl, serviceKey, 'refund_analyze_call', { p_user: userId }));
  };

  const model = CLAUDE_MODELS[effectiveMode];
  const schema = typeof expectJson === 'string' ? expectJson : expectJson ? 'analysis' : '';
  const wantJson = Boolean(schema);
  const maxTok = clampNumber(maxTokens, DEFAULT_MAX_TOKENS, 256, MAX_ALLOWED_TOKENS);

  const anthropicHeaders = {
    'content-type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': ANTHROPIC_VERSION,
  };

  const buildAnthropicBody = (retry: boolean) => ({
    model,
    max_tokens: maxTok,
    ...(system ? { system } : {}),
    messages,
    // Thinking burns max_tokens and can return empty text content for JSON/OCR, so up-front thinking
    // is turned off where the model allows it (Sonnet 5.5: between_tools, Haiku / Sonnet 5: disabled).
    ...(retry ? lowEffortParams() : thinkingParams(model)),
  });

  const callAnthropic = async (bodyObj: Record<string, unknown>) => {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: anthropicHeaders,
      // NOT: "temperature" bu modellerde kullanımdan kaldırıldı ve gönderilmesi
      // 400 "`temperature` is deprecated for this model." hatası veriyor.
      body: JSON.stringify(bodyObj),
    });
    const data = await response.json().catch(() => null);
    return { response, data };
  };

  try {
    // Up-front thinking off (or low effort where the model cannot turn it off): the whole token budget goes to visible text / JSON.
    let { response, data } = await callAnthropic(buildAnthropicBody(false));

    // A model that rejects the thinking setting: one retry with effort:low (no thinking key).
    if (!response.ok && response.status === 400 && canRetryLowEffort(model)) {
      console.warn('thinking setting rejected; retrying once with output_config.effort=low', {
        model,
        wantJson,
        detail: data?.error?.message,
      });
      ({ response, data } = await callAnthropic(buildAnthropicBody(true)));
    }

    if (!response.ok) {
      refund();
      const detail = data?.error?.message || `Claude API ${response.status}`;
      // Üst kaynağın durum kodu aynen aktarılır; istemcideki yeniden deneme
      // mantığı 429/5xx ayrımını buna göre yapar.
      return json({ error: detail }, response.status);
    }

    const joined = (data?.content ?? [])
      .filter((block: any) => block?.type === 'text')
      .map((block: any) => block.text)
      .join('');

    if (!String(joined).trim()) {
      console.error('empty-edge-text', {
        stop_reason: data?.stop_reason,
        usage: data?.usage,
        model: data?.model ?? model,
        wantJson,
      });
      runInBackground(
        trackScanCost(plan, {
          schema,
          model: String(data?.model ?? model),
          usage: data?.usage,
          stopReason: data?.stop_reason,
          failed: true,
        })
      );
      return json(
        { error: 'empty-edge-text', stop_reason: data?.stop_reason, usage: data?.usage ?? null },
        502
      );
    }

    const text = schema ? extractJson(joined, schema) : joined;

    runInBackground(
      trackScanCost(plan, {
        schema,
        model: String(data?.model ?? model),
        usage: data?.usage,
        stopReason: data?.stop_reason,
        failed: false,
      })
    );

    return json({ text, model: data?.model ?? model, usage: data?.usage ?? null });
  } catch (error) {
    console.error('analyze-contract hatası:', error);
    refund();
    return json({ error: error instanceof Error ? error.message : String(error) }, 502);
  }
});
