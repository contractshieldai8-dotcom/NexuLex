// NexuLex AI — "Report AI output" (Google Play AI-generated content policy).
// Reports reuse the support_messages pipeline; no schema change.

import { submitSupportMessage } from './support';

export const AI_REPORT_SUBJECT_PREFIX = 'ai_report:';
export const AI_REPORT_FEATURES = ['analysis_report', 'advisor_answer', 'draft_polish'];
export const AI_REPORT_REASONS = [
  { id: 'incorrect', labelKey: 'aiReportReasonIncorrect' },
  { id: 'harmful', labelKey: 'aiReportReasonHarmful' },
  { id: 'offensive', labelKey: 'aiReportReasonOffensive' },
  { id: 'other', labelKey: 'aiReportReasonOther' },
];
export const AI_REPORT_CONTEXT_MAX = 2000;
const NOTE_MAX = 1000;

export function buildAiReport({
  featureId,
  reason,
  note = '',
  targetId = '',
  locale = '',
  country = '',
  includeContext = false,
  context = '',
} = {}) {
  if (!AI_REPORT_FEATURES.includes(featureId)) throw new Error('AI_REPORT_FEATURE');
  const reasonId = AI_REPORT_REASONS.some((item) => item.id === reason) ? reason : 'other';
  const lines = [`reason: ${reasonId}`];
  const cleanNote = String(note || '').trim().slice(0, NOTE_MAX);
  if (cleanNote) lines.push(`note: ${cleanNote}`);
  // Raw contract / answer text is attached only after an explicit opt-in.
  const attached = includeContext ? String(context || '').trim().slice(0, AI_REPORT_CONTEXT_MAX) : '';
  if (attached) lines.push('context:', attached);
  lines.push(
    `meta: ${JSON.stringify({
      id: String(targetId || ''),
      locale: String(locale || ''),
      country: String(country || ''),
    })}`
  );
  return { subject: `${AI_REPORT_SUBJECT_PREFIX}${featureId}`, message: lines.join('\n') };
}

export async function submitAiReport(input = {}) {
  const { subject, message } = buildAiReport(input);
  return submitSupportMessage({ subject, message, locale: input.locale || null });
}
