/**
 * WAVE CC — Guided Draft (local fill, 0 LLM, 0 network).
 * Missing answers become visible "[ … ]" blanks; nothing is invented.
 */

import i18n from '../i18n';
import { DRAFT_FREE_PREVIEW_LINES, getDraftTemplateById } from '../constants/draftTemplates';

function langOf(locale) {
  return String(locale || i18n.language || 'en').slice(0, 2);
}

/** Raw resource string (no i18next interpolation, so {{placeholders}} survive). */
function rawKey(key, locale) {
  if (!key) return '';
  const lang = langOf(locale);
  try {
    const hit = i18n.getResource(lang, 'translation', key) ?? i18n.getResource('en', 'translation', key);
    if (typeof hit === 'string') return hit;
  } catch (_error) {
    // fall through
  }
  return String(key);
}

function cleanAnswer(value) {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function blankFor(label) {
  const clean = String(label || '').replace(/[?:：？]+\s*$/, '').trim();
  return `[ ${clean || '…'} ]`;
}

/**
 * @returns {{
 *   templateId: string,
 *   title: string,
 *   body: string,
 *   reference: string,
 *   disclaimer: string,
 *   missing: Array<{ id: string, label: string, required: boolean }>,
 *   missingRequired: string[],
 *   answers: Record<string, string>,
 *   text: string,
 * } | null}
 */
export function buildDraft(templateId, answers = {}, locale = 'en') {
  const template = getDraftTemplateById(templateId);
  if (!template) return null;

  const filled = {};
  const missing = [];
  const labels = {};
  (template.questions || []).forEach((q) => {
    const label = rawKey(q.labelKey, locale);
    labels[q.id] = label;
    const value = cleanAnswer(answers?.[q.id]);
    if (value) filled[q.id] = value;
    else missing.push({ id: q.id, label, required: !!q.required });
  });

  const body = rawKey(template.bodyTemplateKey, locale)
    .replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, id) =>
      filled[id] ? filled[id] : blankFor(labels[id] || id)
    )
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const draft = {
    templateId: template.id,
    title: rawKey(template.titleKey, locale).trim(),
    body,
    reference: rawKey(template.fixedReferenceKey, locale).trim(),
    disclaimer: rawKey(template.disclaimerKey, locale).trim(),
    missing,
    missingRequired: missing.filter((m) => m.required).map((m) => m.id),
    answers: filled,
  };
  draft.text = formatDraftForSharing(draft, 'plain');
  return draft;
}

function stripTrailingDisclaimer(text, disclaimer) {
  let out = String(text || '').trim();
  const d = String(disclaimer || '').trim();
  if (!d) return out;
  while (out.endsWith(d)) {
    out = out.slice(0, out.length - d.length).replace(/[\s—-]+$/, '').trim();
  }
  return out;
}

/**
 * Copy / Share / DOCX body. Mandatory disclaimer is always the final line.
 * @param {'plain'|'whatsapp'} format
 */
export function formatDraftForSharing(draft, format = 'plain') {
  if (!draft || typeof draft !== 'object') return '';
  const disclaimer = String(draft.disclaimer || '').trim();
  const lines = [];
  const title = String(draft.title || '').trim();
  if (title) lines.push(format === 'whatsapp' ? `*${title}*` : title.toUpperCase());
  lines.push('');
  const body = stripTrailingDisclaimer(draft.body, disclaimer);
  if (body) lines.push(body);
  lines.push('');
  const reference = String(draft.reference || '').trim();
  if (reference) {
    lines.push(reference);
    lines.push('');
  }
  if (disclaimer) {
    lines.push('—');
    lines.push(disclaimer);
  }
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Free tier: first N body lines, then the disclaimer (still last). */
export function buildDraftPreview(draft, maxLines = DRAFT_FREE_PREVIEW_LINES) {
  if (!draft) return { text: '', truncated: false };
  const bodyLines = String(draft.body || '').split('\n');
  const truncated = bodyLines.length > maxLines;
  const previewDraft = {
    ...draft,
    body: truncated ? `${bodyLines.slice(0, maxLines).join('\n')}\n…` : draft.body,
    reference: truncated ? '' : draft.reference,
  };
  return { text: formatDraftForSharing(previewDraft, 'plain'), truncated };
}

function stampName() {
  return new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
}

export function draftDocxFilename(draft) {
  const id = String(draft?.templateId || 'draft').replace(/[^a-z0-9_-]/gi, '');
  return `NexuLex-Taslak-${id}-${stampName()}.docx`;
}

// ---------------------------------------------------------------------------
// Optional "Improve wording" — one user-triggered LLM call, then strict guards.
// ---------------------------------------------------------------------------

const CITATION_RE =
  /(§\s*\d+[a-z]?|\b(?:m|md|madde|art|article|artikel|artículo|articolo|artigo|статья|ст)\.?\s*\d+[a-z]?|\b\d{3,4}\s*sayılı|yarg[ıi]tay|\b[EK]\.\s*\d{4}\s*\/\s*\d+|\b\d{4}\s*\/\s*\d+\s*[EK]\b)/gi;

const OVERCLAIM_RE =
  /(court[- ]ready|guaranteed (?:to|acceptance|success)|kabul(?:ü)? garanti|mahkemeye hazır|kesin kabul|kesinlikle kazan|gerichtsfest|prêt pour le tribunal)/i;

function citationsIn(text) {
  return new Set(
    (String(text || '').match(CITATION_RE) || []).map((m) => m.toLowerCase().replace(/\s+/g, ''))
  );
}

function normalizeForMatch(text) {
  return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function buildImproveWordingPrompt(draft, locale = 'en') {
  if (!draft) return '';
  const lang = langOf(locale);
  return [
    'TASK: Improve the wording of the letter body below. Output ONLY the rewritten body text.',
    `Write in the same language as the body (locale: ${lang}).`,
    'STRICT RULES:',
    '- Do NOT add any new fact, date, amount, name, deadline or demand.',
    '- Keep every name, amount, date and number exactly as written.',
    '- Keep every "[ … ]" blank exactly as written; do not fill it.',
    '- Do NOT add any statute, article number, case law, court decision or citation.',
    '- Do NOT claim the document is court-ready, guaranteed or certain to be accepted.',
    '- No headings, no markdown, no commentary before or after the body.',
    '',
    '<<<BODY',
    String(draft.body || '').trim(),
    'BODY>>>',
  ].join('\n');
}

/**
 * Accept an LLM rewrite only if it keeps every short answer verbatim,
 * keeps blanks, adds no citation and makes no over-claim.
 * @returns {{ ok: boolean, draft: object, reason?: string }}
 */
export function applyImprovedWording(draft, improvedText) {
  if (!draft) return { ok: false, draft, reason: 'empty' };
  let body = String(improvedText || '')
    .replace(/^[\s\S]*?<<<BODY\s*/, '')
    .replace(/\s*BODY>>>[\s\S]*$/, '')
    .trim();
  body = stripTrailingDisclaimer(body, draft.disclaimer);
  if (!body) return { ok: false, draft, reason: 'empty' };

  const template = getDraftTemplateById(draft.templateId);
  const shortIds = new Set(
    (template?.questions || []).filter((q) => q.type !== 'multiline').map((q) => q.id)
  );
  const hay = normalizeForMatch(body);
  for (const [id, value] of Object.entries(draft.answers || {})) {
    if (!shortIds.has(id) || value.length > 80) continue;
    if (!hay.includes(normalizeForMatch(value))) return { ok: false, draft, reason: 'fact_dropped' };
  }

  const blanks = String(draft.body || '').match(/\[ [^\]]+ \]/g) || [];
  if (blanks.some((b) => !body.includes(b))) return { ok: false, draft, reason: 'blank_filled' };

  const allowed = citationsIn(`${draft.body}\n${draft.reference}`);
  for (const c of citationsIn(body)) {
    if (!allowed.has(c)) return { ok: false, draft, reason: 'new_citation' };
  }
  if (OVERCLAIM_RE.test(body) && !OVERCLAIM_RE.test(draft.body)) return { ok: false, draft, reason: 'overclaim' };

  const next = { ...draft, body, improved: true };
  next.text = formatDraftForSharing(next, 'plain');
  return { ok: true, draft: next };
}
