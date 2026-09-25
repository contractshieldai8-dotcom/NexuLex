/**
 * WAVE GR.1 — First-value intents. Pure routing: the sheet and the home chips share this list.
 * NexuLex never promises an outcome; these only open an existing tool.
 */
export const FIRST_INTENTS = [
  { id: 'analyze', icon: 'shield-checkmark-outline', titleKey: 'fiAnalyze', hintKey: 'fiAnalyzeHint', action: { type: 'openTab', id: 'analyze' } },
  { id: 'ask', icon: 'help-buoy-outline', titleKey: 'fiAsk', hintKey: 'fiAskHint', action: { type: 'openAdvisorTool', id: 'legal_ask' } },
  { id: 'case', icon: 'folder-open-outline', titleKey: 'fiCase', hintKey: 'fiCaseHint', action: { type: 'openAdvisorTool', id: 'case_files' } },
  { id: 'guides', icon: 'map-outline', titleKey: 'fiGuides', hintKey: 'fiGuidesHint', action: { type: 'openAdvisorTool', id: 'process_guides' } },
  { id: 'lawyer', icon: 'briefcase-outline', titleKey: 'fiLawyer', hintKey: 'fiLawyerHint', action: { type: 'openAdvisorTool', id: 'lawyer_handoff' } },
];

export const FIRST_INTENT_IDS = FIRST_INTENTS.map((item) => item.id);

export function actionForIntent(id) {
  return FIRST_INTENTS.find((item) => item.id === id)?.action || null;
}

export function firstIntentKeys() {
  return FIRST_INTENTS.flatMap((item) => [item.titleKey, item.hintKey]).concat([
    'fiTitle', 'fiHint', 'fiSkip', 'fiDisclaimer', 'fiHomeTitle', 'fiHomeHint',
  ]);
}

export function assertFirstIntentFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`firstIntent: ${msg}`);
  };
  check(FIRST_INTENTS.length === 5, 'five first-value paths');
  check(new Set(FIRST_INTENT_IDS).size === FIRST_INTENTS.length, 'unique ids');
  check(FIRST_INTENTS.every((item) => item.icon && item.titleKey && item.hintKey && item.action?.type), 'each intent is complete');
  check(actionForIntent('analyze')?.id === 'analyze' && actionForIntent('ask')?.id === 'legal_ask', 'analyze and ask routes');
  check(actionForIntent('case')?.id === 'case_files' && actionForIntent('guides')?.id === 'process_guides', 'case and guides routes');
  check(actionForIntent('lawyer')?.id === 'lawyer_handoff' && !actionForIntent('bogus'), 'lawyer route; unknown id is null');
  check(FIRST_INTENTS.filter((item) => item.action.type === 'openAdvisorTool').length === 4, 'four advisor tools');
  check(firstIntentKeys().length === 16, 'sixteen copy keys');
  return { cases };
}
