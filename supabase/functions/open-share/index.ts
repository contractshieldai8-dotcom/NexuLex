// NexuLex AI — view-only brief. JWT yok. analyses satırı dönülmez.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
};

const CODE_RE = /^[0-9A-HJKMNP-TV-Z]{8}$/;
const hits = new Map<string, number[]>();

const OPEN_LABELS: Record<string, string> = {
  tr: 'NexuLex’te aç',
  en: 'Open in NexuLex',
  de: 'In NexuLex öffnen',
  fr: 'Ouvrir dans NexuLex',
  es: 'Abrir en NexuLex',
  ar: 'افتح في NexuLex',
  it: 'Apri in NexuLex',
  zh: '在 NexuLex 中打开',
  ru: 'Открыть в NexuLex',
  fa: 'باز کردن در NexuLex',
  ja: 'NexuLexで開く',
  pt: 'Abrir no NexuLex',
  nl: 'Openen in NexuLex',
};

const GET_APP_LABELS: Record<string, string> = {
  tr: 'Uygulamayı al — 2 ücretsiz tarama',
  en: 'Get the app — 2 free scans',
  de: 'App holen — 2 kostenlose Scans',
  fr: 'Installer l’app — 2 analyses gratuites',
  es: 'Consigue la app — 2 análisis gratis',
  ar: 'احصل على التطبيق — مسحتان مجانيتان',
  it: 'Scarica l’app — 2 scan gratis',
  zh: '获取应用 — 2 次免费扫描',
  ru: 'Скачать приложение — 2 бесплатных сканирования',
  fa: 'دریافت برنامه — ۲ اسکن رایگان',
  ja: 'アプリを入手 — 無料スキャン2回',
  pt: 'Obter a app — 2 scans grátis',
  nl: 'App downloaden — 2 gratis scans',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const clientIp = (req: Request) => {
  const forwarded = req.headers.get('x-forwarded-for') || '';
  return forwarded.split(',')[0].trim() || req.headers.get('cf-connecting-ip') || 'unknown';
};

const rateOk = (ip: string) => {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((stamp) => now - stamp < 60_000);
  if (recent.length >= 30) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  return true;
};

const wantsHtml = (req: Request) => {
  const accept = String(req.headers.get('accept') || '').toLowerCase();
  const url = new URL(req.url);
  return accept.includes('text/html') || url.searchParams.get('format') === 'html';
};

const html404 = () =>
  new Response(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>NexuLex AI</title>
<style>body{margin:0;background:#0A0F1D;color:#F8FAFC;font-family:system-ui,sans-serif;padding:48px 20px;text-align:center;line-height:1.45}.accent{color:#D4B27A}.foot{color:#94A3B8;font-size:13px;margin-top:18px}</style>
</head>
<body>
<p class="accent">NexuLex AI</p>
<p>This brief is missing or expired.</p>
<p class="foot">NexuLex AI</p>
</body>
</html>`,
    {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
    }
  );

const notFound = (req: Request) => (wantsHtml(req) ? html404() : json({ error: 'SHARE_UNAVAILABLE' }, 404));

function renderHtml(snapshot: Record<string, unknown>, code: string) {
  const locale = String(snapshot.locale || 'en').slice(0, 2).toLowerCase();
  const rtl = locale === 'ar' || locale === 'fa';
  const decision = (snapshot.decision && typeof snapshot.decision === 'object'
    ? snapshot.decision
    : {}) as Record<string, unknown>;
  const reasons = Array.isArray(decision.reasons) ? decision.reasons : [];
  const flags = Array.isArray(snapshot.flags) ? snapshot.flags : [];
  const missing = Array.isArray(snapshot.missing) ? snapshot.missing : [];
  const trap = snapshot.trap;
  const trapRows: string[] = [];
  if (Array.isArray(trap)) {
    trap.forEach((item) => {
      const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      trapRows.push(
        `<li>${escapeHtml(row.label || row.kind)} — ${escapeHtml(row.date || row.date_or_rule)} ${escapeHtml(row.note)}</li>`
      );
    });
  } else if (trap && typeof trap === 'object') {
    Object.entries(trap as Record<string, unknown>).forEach(([key, value]) => {
      const row = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
      trapRows.push(
        `<li>${escapeHtml(key)} — ${escapeHtml(row.date_or_rule || row.date)} ${escapeHtml(row.note)}</li>`
      );
    });
  }
  const missingChips = missing
    .map((item) => {
      const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      return `<span class="chip">${escapeHtml(row.playbookId)} · ${escapeHtml(row.status)}</span>`;
    })
    .join('');
  const flagBlocks = flags
    .map((item) => {
      const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      return `<article class="flag"><h3>${escapeHtml(row.title)} · ${escapeHtml(row.severity)}</h3><p>${escapeHtml(row.explanation)}</p><p class="counter">${escapeHtml(row.counterOffer)}</p></article>`;
    })
    .join('');
  const shield = String(snapshot.shieldText || '');
  const openLabel = OPEN_LABELS[locale] || OPEN_LABELS.en;
  const getAppLabel = GET_APP_LABELS[locale] || GET_APP_LABELS.en;
  const safeCode = encodeURIComponent(code);
  return `<!doctype html>
<html lang="${escapeHtml(locale)}" dir="${rtl ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>NexuLex AI brief</title>
<style>
body{margin:0;background:#0A0F1D;color:#F8FAFC;font-family:system-ui,sans-serif;line-height:1.45}
main{max-width:720px;margin:0 auto;padding:28px 20px 48px}
.accent{color:#D4B27A}
.card{background:#111827;border:1px solid #1E293B;border-radius:14px;padding:18px;margin:14px 0}
.score{font-size:28px;color:#D4B27A;font-weight:700}
.chip{display:inline-block;border:1px solid #D4B27A;color:#D4B27A;border-radius:999px;padding:4px 10px;margin:4px 6px 0 0;font-size:12px}
.flag h3{margin:0 0 8px;font-size:15px}
.counter{color:#D4B27A;white-space:pre-wrap}
pre{white-space:pre-wrap;font-family:inherit;background:#0A0F1D;padding:12px;border-radius:10px}
.foot{color:#94A3B8;font-size:12px;margin-top:24px}
.cta{display:flex;flex-direction:column;gap:10px;margin-top:22px}
.cta a{display:block;text-align:center;text-decoration:none;border-radius:12px;padding:14px 16px;font-weight:600}
.cta .primary{background:#D4B27A;color:#080C14}
.cta .secondary{border:1px solid #D4B27A;color:#D4B27A}
</style>
</head>
<body>
<main>
<p class="accent">NexuLex AI</p>
<h1>${escapeHtml(decision.action)} · <span class="score">${escapeHtml(snapshot.score)}/100</span></h1>
<p>${escapeHtml(decision.headline)}</p>
<div class="card">
<ol>${reasons.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>
<p>${escapeHtml(decision.estimatedHarm)}</p>
</div>
<p>${escapeHtml(snapshot.summary)}</p>
${flagBlocks}
${missingChips ? `<div class="card">${missingChips}</div>` : ''}
${trapRows.length ? `<div class="card"><h2>Dates</h2><ul>${trapRows.join('')}</ul></div>` : ''}
${shield ? `<div class="card"><h2>Shield</h2><pre>${escapeHtml(shield)}</pre></div>` : ''}
<p class="foot">${escapeHtml(snapshot.disclaimer)}</p>
<div class="cta">
<a class="primary" href="nexulex://share/${safeCode}">${escapeHtml(openLabel)}</a>
<a class="secondary" href="https://play.google.com/store/apps/details?id=com.nexulex.ai">${escapeHtml(getAppLabel)}</a>
</div>
</main>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'GET') return json({ error: 'METHOD' }, 405);

  if (!rateOk(clientIp(req))) return notFound(req);

  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.49.1');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!supabaseUrl || !service) return notFound(req);

    const code = String(new URL(req.url).searchParams.get('code') || '').trim().toUpperCase();
    if (!CODE_RE.test(code)) return notFound(req);

    const admin = createClient(supabaseUrl, service);
    const { data, error } = await admin
      .from('analysis_shares')
      .select('snapshot, expires_at, revoked_at')
      .eq('code', code)
      .maybeSingle();

    if (error || !data || data.revoked_at) return notFound(req);
    if (new Date(data.expires_at).getTime() <= Date.now()) return notFound(req);

    const snapshot = data.snapshot && typeof data.snapshot === 'object' ? data.snapshot : null;
    if (!snapshot) return notFound(req);
    const packed = JSON.stringify(snapshot);
    if (/"contract_text"|"contractText"|"originalText"/.test(packed)) {
      return notFound(req);
    }

    if (wantsHtml(req)) {
      return new Response(renderHtml(snapshot as Record<string, unknown>, code), {
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    return json({ snapshot });
  } catch {
    return notFound(req);
  }
});
