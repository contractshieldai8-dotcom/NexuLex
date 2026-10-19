// Thin redline / Word exporters over stitchShieldDocument output.
// No second patch engine — uses applied { from, to } from the existing stitcher.

import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

import { escapeHtml } from './analysis';
import { decodePlainText } from './exportPlain';
import { readOwnedFile, writeOwnedBase64, cleanStaleExportCache } from './fileAccess';

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function utf8Bytes(text) {
  const str = String(text ?? '');
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str);
  const out = [];
  for (let i = 0; i < str.length; i += 1) {
    let code = str.charCodeAt(i);
    if (code < 0x80) out.push(code);
    else if (code < 0x800) out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    else if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
      const low = str.charCodeAt(++i);
      code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
      out.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    } else {
      out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }
  return Uint8Array.from(out);
}

function u16(n) {
  return [n & 0xff, (n >>> 8) & 0xff];
}

function u32(n) {
  return [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];
}

/** Minimal ZIP with STORE (no deflate) — valid OOXML that Word/WPS open. */
export function zipStore(files) {
  const locals = [];
  const central = [];
  let offset = 0;
  (files || []).forEach((file) => {
    const name = utf8Bytes(file.name);
    const data = file.data instanceof Uint8Array ? file.data : utf8Bytes(file.data || '');
    const crc = crc32(data);
    const local = [
      0x50, 0x4b, 0x03, 0x04,
      ...u16(20),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(crc),
      ...u32(data.length),
      ...u32(data.length),
      ...u16(name.length),
      ...u16(0),
      ...name,
      ...data,
    ];
    const localBytes = Uint8Array.from(local);
    locals.push(localBytes);
    const cen = [
      0x50, 0x4b, 0x01, 0x02,
      ...u16(20),
      ...u16(20),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(crc),
      ...u32(data.length),
      ...u32(data.length),
      ...u16(name.length),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(offset),
      ...name,
    ];
    central.push(Uint8Array.from(cen));
    offset += localBytes.length;
  });
  const centralSize = central.reduce((n, item) => n + item.length, 0);
  const end = Uint8Array.from([
    0x50, 0x4b, 0x05, 0x06,
    ...u16(0),
    ...u16(0),
    ...u16(files.length),
    ...u16(files.length),
    ...u32(centralSize),
    ...u32(offset),
    ...u16(0),
  ]);
  const total = offset + centralSize + end.length;
  const out = new Uint8Array(total);
  let at = 0;
  locals.forEach((chunk) => {
    out.set(chunk, at);
    at += chunk.length;
  });
  central.forEach((chunk) => {
    out.set(chunk, at);
    at += chunk.length;
  });
  out.set(end, at);
  return out;
}

export function bytesToBase64(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes || []);
  if (typeof btoa === 'function') {
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < u8.length; i += chunk) {
      binary += String.fromCharCode.apply(null, u8.subarray(i, i + chunk));
    }
    return btoa(binary);
  }
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let i = 0; i < u8.length; i += 3) {
    const a = u8[i];
    const b = i + 1 < u8.length ? u8[i + 1] : 0;
    const c = i + 2 < u8.length ? u8[i + 2] : 0;
    const triple = (a << 16) | (b << 8) | c;
    out += alphabet[(triple >> 18) & 63];
    out += alphabet[(triple >> 12) & 63];
    out += i + 1 < u8.length ? alphabet[(triple >> 6) & 63] : '=';
    out += i + 2 < u8.length ? alphabet[triple & 63] : '=';
  }
  return out;
}

function xmlEscape(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Split wall-of-text into readable paragraphs for Word (Hermes-safe, no lookbehinds). */
function normalizeDocxParagraphs(rawText) {
  let text = decodePlainText(rawText).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const newlineCount = (text.match(/\n/g) || []).length;
  if (newlineCount < 10) {
    text = text.replace(/(\bMADDE\s+\d+|\bTARAFLAR\b|\bEK-\d+|\bİMZA\b|\bIMZA\b)/gi, '\n\n$1');
    text = text.replace(/\n{3,}/g, '\n\n').replace(/^\n+/, '');
  }
  return text;
}

function isDocxSectionHeader(line) {
  const raw = String(line || '').trim();
  if (!raw || raw.length > 80) return false;
  return /^(MADDE\s+\d+|TARAFLAR|EK-\d+|İMZA|IMZA)\b/i.test(raw);
}

function paragraphsToDocxXml(text) {
  const normalized = normalizeDocxParagraphs(text);
  const body = normalized
    .split('\n')
    .map((line) => {
      const safe = xmlEscape(line);
      if (!safe) return '<w:p><w:pPr/><w:r><w:t></w:t></w:r></w:p>';
      const bold = isDocxSectionHeader(line) ? '<w:rPr><w:b/></w:rPr>' : '';
      return `<w:p><w:pPr/><w:r>${bold}<w:t xml:space="preserve">${safe}</w:t></w:r></w:p>`;
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${body}
    <w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr>
  </w:body>
</w:document>`;
}

/** Build a minimal OOXML .docx (STORE zip) from stitched plain text. */
export function buildDocxBytes(text) {
  const documentXml = paragraphsToDocxXml(text);
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
  const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;
  return zipStore([
    { name: '[Content_Types].xml', data: utf8Bytes(contentTypes) },
    { name: '_rels/.rels', data: utf8Bytes(rels) },
    { name: 'word/document.xml', data: utf8Bytes(documentXml) },
    { name: 'word/_rels/document.xml.rels', data: utf8Bytes(docRels) },
  ]);
}

/**
 * Visual redline HTML body from original source + stitch applied list.
 * del = struck original, ins = highlighted counter-offer.
 */
export function buildRedlineBodyHtml(source, applied = []) {
  const src = decodePlainText(source);
  const list = Array.isArray(applied) ? applied : [];
  const replaces = list
    .filter((item) => item && item.kind !== 'append' && String(item.from || '').trim())
    .map((item) => {
      const from = String(item.from || '');
      const start = src.indexOf(from);
      return {
        from,
        to: String(item.to || ''),
        title: String(item.title || ''),
        start,
        end: start >= 0 ? start + from.length : -1,
      };
    })
    .filter((item) => item.start >= 0)
    .sort((a, b) => a.start - b.start);

  let cursor = 0;
  let html = '';
  replaces.forEach((item) => {
    if (item.start < cursor) return;
    html += escapeHtml(src.slice(cursor, item.start)).replace(/\n/g, '<br/>');
    html += `<del style="color:#b91c1c;text-decoration:line-through;">${escapeHtml(item.from).replace(/\n/g, '<br/>')}</del>`;
    html += `<ins style="color:#047857;background:#ecfdf5;text-decoration:none;">${escapeHtml(item.to).replace(/\n/g, '<br/>')}</ins>`;
    cursor = item.end;
  });
  html += escapeHtml(src.slice(cursor)).replace(/\n/g, '<br/>');

  list
    .filter((item) => item && item.kind === 'append' && String(item.to || '').trim())
    .forEach((item) => {
      html += `<p><ins style="color:#047857;background:#ecfdf5;text-decoration:none;">${escapeHtml(item.to).replace(/\n/g, '<br/>')}</ins></p>`;
    });

  return html || escapeHtml(src).replace(/\n/g, '<br/>');
}

export function buildRedlinePdfHtml({
  source,
  applied = [],
  title = 'NexuLex',
  dateLabel = '',
  summaryLines = [],
  summaryTitle = '',
} = {}) {
  const summary = (Array.isArray(summaryLines) ? summaryLines : [])
    .map((line) => String(line || '').trim())
    .filter(Boolean)
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join('');
  const body = buildRedlineBodyHtml(source, applied);
  const summaryHeading = summaryTitle || title;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: A4; margin: 15mm; }
    html, body { width: 100%; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #111827;
      word-wrap: break-word;
      padding: 12mm 15mm;
      box-sizing: border-box;
    }
    .header { border-bottom: 2px solid #0A0F1D; padding-bottom: 12px; margin-bottom: 16px; }
    .brand { letter-spacing: 1px; text-transform: uppercase; font-size: 10pt; color: #7D5A1E; margin: 0 0 6px; }
    h1 { font-size: 16pt; margin: 0 0 6px; color: #0A0F1D; }
    .meta { color: #64748b; font-size: 10pt; margin: 0; }
    .summary { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; }
    .summary h2 { font-size: 11pt; margin: 0 0 8px; color: #0A0F1D; }
    .summary ul { margin: 0; padding-left: 18px; }
    .doc { white-space: normal; word-break: break-word; }
    del, .redline-del { color: #dc2626; text-decoration: line-through; background-color: #fef2f2; }
    ins, .redline-ins { color: #16a34a; text-decoration: underline; background-color: #f0fdf4; font-weight: 500; }
  </style>
</head>
<body>
  <div class="header">
    <p class="brand">NexuLex Shield</p>
    <h1>${escapeHtml(title)}</h1>
    ${dateLabel ? `<p class="meta">${escapeHtml(dateLabel)}</p>` : ''}
  </div>
  ${
    summary
      ? `<div class="summary"><h2>${escapeHtml(summaryHeading)}</h2><ul>${summary}</ul></div>`
      : ''
  }
  <div class="doc">${body}</div>
</body>
</html>`;
}

function stampName() {
  return new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
}

export async function shareShieldDocx(text, { filename } = {}) {
  const body = decodePlainText(text);
  if (!body.trim()) return { uri: '', filename: '' };
  const name = filename || `NexuLex-Kalkan-${stampName()}.docx`;
  const bytes = buildDocxBytes(body);
  const uri = await writeOwnedBase64(bytesToBase64(bytes), name);
  if (!uri) return { uri: '', filename: name };
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: DOCX_MIME,
      dialogTitle: name,
      UTI: 'org.openxmlformats.wordprocessingml.document',
    });
  }
  cleanStaleExportCache().catch(() => {});
  return { uri, filename: name, mimeType: DOCX_MIME };
}

export async function shareShieldRedlinePdf({
  source,
  applied = [],
  title = 'NexuLex',
  dateLabel = '',
  summaryLines = [],
  summaryTitle = '',
  filename,
} = {}) {
  const html = buildRedlinePdfHtml({
    source,
    applied,
    title,
    dateLabel,
    summaryLines,
    summaryTitle,
  });
  const printed = await Print.printToFileAsync({ html, base64: true });
  let payload = String(printed?.base64 || '').replace(/^data:[^;]+;base64,/, '');
  if (!payload && printed?.uri) {
    try {
      payload = await readOwnedFile(printed.uri, { asBase64: true });
    } catch {
      /* Print URI */
    }
  }
  const name = filename || `NexuLex-Kalkan-Redline-${stampName()}.pdf`;
  const uri = payload ? await writeOwnedBase64(payload, name) : '';
  if (!uri) return { uri: '', filename: name };
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: name,
      UTI: 'com.adobe.pdf',
    });
  }
  cleanStaleExportCache().catch(() => {});
  return { uri, filename: name, mimeType: 'application/pdf' };
}

export const SHIELD_DOCX_MIME = DOCX_MIME;
