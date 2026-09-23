/**
 * WAVE CA′ — Deterministic scenario roadmap (0 LLM, 0 network).
 */

import i18n from '../i18n';
import { getScenarioById, resolveTemplateId } from '../constants/legalScenarios';

function tKey(key, locale) {
  if (!key) return '';
  const lang = String(locale || i18n.language || 'en').slice(0, 2);
  try {
    return String(i18n.getFixedT(lang)(key) || '').trim();
  } catch (_error) {
    return String(key);
  }
}

/**
 * @returns {{
 *   scenarioId: string,
 *   title: string,
 *   steps: Array<{ stepNumber: number, title: string, detail: string, timeHint?: string, docHint?: string }>,
 *   lawyerThreshold: string,
 *   disclaimer: string,
 *   answers: Record<string, string>,
 *   templateId: string,
 * } | null}
 */
export function generateScenarioRoadmap(scenarioId, answers = {}, locale = 'en') {
  const scenario = getScenarioById(scenarioId);
  if (!scenario) return null;

  const templateId = resolveTemplateId(scenario, answers);
  const template = scenario.templates?.[templateId] || scenario.templates?.default;
  if (!template) return null;

  const steps = (template.steps || []).map((item) => {
    const out = {
      stepNumber: Number(item.stepNumber) || 0,
      title: tKey(item.titleKey, locale),
      detail: tKey(item.detailKey, locale),
    };
    if (item.timeHintKey) {
      const timeHint = tKey(item.timeHintKey, locale);
      if (timeHint) out.timeHint = timeHint;
    }
    if (item.docHintKey) {
      const docHint = tKey(item.docHintKey, locale);
      if (docHint) out.docHint = docHint;
    }
    return out;
  });

  return {
    scenarioId: scenario.id,
    title: tKey(scenario.titleKey, locale),
    steps,
    lawyerThreshold: tKey(template.lawyerThresholdKey, locale),
    disclaimer: tKey(template.disclaimerKey || 'scenarioLegalDisclaimer', locale),
    answers: { ...(answers || {}) },
    templateId,
  };
}

/**
 * Clean share/copy text. Always appends mandatory disclaimer at the end.
 * @param {'plain'|'whatsapp'|'email'} format
 */
export function formatRoadmapForSharing(roadmap, format = 'plain') {
  if (!roadmap || typeof roadmap !== 'object') return '';
  const lines = [];
  const title = String(roadmap.title || roadmap.scenarioId || '').trim();
  if (title) lines.push(title);
  lines.push('');

  (roadmap.steps || []).forEach((step) => {
    const n = step.stepNumber || '';
    const head = String(step.title || '').trim();
    const detail = String(step.detail || '').trim();
    lines.push(`${n}. ${head}`.trim());
    if (detail) lines.push(detail);
    if (step.timeHint) lines.push(`⏱ ${step.timeHint}`);
    if (step.docHint) lines.push(`📎 ${step.docHint}`);
    lines.push('');
  });

  const lawyer = String(roadmap.lawyerThreshold || '').trim();
  if (lawyer) {
    lines.push(`⚠ ${lawyer}`);
    lines.push('');
  }

  // Force disclaimer at absolute end (Copy / WhatsApp / Email).
  const disclaimer = String(roadmap.disclaimer || '').trim();
  if (disclaimer) {
    lines.push('—');
    lines.push(disclaimer);
  }

  let text = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  if (format === 'whatsapp' || format === 'email') {
    // Same body; Share API / wa.me consumers use plain text.
    text = text;
  }
  return text;
}

/** Prefill freeform advisor question from roadmap context (no LLM here). */
export function buildAdvisorFollowUpPrompt(roadmap, locale = 'en') {
  if (!roadmap) return '';
  const intro = tKey('scenarioAskAdvisorPrompt', locale);
  const body = formatRoadmapForSharing(roadmap, 'plain');
  return `${intro}\n\n${body}`.trim();
}
