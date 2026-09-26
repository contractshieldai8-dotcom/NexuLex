/**
 * WAVE UX.24 — Analyze post-scan action dock. Ingest collapses; next steps stay on top.
 * Does not rewrite UX.5 empty-home, previewBanner, or applyFreePreview.
 */

import { FIRST_INTENT_IDS } from './firstIntent';
import { hookForFirstIntent } from './paywallIntent';

export const ANALYZE_DOCK_LOCALE_KEYS = [
  'ux24Dock',
  'ux24Setup',
  'ux24Expand',
  'ux24Collapse',
  'ux24New',
  'ux24Report',
  'ux24Guides',
  'ux24Disclaimer',
];

export const ANALYZE_DOCK_ACTIONS = ['report', 'setup', 'new', 'guides'];

export function shouldCollapseAnalyzeIngest({ hasResult, setupOpen, loading, workspaceMode }) {
  return Boolean(hasResult && !setupOpen && !loading && workspaceMode === 'analyze');
}

export function assertAnalyzeDockLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`analyzeDockLocale: ${msg}`);
  };
  check(
    ANALYZE_DOCK_LOCALE_KEYS.length === 8 &&
      ANALYZE_DOCK_LOCALE_KEYS[ANALYZE_DOCK_LOCALE_KEYS.length - 1] === 'ux24Disclaimer',
    'eight keys, disclaimer last'
  );
  check(ANALYZE_DOCK_ACTIONS.join(',') === 'report,setup,new,guides', 'dock actions stay');
  check(
    shouldCollapseAnalyzeIngest({ hasResult: true, setupOpen: false, loading: false, workspaceMode: 'analyze' }),
    'result hides ingest'
  );
  check(
    !shouldCollapseAnalyzeIngest({ hasResult: true, setupOpen: false, loading: true, workspaceMode: 'analyze' }),
    'loading keeps ingest'
  );
  check(
    !shouldCollapseAnalyzeIngest({ hasResult: false, setupOpen: false, loading: false, workspaceMode: 'analyze' }),
    'empty home keeps ingest'
  );
  check(
    !shouldCollapseAnalyzeIngest({ hasResult: true, setupOpen: true, loading: false, workspaceMode: 'analyze' }),
    'expanded setup stays'
  );
  check(FIRST_INTENT_IDS.join(',') === 'analyze,ask,case,guides,lawyer', 'GR.1 order stays');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  return { cases };
}
