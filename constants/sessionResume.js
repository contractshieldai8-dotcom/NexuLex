/**
 * WAVE GR.2 — Second-session resume. Pure routing: unfinished draft, last case, last question, last analysis.
 * Nothing here talks to the network. Draft text stays on the device.
 */

export const RESUME_KINDS = ['draft', 'case', 'ask', 'analysis'];
export const MIN_DRAFT_CHARS = 24;
export const MAX_DRAFT_CHARS = 20000;

export const RESUME_COPY_KEYS = [
  'rsTitle',
  'rsHint',
  'rsDraft',
  'rsDraftHint',
  'rsCase',
  'rsCaseHint',
  'rsAsk',
  'rsAskHint',
  'rsAnalysis',
  'rsAnalysisHint',
  'rsSkip',
  'rsDisclaimer',
  'rsHomeDraft',
  'rsHomeDraftHint',
  'rsHomeContinue',
  'rsHomeDismiss',
  'rsFileAgain',
  'rsMissing',
];

export function isUsableDraft(draft) {
  if (!draft || typeof draft !== 'object') return false;
  const text = String(draft.text || '').trim();
  const fileName = String(draft.fileName || '').trim();
  return text.length >= MIN_DRAFT_CHARS || !!fileName;
}

export function serializeDraft({ text = '', fileName = '' } = {}) {
  const next = {
    text: String(text || '').slice(0, MAX_DRAFT_CHARS),
    fileName: String(fileName || '').replace(/[/\\]/g, '').slice(0, 120),
    updatedAt: new Date().toISOString(),
  };
  return isUsableDraft(next) ? next : null;
}

export function parseDraft(raw) {
  if (!raw) return null;
  let data = raw;
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  return serializeDraft({ text: data.text, fileName: data.fileName });
}

export function collectResumeItems({ draft = null, lastCase = null, lastAsk = null, lastAnalysisId = '' } = {}) {
  const items = [];
  if (isUsableDraft(draft)) {
    items.push({ kind: 'draft', icon: 'document-text-outline', titleKey: 'rsDraft', hintKey: 'rsDraftHint' });
  }
  if (lastCase?.id) {
    items.push({ kind: 'case', icon: 'folder-open-outline', titleKey: 'rsCase', hintKey: 'rsCaseHint', entryId: lastCase.id });
  }
  if (lastAsk?.id) {
    items.push({ kind: 'ask', icon: 'help-buoy-outline', titleKey: 'rsAsk', hintKey: 'rsAskHint' });
  }
  if (!isUsableDraft(draft) && String(lastAnalysisId || '').trim()) {
    items.push({ kind: 'analysis', icon: 'shield-checkmark-outline', titleKey: 'rsAnalysis', hintKey: 'rsAnalysisHint' });
  }
  return items;
}

export function shouldOfferResumeSheet(items) {
  return (items || []).some((item) => item.kind === 'case' || item.kind === 'ask');
}

export function actionForResume(item) {
  if (!item?.kind) return null;
  if (item.kind === 'draft' || item.kind === 'analysis') return { type: 'openTab', id: 'analyze' };
  if (item.kind === 'case') return { type: 'openAdvisorTool', id: 'case_files', entryId: item.entryId || null };
  if (item.kind === 'ask') return { type: 'openAdvisorTool', id: 'legal_ask' };
  return null;
}

export function assertSessionResumeFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`sessionResume: ${msg}`);
  };
  check(!isUsableDraft(null) && !isUsableDraft({ text: 'short' }), 'short text is not a draft');
  check(isUsableDraft({ text: 'x'.repeat(MIN_DRAFT_CHARS) }) && isUsableDraft({ fileName: 'lease.pdf' }), 'length or file makes a draft');
  check(parseDraft('not-json') === null && parseDraft({ text: 'x'.repeat(MIN_DRAFT_CHARS) })?.text.length === MIN_DRAFT_CHARS, 'parse rejects junk');
  check(serializeDraft({ text: 'a'.repeat(MAX_DRAFT_CHARS + 50) }).text.length === MAX_DRAFT_CHARS, 'draft is capped');
  const withDraft = collectResumeItems({
    draft: { text: 'x'.repeat(MIN_DRAFT_CHARS), fileName: '' },
    lastCase: { id: 'c1' },
    lastAsk: { id: 'q1' },
    lastAnalysisId: 'a1',
  });
  check(withDraft.map((item) => item.kind).join(',') === 'draft,case,ask', 'draft hides the last-analysis card');
  const analysisOnly = collectResumeItems({ lastAnalysisId: 'a1' });
  check(analysisOnly.length === 1 && analysisOnly[0].kind === 'analysis' && !shouldOfferResumeSheet(analysisOnly), 'analysis-only does not open the sheet');
  check(shouldOfferResumeSheet(withDraft) && actionForResume(withDraft[1])?.id === 'case_files', 'case and ask open the sheet');
  check(actionForResume({ kind: 'ask' })?.id === 'legal_ask' && !actionForResume({ kind: 'bogus' }), 'ask route; unknown is null');
  check(RESUME_COPY_KEYS.length === 18 && RESUME_KINDS.length === 4, 'eighteen keys, four kinds');
  return { cases };
}
