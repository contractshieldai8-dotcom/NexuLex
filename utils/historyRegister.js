/**
 * WAVE UX.23 — History command center. Client-side filter + metadata register.
 * Never copies contract text, clauses or images into the export.
 */

import { LIFECYCLES, normalizeLifecycle } from './lifecycle';

export const HISTORY_RISK_FILTERS = ['all', 'RED', 'YELLOW', 'GREEN'];
export const HISTORY_LIFECYCLE_FILTERS = ['all', ...LIFECYCLES];

const FORBIDDEN = /contract_?text|originalText|clauses|images|base64|pdfBody/i;

export function normalizeHistoryRisk(value) {
  const raw = String(value || '').toUpperCase();
  if (raw === 'RED' || raw === 'YELLOW' || raw === 'GREEN') return raw;
  return '';
}

export function filterHistoryRows(rows, { query = '', risk = 'all', lifecycle = 'all', extra } = {}) {
  const needle = String(query || '').trim().toLowerCase();
  const riskCode = String(risk || 'all').toUpperCase();
  const lifeCode = String(lifecycle || 'all').toLowerCase();
  return (rows || []).filter((item) => {
    if (riskCode !== 'ALL' && normalizeHistoryRisk(item.overall_risk || item.overallRisk) !== riskCode) return false;
    if (lifeCode !== 'all' && normalizeLifecycle(item.lifecycle) !== lifeCode) return false;
    if (!needle) return true;
    const more = typeof extra === 'function' ? extra(item) : extra;
    const hay = [
      item.summary,
      item.parties,
      item.contract_category,
      item.contractCategory,
      item.id,
      more,
    ]
      .map((value) => String(value || '').toLowerCase())
      .join(' ');
    return hay.includes(needle);
  });
}

export function buildHistoryRegisterRows(rows) {
  return (rows || []).map((item) => {
    const row = {
      id: String(item.id || ''),
      createdAt: String(item.created_at || item.createdAt || ''),
      score: item.score == null ? '' : String(item.score),
      risk: normalizeHistoryRisk(item.overall_risk || item.overallRisk),
      lifecycle: normalizeLifecycle(item.lifecycle),
      category: String(item.contract_category || item.contractCategory || '').toLowerCase(),
      parties: String(item.parties || item.contractRadar?.parties || '').trim(),
      summary: String(item.summary || '').replace(/\s+/g, ' ').trim().slice(0, 180),
    };
    if (FORBIDDEN.test(JSON.stringify(row))) throw new Error('historyRegister: contract field leaked');
    return row;
  });
}

export function formatHistoryRegisterCsv(rows) {
  const lines = ['id,createdAt,score,risk,lifecycle,category,parties,summary'];
  for (const row of buildHistoryRegisterRows(rows)) {
    const cells = [row.id, row.createdAt, row.score, row.risk, row.lifecycle, row.category, row.parties, row.summary].map(
      (cell) => `"${String(cell).replace(/"/g, '""')}"`
    );
    lines.push(cells.join(','));
  }
  const csv = lines.join('\n');
  if (FORBIDDEN.test(csv)) throw new Error('historyRegister: csv leaked a contract field');
  return csv;
}

export function formatHistoryRegisterJson(rows) {
  const json = JSON.stringify({ kind: 'nexulex-history-register', rows: buildHistoryRegisterRows(rows) }, null, 2);
  if (FORBIDDEN.test(json)) throw new Error('historyRegister: json leaked a contract field');
  return json;
}
