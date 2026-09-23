import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';

import { escapeHtml } from './analysis';
import { writeOwnedUtf8 } from './fileAccess';

const PAGE_CHAR_BUDGET = 2400;
const PAGE_LINE_BUDGET = 48;
const TOP_HEADING_RE =
  /^\s*(?:MADDE|ARTICLE|ART(?:[IİÍ]CULO|IGO|IKEL|\.?)|CLAUSE|CL[AÁ]USULA|B[ÖO]L[ÜU]M)\s+\d{1,2}(?:\s*[.)]\s+|\s*[—–-]\s+|\s+|$)/i;
const TOP_NUM_RE = /^\s*\d{1,2}\s*[.)]\s/;
const SUB_HEADING_RE = /^\s*\d{1,2}\.\d{1,2}(?:\s*[.)]\s+|\s+)/;
const TABLE_CAPTION_RE = /^\s*(PROJE\s+TAKV[İI]M[İI]|TAKV[İI]M|A[sşŞ]ama)\b/i;

export function decodePlainText(text) {
  let out = String(text || '')
    .replace(/&emsp;?/gi, ' ')
    .replace(/&nbsp;?/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, n) => {
      const code = Number(n);
      return Number.isFinite(code) ? String.fromCharCode(code) : '';
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => {
      const code = parseInt(n, 16);
      return Number.isFinite(code) ? String.fromCharCode(code) : '';
    })
    .replace(/\u2003/g, ' ')
    .replace(/\uFFFD/g, '');
  try {
    out = out.normalize('NFC');
  } catch {
    /* NFC yoksa ham metin */
  }
  return out;
}

const isTopHeadingLine = (line) => {
  const value = String(line || '').replace(/\r$/, '');
  if (SUB_HEADING_RE.test(value)) return false;
  if (/^\s*B[ÖO]L[ÜU]M\b/i.test(value)) return true;
  return TOP_HEADING_RE.test(value) || TOP_NUM_RE.test(value);
};

const isGridLine = (line) => {
  const value = String(line || '');
  return /\t/.test(value) || /\|/.test(value);
};

const isTableCaptionLine = (line) => TABLE_CAPTION_RE.test(String(line || '').trim());

const markTableLines = (lines) => {
  const table = Array(lines.length).fill(false);
  lines.forEach((line, i) => {
    if (isGridLine(line)) table[i] = true;
  });
  for (let i = 0; i < lines.length; i += 1) {
    if (table[i] && i > 0 && isTableCaptionLine(lines[i - 1])) table[i - 1] = true;
  }
  return table;
};

const lineCount = (text) => String(text || '').split('\n').length;

const fitsBudget = (text) => {
  const raw = String(text || '');
  return raw.length <= PAGE_CHAR_BUDGET && lineCount(raw) <= PAGE_LINE_BUDGET;
};

const splitAtSentence = (text) => {
  const raw = String(text || '');
  if (fitsBudget(raw)) return raw ? [raw] : [];
  const parts = [];
  let rest = raw;
  while (rest.length > PAGE_CHAR_BUDGET || lineCount(rest) > PAGE_LINE_BUDGET) {
    const window = rest.slice(0, PAGE_CHAR_BUDGET);
    const byLine = window.lastIndexOf('\n');
    const byStop = Math.max(
      window.lastIndexOf('. '),
      window.lastIndexOf('! '),
      window.lastIndexOf('? '),
      window.lastIndexOf('.\n'),
      window.lastIndexOf('!\n'),
      window.lastIndexOf('?\n')
    );
    let cut = Math.max(byLine, byStop);
    if (cut < PAGE_CHAR_BUDGET * 0.35) cut = window.lastIndexOf(' ');
    if (cut < 1) cut = Math.min(PAGE_CHAR_BUDGET, rest.length);
    else if (rest[cut] === '.' || rest[cut] === '!' || rest[cut] === '?') cut += 1;
    else if (rest[cut] === ' ' && /[.!?]/.test(rest[cut - 1] || '')) {
      /* already after punctuation */
    }
    parts.push(rest.slice(0, cut).replace(/\s+$/, ''));
    rest = rest.slice(cut).replace(/^\s+/, '');
  }
  if (rest) parts.push(rest);
  return parts.filter(Boolean);
};

const splitBlocks = (text) => {
  const lines = decodePlainText(text).replace(/\r\n/g, '\n').split('\n');
  const table = markTableLines(lines);
  const blocks = [];
  let current = [];
  let currentTable = false;
  const flush = () => {
    if (!current.length) return;
    blocks.push({ text: current.join('\n'), table: currentTable });
    current = [];
    currentTable = false;
  };
  lines.forEach((line, i) => {
    if (table[i]) {
      if (current.length && !currentTable) flush();
      currentTable = true;
      current.push(line);
      if (!table[i + 1]) flush();
      return;
    }
    if (isTopHeadingLine(line) && current.length) flush();
    if (!line.trim() && current.length) {
      flush();
      return;
    }
    current.push(line);
  });
  flush();
  return blocks.filter((block) => String(block.text || '').trim());
};

const coalesceHeadingParagraph = (blocks) => {
  const out = [];
  for (let i = 0; i < blocks.length; i += 1) {
    if (blocks[i].table) {
      out.push(blocks[i]);
      continue;
    }
    const first = (blocks[i].text.split('\n').find((line) => line.trim()) || '').trim();
    const headingOnly =
      isTopHeadingLine(first) &&
      blocks[i].text.split('\n').filter((line) => line.trim()).length === 1;
    const next = blocks[i + 1];
    const nextFirst = next
      ? (next.text.split('\n').find((line) => line.trim()) || '').trim()
      : '';
    if (headingOnly && next && !next.table && !isTopHeadingLine(nextFirst)) {
      out.push({ text: `${blocks[i].text}\n\n${next.text}`, table: false });
      i += 1;
    } else {
      out.push(blocks[i]);
    }
  }
  return out;
};

const splitOversized = (text) => {
  if (fitsBudget(text)) return [text];
  const paras = String(text).split(/\n{2,}/);
  const out = [];
  let buf = '';
  paras.forEach((para) => {
    const next = buf ? `${buf}\n\n${para}` : para;
    if (fitsBudget(next)) {
      buf = next;
      return;
    }
    if (buf) out.push(buf);
    if (fitsBudget(para)) buf = para;
    else {
      out.push(...splitAtSentence(para));
      buf = '';
    }
  });
  if (buf) out.push(buf);
  return out.filter(Boolean);
};

const splitTableByRows = (text) => {
  const rows = String(text || '').split('\n');
  const out = [];
  let buf = [];
  rows.forEach((row) => {
    const next = buf.length ? `${buf.join('\n')}\n${row}` : row;
    if (buf.length && !fitsBudget(next)) {
      out.push(buf.join('\n'));
      buf = [row];
    } else {
      buf.push(row);
    }
  });
  if (buf.length) out.push(buf.join('\n'));
  return out.filter(Boolean);
};

export function paginatePlainPages(text) {
  const blocks = coalesceHeadingParagraph(splitBlocks(text));
  const pages = [];
  let page = [];
  let packed = '';

  const flush = () => {
    if (!page.length) return;
    pages.push(page.join('\n\n'));
    page = [];
    packed = '';
  };

  const tryAdd = (chunk) => {
    const next = packed ? `${packed}\n\n${chunk}` : chunk;
    if (page.length && !fitsBudget(next)) return false;
    page.push(chunk);
    packed = next;
    return true;
  };

  const preventOrphanHeading = () => {
    if (packed.length < PAGE_CHAR_BUDGET * 0.7 && lineCount(packed) < PAGE_LINE_BUDGET - 6) return;
    const lines = packed.split('\n');
    if (lines.length < 4) return;
    const start = Math.max(0, lines.length - 3);
    for (let i = start; i < lines.length; i += 1) {
      if (!isTopHeadingLine(lines[i])) continue;
      if (i === 0) return;
      const before = lines.slice(0, i).join('\n').replace(/\s+$/, '');
      const after = lines.slice(i).join('\n');
      if (!before.trim()) return;
      pages.push(before);
      page = after ? [after] : [];
      packed = after;
      return;
    }
  };

  blocks.forEach((block) => {
    if (block.table) {
      if (fitsBudget(block.text)) {
        if (!tryAdd(block.text)) {
          flush();
          tryAdd(block.text);
        }
        preventOrphanHeading();
        return;
      }
      if (page.length) flush();
      splitTableByRows(block.text).forEach((piece) => {
        if (!tryAdd(piece)) {
          flush();
          tryAdd(piece);
        }
      });
      preventOrphanHeading();
      return;
    }
    const pieces = fitsBudget(block.text) ? [block.text] : splitOversized(block.text);
    pieces.forEach((piece) => {
      if (!tryAdd(piece)) {
        flush();
        if (!tryAdd(piece)) {
          splitAtSentence(piece).forEach((bit) => {
            if (!tryAdd(bit)) {
              flush();
              tryAdd(bit);
            }
          });
        }
      }
      preventOrphanHeading();
    });
  });
  flush();
  return pages.length ? pages : [decodePlainText(text)];
}

const PAGE_CSS = `
  @page { size: A4; margin: 16mm; }
  html, body { margin: 0; padding: 0; color: #0F172A; }
  .page {
    box-sizing: border-box;
    width: 178mm;
    max-height: 265mm;
    overflow: hidden;
    page-break-after: always;
    page-break-inside: auto;
  }
  .page:last-child { page-break-after: auto; }
  pre.doc {
    white-space: pre-wrap;
    word-break: normal;
    overflow-wrap: break-word;
    font-family: Georgia, serif;
    font-size: 12px;
    line-height: 1.5;
    margin: 0;
  }
`;

export function paginatePlainBody(text) {
  return paginatePlainPages(text)
    .map((page) => `<div class="page"><pre class="doc">${escapeHtml(page)}</pre></div>`)
    .join('\n');
}

export function paginatePlainHtml(text) {
  return `<html><head><meta charset="utf-8" />
<style>${PAGE_CSS}</style></head>
<body>
${paginatePlainBody(text)}
</body></html>`;
}

export async function exportPlain(text, filename, { shareAlways = false } = {}) {
  const body = decodePlainText(text);
  if (!body) return { text: '', uri: '' };
  const uri = await writeOwnedUtf8(body, filename);
  try {
    await Clipboard.setStringAsync(body);
  } catch {
    /* panoya yazılamadı; dosya asıl taşıyıcı */
  }
  if ((shareAlways || body.length > 8000) && uri) {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'text/plain',
          dialogTitle: filename,
          UTI: 'public.plain-text',
        });
      }
    } catch {
      /* paylaşım isteğe bağlı */
    }
  }
  return { text: body, uri };
}
