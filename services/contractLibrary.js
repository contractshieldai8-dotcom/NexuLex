/**
 * WAVE CL.1 - Contract Library engine (local fill, 0 LLM, 0 network).
 * Pure functions: the vendored Markdown source is passed in, so this file is testable in plain Node.
 * Missing answers become visible "[ ... ]" blanks (or underscore signature lines); nothing is invented.
 */

import {
  CONTRACT_FIELDS,
  CONTRACT_FREE_PREVIEW_BLOCKS,
  CONTRACT_SIGNATURE_LINE,
  getContractTemplateById,
} from '../constants/contractTemplates';
import { CONTRACT_LIBRARY_SOURCE } from '../constants/contractLibrary/source';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MAX_SINGLE = 300;
const MAX_MULTI = 1500;
const FOOTER_MARKER = 'This template was prepared and made publicly available';

/** 31.01.2026 -> "31 January 2026". Free text (already a written date) is kept as typed. */
export function formatContractDate(raw) {
  const value = String(raw ?? '').trim();
  const m = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!m) return value;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (dt.getUTCFullYear() !== year || dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) return value;
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/** Strips anything that could be read as Markdown / HTML by the renderer, then trims and clamps. */
export function cleanContractAnswer(fieldId, raw) {
  const field = CONTRACT_FIELDS[fieldId];
  if (!field) return '';
  const multi = field.type === 'multiline';
  let value = String(raw ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/<\/?mark>/gi, '')
    .replace(/[*`\\]/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
  value = multi
    ? value
        .split('\n')
        .map((line) => line.replace(/[ \t]+/g, ' ').trim())
        .filter(Boolean)
        .join('\n')
        .slice(0, MAX_MULTI)
    : value.replace(/\s+/g, ' ').trim().slice(0, MAX_SINGLE);
  if (field.type === 'date') value = formatContractDate(value);
  return value.trim();
}

function stripMarks(text) {
  return String(text).replace(/<\/?mark>/g, '');
}

function makeGetter(template, answers) {
  const values = {};
  (template.fields || []).forEach((id) => {
    const cleaned = cleanContractAnswer(id, answers?.[id]);
    if (cleaned) values[id] = cleaned;
  });
  const blank = (id) => `[ ${CONTRACT_FIELDS[id]?.blank || id} ]`;
  return {
    values,
    val: (id) => values[id] || blank(id),
    opt: (id, fallback, format) => (values[id] ? (format ? format(values[id]) : values[id]) : fallback),
    line: (id) => values[id] || CONTRACT_SIGNATURE_LINE,
  };
}

function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  let count = 0;
  let from = 0;
  for (;;) {
    const at = haystack.indexOf(needle, from);
    if (at === -1) return count;
    count += 1;
    from = at + needle.length;
  }
}

/** Applies the template rules to the raw Markdown. Exposed for the offline test. */
export function applyContractRules(template, source, answers = {}) {
  const g = makeGetter(template, answers);
  let text = String(source || '');
  const unmatched = [];
  (template.rules || []).forEach((rule) => {
    const hits = countOccurrences(text, rule.find);
    if (hits === 0 || (!rule.all && hits !== 1)) {
      unmatched.push(rule.find);
      return;
    }
    const replacement = String(rule.apply(g));
    text = text.split(rule.find).join(replacement);
  });

  let body = text;
  let footer = '';
  const footerAt = text.indexOf(FOOTER_MARKER);
  if (footerAt !== -1) {
    const ruleAt = text.lastIndexOf('---', footerAt);
    const cut = ruleAt !== -1 && footerAt - ruleAt < 12 ? ruleAt : footerAt;
    body = text.slice(0, cut).replace(/\s+$/, '');
    footer = text.slice(cut);
  }
  const prefix = template.prefix ? template.prefix(g) : '';
  const suffix = template.suffix ? template.suffix(g) : '';
  return { markdown: `${prefix}${body}\n${suffix}\n${footer}`, unmatched, values: g.values };
}

function inline(raw) {
  return stripMarks(raw)
    .replace(/\\([\\`*_{}[\]()#+\-.!|<>~"'])/g, '$1')
    .replace(/\*{3}([^*]+?)\*{3}/g, '$1')
    .replace(/\*{2}([^*]+?)\*{2}/g, '$1')
    .replace(/(^|[^*\w])\*([^*\n]+?)\*(?!\w)/g, '$1$2')
    .replace(/\*/g, '')
    .replace(/\t+/g, '    ')
    .replace(/\u00a0/g, ' ');
}

function tidy(text) {
  return /\t/.test(text) ? text.trim() : text.replace(/ {2,}/g, ' ').trim();
}

function isFullyEmphasised(line) {
  return /^\*+[^*].*\*+$/.test(line.trim());
}

function letterMarker(index) {
  return `(${String.fromCharCode(97 + (index % 26))})`;
}

/**
 * Markdown (as published upstream) -> typed blocks.
 * type: title | heading | clause | sub | bullet | text | rule | footer
 */
export function renderContractBlocks(markdown, { numbering = 'native' } = {}) {
  const lines = String(markdown || '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''));

  // Headings split over two lines ("**Annex 1" / "Data Processing Details**") are re-joined.
  const joined = [];
  for (let i = 0; i < lines.length; i += 1) {
    let line = lines[i];
    const opens = (line.match(/\*\*/g) || []).length;
    if (/^\*\*/.test(line) && opens % 2 === 1 && !/^\s*\d+\.\s/.test(line)) {
      let j = i + 1;
      while (j < lines.length && j - i < 3 && lines[j].trim() && (lines[j].match(/\*\*/g) || []).length % 2 === 0) j += 1;
      if (j < lines.length && lines[j].trim() && (lines[j].match(/\*\*/g) || []).length % 2 === 1) {
        line = `${line.trim()} - ${lines
          .slice(i + 1, j + 1)
          .map((x) => x.trim())
          .join(' ')}`;
        i = j;
      }
    }
    joined.push(line);
  }

  const blocks = [];
  let counter = 0;
  let subCounter = 0;
  let sawTitle = false;
  let seenFooter = false;

  const push = (block) => {
    if (!block.text && block.type !== 'rule') return;
    if (block.type === 'rule' && (!blocks.length || blocks[blocks.length - 1].type === 'rule')) return;
    blocks.push(block);
  };

  joined.forEach((line, lineIndex) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (/^_+$/.test(trimmed)) return;
    if (/^-{3,}$/.test(trimmed)) {
      push({ type: 'rule', text: '' });
      return;
    }
    if (trimmed.startsWith(FOOTER_MARKER)) seenFooter = true;
    if (seenFooter) {
      push({ type: 'footer', text: tidy(inline(trimmed)) });
      return;
    }
    if (/^\|/.test(trimmed)) {
      if (/^\|[\s|:-]+\|?$/.test(trimmed)) return;
      const cells = trimmed
        .replace(/^\||\|$/g, '')
        .split('|')
        .map((cell) => tidy(inline(cell)))
        .filter(Boolean);
      push({ type: 'text', text: cells.join('  |  ') });
      return;
    }
    const numbered = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    // A fully emphasised list item is a real clause only when it introduces nested items ("1. **Definitions.**");
    // otherwise it is a layout artefact ("20. ***[Remainder of page intentionally left blank]***").
    let introducesSubs = false;
    if (numbered && isFullyEmphasised(numbered[3])) {
      let next = lineIndex + 1;
      while (next < joined.length && !joined[next].trim()) next += 1;
      introducesSubs = next < joined.length && /^\s{2,}\d+\.\s/.test(joined[next]);
    }
    if (numbered && (!isFullyEmphasised(numbered[3]) || introducesSubs)) {
      const indent = numbered[1].length;
      if (indent === 0) {
        counter = numbering === 'continuous' ? counter + 1 : Number(numbered[2]);
        subCounter = 0;
        push({ type: 'clause', marker: `${counter}.`, text: tidy(inline(numbered[3])) });
      } else {
        push({ type: 'sub', marker: letterMarker(subCounter), text: tidy(inline(numbered[3])) });
        subCounter += 1;
      }
      return;
    }
    const content = numbered ? numbered[3] : trimmed;
    const bullet = !numbered && trimmed.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      push({ type: 'bullet', marker: '\u2022', text: tidy(inline(bullet[1])) });
      return;
    }
    const text = tidy(inline(content));
    if (!sawTitle && isFullyEmphasised(content)) {
      sawTitle = true;
      push({ type: 'title', text });
      return;
    }
    sawTitle = true;
    if (isFullyEmphasised(content) && text.length <= 140) {
      push({ type: 'heading', text });
      return;
    }
    push({ type: 'text', text });
  });

  while (blocks.length && blocks[blocks.length - 1].type === 'rule') blocks.pop();

  // A lone nested item ("(a)" with no "(b)") is an upstream list artefact: show it as plain text.
  for (let i = 0; i < blocks.length; i += 1) {
    if (blocks[i].type !== 'sub') continue;
    const prevSub = i > 0 && blocks[i - 1].type === 'sub';
    const nextSub = i + 1 < blocks.length && blocks[i + 1].type === 'sub';
    if (!prevSub && !nextSub) blocks[i] = { type: 'text', text: blocks[i].text };
  }
  return blocks;
}

export function blockToPlain(block) {
  if (block.type === 'rule') return '';
  if (block.type === 'title') return block.text.toUpperCase();
  if (block.type === 'clause') return `${block.marker} ${block.text}`;
  if (block.type === 'sub') return `    ${block.marker} ${block.text}`;
  if (block.type === 'bullet') return `${block.marker} ${block.text}`;
  return block.text;
}

function blocksToPlain(blocks) {
  const out = [];
  blocks.forEach((block, index) => {
    const plain = blockToPlain(block);
    if (block.type === 'rule') {
      if (out.length && out[out.length - 1] !== '') out.push('');
      return;
    }
    const prev = blocks[index - 1];
    const tight = prev && ['sub', 'bullet'].includes(block.type) && ['sub', 'bullet', 'clause'].includes(prev.type);
    if (out.length && !tight && out[out.length - 1] !== '') out.push('');
    out.push(plain);
  });
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function contractAttribution() {
  const short = CONTRACT_LIBRARY_SOURCE.commit.slice(0, 7);
  return `Template: ${CONTRACT_LIBRARY_SOURCE.author} (${CONTRACT_LIBRARY_SOURCE.license}), ${CONTRACT_LIBRARY_SOURCE.url} @ ${short}. Completed with NexuLex. Not legal advice - have a lawyer licensed in the governing jurisdiction review this document before signing.`;
}

/**
 * @returns {{
 *   templateId: string, title: string, blocks: Array, text: string,
 *   missing: Array<{id: string, required: boolean}>, missingRequired: string[],
 *   answers: Record<string,string>, attribution: string, nexulexAddedParts: boolean,
 * } | null}
 */
export function buildContractDocument(templateId, answers = {}, source = '') {
  const template = getContractTemplateById(templateId);
  if (!template || !source) return null;
  const { markdown, values } = applyContractRules(template, source, answers);
  const blocks = renderContractBlocks(markdown, { numbering: template.numbering });
  const missing = (template.fields || [])
    .filter((id) => !values[id])
    .map((id) => ({ id, required: (template.required || []).includes(id) }));
  const attribution = contractAttribution();
  const doc = {
    templateId: template.id,
    title: template.documentTitle,
    blocks,
    missing,
    missingRequired: missing.filter((m) => m.required).map((m) => m.id),
    answers: values,
    attribution,
    nexulexAddedParts: !!template.nexulexAddedParts,
  };
  doc.text = formatContractForSharing(doc);
  return doc;
}

/** Copy / Share / DOCX body. The attribution + review line is always last. */
export function formatContractForSharing(doc) {
  if (!doc || typeof doc !== 'object') return '';
  const body = blocksToPlain(doc.blocks || []);
  const attribution = String(doc.attribution || '').trim();
  return attribution ? `${body}\n\n---\n${attribution}`.trim() : body;
}

/** Free tier: first N blocks only; `hiddenCount` drives the "locked" message. */
export function buildContractPreview(doc, limit = CONTRACT_FREE_PREVIEW_BLOCKS) {
  const blocks = doc?.blocks || [];
  const visible = blocks.filter((b) => b.type !== 'rule').slice(0, limit);
  const lastKept = visible.length ? blocks.indexOf(visible[visible.length - 1]) : -1;
  return {
    blocks: blocks.slice(0, lastKept + 1),
    hiddenCount: Math.max(0, blocks.filter((b) => b.type !== 'rule').length - visible.length),
    total: blocks.filter((b) => b.type !== 'rule').length,
  };
}

export function contractDocxFilename(doc) {
  const base = String(doc?.title || 'contract')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const day = new Date().toISOString().slice(0, 10);
  return `nexulex-${base || 'contract'}-${day}.docx`;
}
