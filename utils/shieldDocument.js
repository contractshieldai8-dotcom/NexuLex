// Yerel kalkan yaması: clauses.counterOffer ve missingProtections.insertClause
// sözleşme metnine LLM olmadan işlenir. Tam belge Claude’a yeniden yazdırılmaz.
// Replace alt-madde (4.3) veya üst madde (6.) GÖVDESİNİ değiştirir; parent 4.1–4.4 ezilmez.

import { isPlaceholderText, normalizeAnalysis, pickCounterOffer } from './analysis';
import { playbookItemById } from '../constants/playbooks';

const MIN_FROM = 12;
const SUB_RE = /^\s*\d{1,2}\.\d{1,2}(?:\s*[.)]\s+|\s+)/;
const TOP_RE = /^\s*\d{1,2}\s*[.)]\s/;
const TOP_NAMED_RE =
  /^\s*(?:MADDE|ARTICLE|ART(?:[IİÍ]CULO|IGO|IKEL|\.?)|CLAUSE|CL[AÁ]USULA)\s+(\d{1,2})(?:\s*[.)]\s+|\s*[—–-]\s+|\s+|$)/i;
const MAX_ARTICLE_BODY = 2200;
const MAX_PARAGRAPH_BODY = 900;

const isSubHeading = (line) => SUB_RE.test(String(line || '').replace(/\r$/, ''));
const isTopHeading = (line) => {
  const value = String(line || '').replace(/\r$/, '');
  if (isSubHeading(value)) return false;
  return TOP_RE.test(value) || TOP_NAMED_RE.test(value);
};
const isSignOff = (line) =>
  /^\s*(İMZA|IMZA|SIGNATURES?|SIGNED\s+BY|IN\s+WITNESS\s+WHEREOF)\s*$/i.test(
    String(line || '').replace(/\r$/, '')
  );
const isBoundaryLine = (line) => isSubHeading(line) || isTopHeading(line) || isSignOff(line);

const foldChar = (ch) => {
  if (ch === '\u2018' || ch === '\u2019' || ch === '\u02BC') return "'";
  if (ch === '\u201C' || ch === '\u201D') return '"';
  if (ch === '\u00A0' || ch === '\u202F') return ' ';
  if (ch === 'İ') return 'i';
  const lower = ch.toLowerCase();
  return lower.length === 1 ? lower : ch;
};

export function normalizeForMatch(text) {
  let raw = String(text || '');
  try {
    raw = raw.normalize('NFC');
  } catch {
    /* NFC yoksa ham metin */
  }
  let out = '';
  for (let i = 0; i < raw.length; i += 1) out += foldChar(raw[i]);
  return out;
}

const nfcStable = (text) => {
  const raw = String(text || '');
  try {
    const nfc = raw.normalize('NFC');
    if (nfc.length === raw.length) return nfc;
  } catch {
    /* NFC yoksa ham metin */
  }
  return raw;
};

const collapseIndexMap = (text) => {
  const raw = nfcStable(text);
  const orig = [];
  let norm = '';
  let inSpace = false;
  for (let i = 0; i < raw.length; i += 1) {
    const ch = foldChar(raw[i]);
    if (/\s/.test(ch)) {
      if (!inSpace && norm.length) {
        orig.push(i);
        norm += ' ';
        inSpace = true;
      }
    } else {
      orig.push(i);
      norm += ch;
      inSpace = false;
    }
  }
  if (norm.endsWith(' ')) {
    orig.pop();
    norm = norm.slice(0, -1);
  }
  return { norm, orig };
};

const significantWords = (norm) =>
  String(norm || '')
    .split(/\s+/)
    .filter((word) => {
      const core = word.replace(/[^0-9A-Za-zÀ-ÖØ-öø-ÿĞğİıŞşÇçÖöÜüÂâÎîÛû']/g, '');
      return core.length >= 4;
    });

const spanFromCollapsed = (haystack, map, at, length) => {
  const start = map.orig[at];
  const last = map.orig[at + length - 1];
  if (start == null || last == null) return null;
  return { start, end: last + 1, matched: haystack.slice(start, last + 1) };
};

const locateNgram = (haystack, needle) => {
  const hay = collapseIndexMap(haystack);
  const ndl = collapseIndexMap(needle);
  const words = significantWords(ndl.norm);
  if (words.length < 3) return null;
  for (const n of [5, 4, 3]) {
    if (words.length < n) continue;
    for (let i = 0; i <= words.length - n; i += 1) {
      const gram = words.slice(i, i + n).join(' ');
      if (gram.length < MIN_FROM) continue;
      let count = 0;
      let firstAt = -1;
      let pos = 0;
      while (pos <= hay.norm.length) {
        const at = hay.norm.indexOf(gram, pos);
        if (at < 0) break;
        count += 1;
        if (firstAt < 0) firstAt = at;
        if (count > 1) break;
        pos = at + 1;
      }
      if (count === 1) return spanFromCollapsed(haystack, hay, firstAt, gram.length);
    }
  }
  return null;
};

export function locateInSource(source, needle) {
  const haystack = String(source || '');
  const from = String(needle || '');
  if (!haystack || from.trim().length < MIN_FROM) return null;

  const exact = haystack.indexOf(from);
  if (exact >= 0) {
    return { start: exact, end: exact + from.length, matched: from, via: 'exact' };
  }

  const src = collapseIndexMap(haystack);
  const ndl = collapseIndexMap(from);
  if (ndl.norm.length >= MIN_FROM) {
    const at = src.norm.indexOf(ndl.norm);
    if (at >= 0) {
      const hit = spanFromCollapsed(haystack, src, at, ndl.norm.length);
      if (hit) return { ...hit, via: 'collapsed' };
    }
  }

  const ngram = locateNgram(haystack, from);
  return ngram ? { ...ngram, via: 'ngram' } : null;
}

export function firstLongSentence(text) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (raw.length < 80) return '';
  const parts = [];
  let buf = '';
  for (let i = 0; i < raw.length; i += 1) {
    buf += raw[i];
    if (/[.!?…]/.test(raw[i])) {
      parts.push(buf.trim());
      buf = '';
    }
  }
  if (buf.trim()) parts.push(buf.trim());
  let acc = '';
  for (const part of parts) {
    acc = acc ? `${acc} ${part}` : part;
    if (acc.length >= 80) return acc;
  }
  return raw.slice(0, Math.min(raw.length, 180));
}

export function resolveSourceText(analysis, fallback = '') {
  return String(
    analysis?.contract_text || analysis?.contractText || fallback || ''
  ).trim();
}

const usableText = (value, min = 1) => {
  const text = String(value || '').trim();
  if (text.length < min || isPlaceholderText(text)) return '';
  return text;
};

const lineBounds = (text, idx) => {
  let a = idx;
  while (a > 0 && text[a - 1] !== '\n') a -= 1;
  let b = idx;
  while (b < text.length && text[b] !== '\n') b += 1;
  return { a, b };
};

export function articleKey(title, from) {
  const blob = `${title || ''}\n${from || ''}`;
  const dotted = String(blob).match(/(\d{1,2}\.\d{1,2})(?!\d)/);
  const maddeSub = String(blob).match(/Madde\s*(\d{1,2}\.\d{1,2})\b/i);
  if (maddeSub) return maddeSub[1];
  if (dotted) return dotted[1];
  const match =
    blob.match(/\(Madde\s*(\d{1,2})\)/i) ||
    blob.match(/Madde\s*(\d{1,2})\b/i) ||
    blob.match(/^\s*(\d{1,2})\s*[.)]\s/m);
  if (match) return match[1];
  const sliced = collapseIndexMap(String(from || '')).norm.slice(0, 80);
  return sliced || `t:${String(title || '').replace(/\s+/g, ' ').slice(0, 40)}`;
}

const headingNumber = (line) => {
  const value = String(line || '').replace(/\r$/, '');
  const sub = value.match(/^\s*(\d{1,2}\.\d{1,2})(?:\s*[.)]|\s|$)/);
  if (sub) return sub[1];
  const named = value.match(TOP_NAMED_RE);
  if (named) return named[1];
  if (isTopHeading(value)) {
    const top = value.match(/^\s*(\d{1,2})\s*[.)]\s/);
    return top ? top[1] : '';
  }
  return '';
};

const looksTruncatedTo = (text) => {
  const body = String(text || '').replace(/\s+$/g, '');
  if (!body) return true;
  if (/eklenmelidir|should be added|must be added/i.test(body) && body.length < 220) return true;
  const lastLine = (body.split('\n').filter((line) => line.trim()).pop() || '').trim();
  if (/^(#{1,6}|Madde\s+\d+|\d+(?:\.\d+)*)[.)]?\s*$/i.test(lastLine)) return true;
  const tail = body.slice(-40);
  if (tail.length >= 12 && !/\s/.test(tail)) return true;
  const lastWord = (tail.match(/[^\s.,;:!?…"'»)\]]+$/) || [''])[0];
  const endsPunct = /[.!?…"')\]}:;]$/.test(body);
  if (
    !endsPunct &&
    lastWord.length >= 2 &&
    lastWord.length <= 8 &&
    /^[A-Za-zÀ-ÖØ-öø-ÿÇĞİÖŞÜçğıöşü]+$/.test(lastWord)
  ) {
    return true;
  }
  return false;
};

const spanCrossesForeignTop = (source, span) => {
  const text = String(source || '');
  const start = span.keepHeading ? span.headingStart : span.replaceStart;
  const end = span.replaceEnd;
  if (start == null || end == null || end <= start) return false;
  const ownTop = String(headingNumber(span.headingLine) || '').split('.')[0];
  let pos = start;
  while (pos < end) {
    const { a, b } = lineBounds(text, pos);
    const line = text.slice(a, b).replace(/\r$/, '');
    if (a >= start && isTopHeading(line)) {
      const top = String(headingNumber(line) || '').split('.')[0];
      if (top && ownTop && top !== ownTop) return true;
    }
    if (b >= text.length) break;
    pos = b + 1;
  }
  return false;
};

const lastTopHeadingLine = (source) => {
  const text = String(source || '');
  let last = '';
  let pos = 0;
  while (pos < text.length) {
    const { a, b } = lineBounds(text, pos);
    const line = text.slice(a, b).replace(/\r$/, '');
    if (isTopHeading(line)) last = line;
    if (b >= text.length) break;
    pos = b + 1;
  }
  return last;
};

const spanEatsLaterTops = (source, span) => {
  const text = String(source || '');
  const end = span.replaceEnd;
  if (end == null || end < text.length - 80) return false;
  const lastLine = lastTopHeadingLine(text);
  if (!lastLine) return false;
  const lastNum = String(headingNumber(lastLine) || '').split('.')[0];
  const own = String(headingNumber(span.headingLine) || '').split('.')[0];
  if (!own || !lastNum || own === lastNum) return false;
  const lastLoc = locateArticleHeading(text, lastNum);
  const lastStart = lastLoc?.start;
  if (lastStart == null) return end >= text.length - 2;
  if (lastStart >= end - 2) return false;
  return lastStart < end;
};

const escapeRe = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function expandToArticle(source, start, end) {
  const text = String(source || '');
  const fragment = {
    replaceStart: start,
    replaceEnd: end,
    headingStart: start,
    headingEnd: start,
    headingLine: '',
    keepHeading: false,
    expanded: false,
  };
  if (!text || start == null || end == null || start < 0 || end < start) return fragment;

  const findHeadingBack = (predicate, { stopOnTop = false } = {}) => {
    let headingStart = -1;
    let headingEnd = -1;
    let cursor = start;
    let walked = 0;
    while (cursor >= 0 && walked <= MAX_ARTICLE_BODY) {
      const { a, b } = lineBounds(text, cursor);
      const line = text.slice(a, b).replace(/\r$/, '');
      if (predicate(line)) {
        headingStart = a;
        headingEnd = b;
        break;
      }
      if (stopOnTop && isTopHeading(line)) break;
      if (a === 0) break;
      walked += Math.max(1, cursor - (a - 1));
      cursor = a - 1;
    }
    return { headingStart, headingEnd };
  };

  const headingPrefixEnd = (lineStart, lineEnd, mode) => {
    const line = text.slice(lineStart, lineEnd).replace(/\r$/, '');
    if (mode === 'sub') {
      const match = line.match(SUB_RE);
      const prefix = match ? match[0].replace(/\s+$/, '') : line;
      return { headingEnd: lineStart + prefix.length, headingLine: prefix };
    }
    return { headingEnd: lineEnd, headingLine: line };
  };

  const expandFromHeading = (headingStart, lineEnd, stopAt, mode) => {
    const { headingEnd, headingLine } = headingPrefixEnd(headingStart, lineEnd, mode);
    const bodyStart =
      headingEnd < text.length && text[headingEnd] === '\n' ? headingEnd + 1 : headingEnd;
    let nextHeading = -1;
    let pos = bodyStart;
    while (pos < text.length) {
      const { a, b } = lineBounds(text, pos);
      const line = text.slice(a, b).replace(/\r$/, '');
      if (a >= bodyStart && stopAt(line)) {
        nextHeading = a;
        break;
      }
      if (b >= text.length) break;
      pos = b + 1;
    }
    const bodyEnd = nextHeading >= 0 ? nextHeading : text.length;
    if (bodyEnd - bodyStart > MAX_ARTICLE_BODY) return fragment;
    return {
      replaceStart: bodyStart,
      replaceEnd: bodyEnd,
      headingStart,
      headingEnd,
      headingLine,
      keepHeading: true,
      expanded: true,
    };
  };

  const sub = findHeadingBack(isSubHeading, { stopOnTop: true });
  if (sub.headingStart >= 0) {
    return expandFromHeading(
      sub.headingStart,
      sub.headingEnd,
      (line) => isBoundaryLine(line),
      'sub'
    );
  }

  const top = findHeadingBack(isTopHeading);
  if (top.headingStart >= 0) {
    return expandFromHeading(
      top.headingStart,
      top.headingEnd,
      (line) => isBoundaryLine(line),
      'top'
    );
  }

  let paraStart = start;
  while (paraStart > 0) {
    if (text[paraStart - 1] === '\n' && (paraStart < 2 || text[paraStart - 2] === '\n')) break;
    paraStart -= 1;
  }
  let paraEnd = end;
  while (paraEnd < text.length) {
    if (text[paraEnd] === '\n' && (paraEnd + 1 >= text.length || text[paraEnd + 1] === '\n')) break;
    paraEnd += 1;
  }
  const span = paraEnd - paraStart;
  if (span < 1 || span > MAX_PARAGRAPH_BODY) return fragment;
  return {
    replaceStart: paraStart,
    replaceEnd: paraEnd,
    headingStart: paraStart,
    headingEnd: paraStart,
    headingLine: '',
    keepHeading: false,
    expanded: true,
  };
}

const expandToParagraph = (source, start, end) => {
  const text = String(source || '');
  const fragment = {
    replaceStart: start,
    replaceEnd: end,
    headingStart: start,
    headingEnd: start,
    headingLine: '',
    keepHeading: false,
    expanded: false,
  };
  if (!text || start == null || end == null || start < 0 || end < start) return fragment;
  const hit = lineBounds(text, start);
  let paraStart = hit.a;
  while (paraStart > 0) {
    if (text[paraStart - 1] === '\n' && (paraStart < 2 || text[paraStart - 2] === '\n')) break;
    const prev = lineBounds(text, paraStart - 1);
    const prevLine = text.slice(prev.a, prev.b).replace(/\r$/, '');
    if (isBoundaryLine(prevLine)) break;
    paraStart = prev.a;
  }
  let paraEnd = Math.max(end, hit.b);
  while (paraEnd < text.length) {
    if (text[paraEnd] === '\n' && (paraEnd + 1 >= text.length || text[paraEnd + 1] === '\n')) break;
    const nextIdx = text[paraEnd] === '\n' ? paraEnd + 1 : paraEnd;
    if (nextIdx >= text.length) break;
    const next = lineBounds(text, nextIdx);
    const nextLine = text.slice(next.a, next.b).replace(/\r$/, '');
    if (isBoundaryLine(nextLine)) break;
    paraEnd = next.b;
  }
  const span = paraEnd - paraStart;
  if (span < 1 || span > MAX_PARAGRAPH_BODY) return fragment;
  return {
    replaceStart: paraStart,
    replaceEnd: paraEnd,
    headingStart: paraStart,
    headingEnd: paraStart,
    headingLine: '',
    keepHeading: false,
    expanded: true,
  };
};

export function locateArticleHeading(source, num) {
  const key = String(num || '');
  const haystack = String(source || '');
  let re = null;
  if (/^\d{1,2}\.\d{1,2}$/.test(key)) {
    re = new RegExp(`(^|\\n)(\\s*${escapeRe(key)}(?:\\s*[.)]\\s+|\\s+)[^\\n]*)`);
  } else if (/^\d{1,2}$/.test(key)) {
    re = new RegExp(
      `(^|\\n)(\\s*(?:(?:MADDE|ARTICLE|ART(?:[IİÍ]CULO|IGO|IKEL|\\.?)|CLAUSE|CL[AÁ]USULA)\\s+)?${escapeRe(key)}(?:\\s*[.)]\\s+|\\s*[—–-]\\s+|\\s+)(?!\\d)[^\\n]*)`,
      'i'
    );
  }
  if (!re) return null;
  const match = haystack.match(re);
  if (!match || match.index == null) return null;
  const start = match.index + match[1].length;
  const headingLine = match[2].replace(/\r$/, '');
  return { start, end: start + headingLine.length, matched: headingLine };
}

const locateFragment = (source, from) => {
  const direct = locateInSource(source, from);
  if (direct) return direct;
  const sentence = firstLongSentence(from);
  if (sentence && sentence !== from) {
    const hit = locateInSource(source, sentence);
    if (hit) return hit;
  }
  return null;
};

const counterIncludesHeading = (counter, headingLine) => {
  const to = String(counter || '').trim();
  const heading = String(headingLine || '').trim();
  if (!to || !heading) return false;
  if (to.startsWith(heading)) return true;
  const num = headingNumber(heading);
  if (!num) return false;
  const escaped = escapeRe(num);
  if (new RegExp(`^\\s*${escaped}\\s*[.)]\\s`).test(to)) return true;
  if (new RegExp(`^\\s*Madde\\s*${escaped}\\b`, 'i').test(to)) return true;
  return false;
};

const resolveReplaceSpan = (source, patch) => {
  if (patch.kind === 'append') return { kind: 'append' };

  const fragment = locateFragment(source, patch.from);
  if (fragment) {
    const { a, b } = lineBounds(source, fragment.start);
    const hitLine = source.slice(a, b).replace(/\r$/, '');
    if (!isTopHeading(hitLine) && !isSubHeading(hitLine)) {
      const para = expandToParagraph(source, fragment.start, fragment.end);
      return { ...para, matched: fragment.matched, via: fragment.via || 'paragraph' };
    }
    const expanded = expandToArticle(source, fragment.start, fragment.end);
    return { ...expanded, matched: fragment.matched, via: fragment.via || 'fragment' };
  }

  const num = patch.articleKey || articleKey(patch.title, patch.from);
  const heading = locateArticleHeading(source, num);
  if (!heading) return null;
  const probe = Math.min(heading.start + 1, source.length);
  const expanded = expandToArticle(source, probe, Math.max(heading.end, probe + 1));
  if (!expanded.keepHeading && heading.matched) {
    return {
      ...expandToArticle(source, heading.start, heading.end),
      matched: heading.matched,
      via: 'heading',
    };
  }
  return { ...expanded, matched: heading.matched, via: 'heading' };
};

const patchRank = (patch) => {
  const sourceScore = String(patch.id || '').startsWith('clause:') ? 20 : 10;
  const riskScore = patch.risk === 'RED' ? 2 : 1;
  return sourceScore + riskScore;
};

const articleKeyFromSource = (source, title, from) => {
  const keyed = articleKey(title, from);
  if (/^\d{1,2}\.\d{1,2}$/.test(keyed)) return keyed;
  const fragment = locateFragment(source, from);
  if (fragment) {
    const expanded = expandToArticle(source, fragment.start, fragment.end);
    const num = headingNumber(expanded.headingLine);
    if (num) return num;
  }
  const heading = locateArticleHeading(source, keyed);
  if (heading) {
    const num = headingNumber(heading.matched);
    if (num) return num;
  }
  return keyed;
};

const citedArticleNumbers = (blob) => {
  const text = String(blob || '');
  const found = [];
  for (const match of text.matchAll(/Madde\s*(\d{1,2}(?:\.\d{1,2})?)\b/gi)) {
    found.push(match[1]);
  }
  for (const match of text.matchAll(/(?:^|[^\d])(\d{1,2}\.\d{1,2})(?!\d)/g)) {
    found.push(match[1]);
  }
  return found;
};

const articlesCompatible = (cited, key) => {
  if (!cited || !key) return true;
  if (cited === key) return true;
  if (key.startsWith(`${cited}.`)) return true;
  if (cited.startsWith(`${key}.`)) return true;
  return false;
};

const patchCitesOtherArticle = (source, patch) => {
  const key = String(patch.articleKey || '');
  if (!/^\d{1,2}(?:\.\d{1,2})?$/.test(key)) return false;
  if (!locateArticleHeading(source, key)) return false;
  const blob = `${patch.title || ''}\n${patch.from || ''}`;
  const other = citedArticleNumbers(blob).find(
    (cited) => !articlesCompatible(cited, key) && locateArticleHeading(source, cited)
  );
  if (other) return true;
  if (/Kabul\s+ve\s+Teslim/i.test(blob)) {
    const heading = locateArticleHeading(source, key);
    if (heading && !/Kabul\s+ve\s+Teslim/i.test(heading.matched || '') && /Kabul\s+ve\s+Teslim/i.test(source)) {
      return true;
    }
  }
  return false;
};

export function listShieldPatches(analysis, options = {}) {
  const full = normalizeAnalysis(analysis) || analysis || {};
  const source = resolveSourceText(full);
  const collected = [];
  const preferredTier = String(options.preferredTier || 'balanced').toLowerCase();
  const tierById = options.tierById && typeof options.tierById === 'object' ? options.tierById : {};

  (full.clauses || []).forEach((clause, index) => {
    const from = usableText(clause?.originalText, MIN_FROM);
    const tier = tierById[`clause:${index}`] || preferredTier;
    const to = usableText(pickCounterOffer(clause, tier));
    if (!from || !to) return;
    const risk = String(clause.riskLevel || 'YELLOW').toUpperCase();
    const title = usableText(clause.clauseTitle) || from.slice(0, 80);
    collected.push({
      id: `clause:${index}`,
      kind: 'replace',
      from,
      to,
      title,
      articleKey: articleKeyFromSource(source, title, from),
      preview: to.replace(/\s+/g, ' ').slice(0, 90),
      defaultSelected: risk === 'RED',
      risk,
    });
  });

  (full.redFlags || []).forEach((flag, index) => {
    const from = usableText(
      flag?.originalText || flag?.original_text || flag?.original,
      MIN_FROM
    );
    const tier = tierById[`flag:${index}`] || preferredTier;
    const to = usableText(pickCounterOffer(flag, tier));
    if (!from || !to) return;
    const title = usableText(flag?.title || flag?.clauseTitle) || from.slice(0, 80);
    collected.push({
      id: `flag:${index}`,
      kind: 'replace',
      from,
      to,
      title,
      articleKey: articleKeyFromSource(source, title, from),
      preview: to.replace(/\s+/g, ' ').slice(0, 90),
      defaultSelected: true,
      risk: 'RED',
    });
  });

  const seen = new Map();
  collected.forEach((patch) => {
    const key = patch.articleKey || patch.id;
    const prev = seen.get(key);
    if (!prev || patchRank(patch) > patchRank(prev)) seen.set(key, patch);
  });

  const patches = [...seen.values()];

  (full.missingProtections || []).forEach((item, index) => {
    const to = usableText(item?.insertClause);
    const status = String(item?.status || '').toUpperCase();
    if (!to || (status !== 'ABSENT' && status !== 'WEAK')) return;
    patches.push({
      id: `missing:${index}`,
      kind: 'append',
      from: '',
      to,
      title: item.playbookId || `missing:${index}`,
      titleKey: playbookItemById(item.playbookId)?.titleKey || '',
      articleKey: `append:${item.playbookId || index}`,
      preview: to.replace(/\s+/g, ' ').slice(0, 90),
      defaultSelected: status === 'ABSENT',
      risk: status === 'ABSENT' ? 'RED' : 'YELLOW',
      playbookId: item.playbookId,
    });
  });

  const byIdentity = new Map();
  patches.forEach((patch) => {
    const titleNorm = String(patch.titleKey || patch.title || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
    const fromNorm = String(patch.from || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .slice(0, 140);
    const isGizlilik =
      /gizlilik|confidential|nda\b/.test(titleNorm) || /gizlilik|confidential/.test(fromNorm);
    // Identical gizlilik/confidential replacements collapse to one patch.
    const titleKey =
      isGizlilik && fromNorm
        ? `gizlilik:${fromNorm}`
        : titleNorm || patch.id || patch.articleKey || fromNorm;
    const prev = byIdentity.get(titleKey);
    if (!prev || patchRank(patch) > patchRank(prev)) byIdentity.set(titleKey, patch);
  });
  return [...byIdentity.values()];
}

const overlaps = (a, b) => a.start < b.end && b.start < a.end;

/** Prevent glued words at stitch boundaries (bulunmakKilit / geçemez.Müşteri). */
const stitchBoundaryGlue = (left, right) => {
  const to = String(left || '');
  const after = String(right || '');
  if (!to || !after) return '';

  const nextLine = after.replace(/^\n+/, '').split('\n')[0] || '';
  if (isTopHeading(nextLine)) {
    if (after.startsWith('\n\n')) return '';
    if (after.startsWith('\n')) return '\n';
    return '\n\n';
  }

  // Already separated by whitespace / newline
  if (/[\s]$/.test(to) || /^[\s]/.test(after)) return '';

  // Punctuation + letter at boundary → space (readable Turkish paragraphs)
  if (/[.!?:]$/.test(to) && /^[A-Za-zÇçĞğİıÖöŞşÜü]/.test(after)) {
    return ' ';
  }

  // Letter/digit/. touching a letter — never allow bare concat
  if (/[A-Za-zÇçĞğİıÖöŞşÜü0-9.]$/.test(to) && /^[A-Za-zÇçĞğİıÖöŞşÜü]/.test(after)) {
    if (/\.$/.test(to)) return ' ';
    return '. ';
  }

  return '';
};

const applyBodyReplace = (text, item) => {
  const to = String(item.to || '').trim();
  const after = text.slice(item.end);
  if (item.keepHeading && item.headingLine && !counterIncludesHeading(to, item.headingLine)) {
    const before = text.slice(0, item.headingEnd);
    const mid = `\n${to}`;
    return `${before}${mid}${stitchBoundaryGlue(mid, after)}${after}`;
  }
  const from =
    item.keepHeading && item.headingLine && counterIncludesHeading(to, item.headingLine)
      ? item.headingStart
      : item.start;
  const before = text.slice(0, from);
  return `${before}${stitchBoundaryGlue(before, to)}${to}${stitchBoundaryGlue(to, after)}${after}`;
};

export function stitchShieldDocument({
  analysis,
  sourceText = '',
  selectedIds = null,
  banner = '',
  preferredTier = 'balanced',
  tierById = null,
} = {}) {
  const source = resolveSourceText(analysis, sourceText);
  const patches = listShieldPatches(analysis, { preferredTier, tierById }).filter((item) =>
    selectedIds ? selectedIds.has(item.id) : item.defaultSelected
  );

  if (!source) {
    return {
      text: '',
      applied: [],
      skipped: patches.map((item) => ({ id: item.id, reason: 'no_source' })),
      banner: String(banner || '').trim(),
    };
  }

  const replacements = [];
  const appends = [];
  const skipped = [];
  const usedRanges = [];

  patches.forEach((patch) => {
    if (patch.kind === 'append') {
      appends.push(patch);
      return;
    }
    if (patchCitesOtherArticle(source, patch)) {
      skipped.push({ id: patch.id, reason: 'article_mismatch', from: patch.from, to: patch.to });
      return;
    }
    if (looksTruncatedTo(patch.to)) {
      skipped.push({ id: patch.id, reason: 'truncated_to', from: patch.from, to: patch.to });
      return;
    }
    const span = resolveReplaceSpan(source, patch);
    if (!span || span.replaceStart == null) {
      skipped.push({ id: patch.id, reason: 'not_found', from: patch.from, to: patch.to });
      return;
    }
    if (spanCrossesForeignTop(source, span) || spanEatsLaterTops(source, span)) {
      skipped.push({ id: patch.id, reason: 'span_overflow', from: patch.from, to: patch.to });
      return;
    }
    const range = {
      start: span.keepHeading ? span.headingStart : span.replaceStart,
      end: span.replaceEnd,
    };
    if (usedRanges.some((item) => overlaps(item, range))) {
      skipped.push({ id: patch.id, reason: 'duplicate', from: patch.from, to: patch.to });
      return;
    }
    usedRanges.push(range);
    replacements.push({
      id: patch.id,
      kind: 'replace',
      from: span.matched || patch.from,
      to: patch.to,
      start: span.replaceStart,
      end: span.replaceEnd,
      headingStart: span.headingStart,
      headingEnd: span.headingEnd,
      headingLine: span.headingLine,
      keepHeading: span.keepHeading,
    });
  });

  const ordered = [...replacements].sort((a, b) => b.start - a.start);
  let text = source;
  const applied = [];
  ordered.forEach((item) => {
    text = applyBodyReplace(text, item);
    applied.push({ id: item.id, from: item.from, to: item.to, kind: 'replace' });
  });
  applied.reverse();

  appends.forEach((patch) => {
    text = `${text.trimEnd()}\n\n${patch.to}`;
    applied.push({ id: patch.id, from: '', to: patch.to, kind: 'append' });
  });

  const head = String(banner || '').trim();
  return {
    text,
    applied,
    skipped,
    banner: head,
  };
}

export function paragraphSlice(source, needle, max = 4000) {
  const haystack = String(source || '');
  const loc = locateFragment(haystack, needle);
  if (!loc) return '';
  const expanded = expandToArticle(haystack, loc.start, loc.end);
  if (expanded.expanded) {
    const slice = haystack.slice(
      expanded.keepHeading ? expanded.headingStart : expanded.replaceStart,
      expanded.replaceEnd
    );
    return slice.slice(0, max);
  }
  let start = loc.start;
  let end = loc.end;
  while (start > 0 && haystack[start - 1] !== '\n') start -= 1;
  while (end < haystack.length && haystack[end] !== '\n') end += 1;
  start = Math.max(0, start - 200);
  end = Math.min(haystack.length, end + 200);
  return haystack.slice(start, end).slice(0, max);
}

export function fuzzyParagraph(source, needle, max = 4000) {
  const direct = paragraphSlice(source, needle);
  if (direct) return direct;
  const words = String(needle || '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((word) => word.length >= 5);
  if (words.length < 2) return '';
  const haystack = String(source || '');
  const probe = words.slice(0, 4).join(' ');
  const foldedHay = collapseIndexMap(haystack);
  const foldedProbe = collapseIndexMap(probe).norm;
  const at = foldedHay.norm.indexOf(foldedProbe);
  if (at < 0) return '';
  const start = foldedHay.orig[at];
  if (start == null) return '';
  return haystack.slice(Math.max(0, start - 200), Math.min(haystack.length, start + max));
}

export function replaceSlice(source, slice, revised) {
  const haystack = String(source || '');
  const from = String(slice || '');
  const to = String(revised || '');
  if (!from || !to) return haystack;
  const at = haystack.indexOf(from);
  if (at < 0) return haystack;
  const before = haystack.slice(0, at);
  const after = haystack.slice(at + from.length);
  return `${before}${stitchBoundaryGlue(before, to)}${to}${stitchBoundaryGlue(to, after)}${after}`;
}

const NDA_FIXTURE = `1. TARAFLAR
Alice ve Bob.

2. KONU
Gizlilik.

3. YUKUMLULUK
Sir saklanir.

4. ISTISNA
Yok.

5. IADE
Iade edilir.

6. CEZAİ ŞART VE TAZMİNAT
Ifsa Eden Taraf, dogacak dogrudan ve dolayli tum zararlarini tazmin etmeyi kabul eder. [Ayrica, ihlal basina [•] TL cezai sart uygulanir.]

7. SURE VE FESIH
Bu sozlesme [3 / 5] yil sureyle yururlukte kalir ve suresiz olarak devam edebilir.

8. HUKUK
Turk hukuku.

IMZA
Ali
`;

const APEX_FIXTURE = `Uygulamanizin (ContractShield / NexuLex AI) analiz motorunu iyilestirmek icin onsoz.

1. TARAFLAR
Apex Cloud ve Musteri.

2. KONU
Kurumsal yazilim.

3.1. Lisans
Lisans verilir.

3.3. Destek
Destek var.

4. FINANSAL HUKUMLER
4.1 Bedel 5.000.000 TL'dir.
4.2 %50 pesin odenir.
4.3. Saglayici, piyasa kosullarina gore fiyati onceden bildirimde bulunmaksizin artirabilir.
4.4. Gecikmede aylik %5 faiz ve ihtarsiz aski uygulanir.

5. KABUL
5.1. Hizmet yalniz saglayicinin kabulu ile baslar, musterinin veto hakki bulunmamaktadir.
5.2 Teslimden sonra 72 saat.

6. VERI
6.2. Saglayici musteri verisiyle yapay zeka modellerini egitmek uzere suresiz kullanir.

7. SORUMLULUK
7.1. Musteri her turlu zarari sinirsiz olarak tazmin eder.

8. FESIH
8.1. Saglayici sebepsiz fesihten son 3 ayda odenen bedelin %50'si tutarinda cezai sart ister.

9. YETKI
9.1. Uyusmazliklarda Saglayici\u2019nin merkezinin bulundugu yer mahkemeleri yetkilidir.

IMZA
Ali
`;

export function assertShieldFixtures() {
  const fail = [];
  const ndaDoc = stitchShieldDocument({
    analysis: {
      contract_text: NDA_FIXTURE,
      clauses: [
        {
          clauseTitle: 'Cezai Sart (Madde 6)',
          originalText: 'dogacak dogrudan ve dolayli tum zararlarini tazmin etmeyi kabul eder',
          counterOffer: 'Cezai sart azami [X] TL ile sinirlidir. Yalnizca dogrudan zararlar tazmin edilir.',
          riskLevel: 'RED',
        },
        {
          clauseTitle: 'Sure ve Fesih (Madde 7)',
          originalText: 'Bu sozlesme [3 / 5] yil sureyle yururlukte kalir',
          counterOffer: 'Gizlilik yukumlulugu en fazla 3 yil surer.',
          riskLevel: 'RED',
        },
      ],
      redFlags: [],
      missing_protections: [],
    },
  });
  if (ndaDoc.text.includes('[Ayrica, ihlal basina')) fail.push('nda6 leftover');
  if (/suresiz olarak devam/i.test(ndaDoc.text)) fail.push('nda7 leftover');
  if (!/en fazla 3 yil/i.test(ndaDoc.text)) fail.push('nda7 missing');
  if (!ndaDoc.text.includes('1. TARAFLAR') || !ndaDoc.text.includes('IMZA')) fail.push('nda structure');
  if (!ndaDoc.text.includes('6. CEZAİ ŞART')) fail.push('nda6 heading');

  if (articleKey('4.3 Fiyat', 'x') !== '4.3') fail.push('articleKey 4.3');
  if (articleKey('Madde 6', 'x') !== '6') fail.push('articleKey 6');
  const sixteen = locateArticleHeading('16. HUKUK\n6. CEZA\n', '6');
  if (sixteen?.matched?.includes('16')) fail.push('16 vs 6');

  const curlyHit = locateInSource(APEX_FIXTURE, "Saglayici'nin merkezinin bulundugu");
  if (!curlyHit) fail.push('curly quote locate');

  const apexAnalysis = {
    contract_text: APEX_FIXTURE,
    clauses: [
      {
        clauseTitle: '4.3 Fiyat artisi',
        originalText: 'Saglayici fiyati tek tarafli ve onceden haber vermeden artirabilir',
        counterOffer: 'Fiyat ancak 30 gun onceden yazili bildirimle ve yilda bir kez artirilir.',
        riskLevel: 'RED',
      },
      {
        clauseTitle: '4.4 Gecikme cezasi',
        originalText: 'aylik %5 faiz ve ihtarsiz aski',
        counterOffer: 'Gecikme faizi yasal faizle sinirli olup aski yalniz ihtar sonrasi yapilir.',
        riskLevel: 'RED',
      },
      {
        clauseTitle: '5.1 Kabul',
        originalText: 'yalniz saglayicinin kabulu ile baslar, musterinin veto hakki bulunmamaktadir',
        counterOffer: 'Kabul musteri onayi olmadan tek tarafli olamaz.',
        riskLevel: 'RED',
      },
      {
        clauseTitle: '6.2 AI veri',
        originalText: 'musteri verisiyle yapay zeka modellerini egitmek',
        counterOffer: 'Musteri verisi AI egitiminde kullanilmaz.',
        riskLevel: 'RED',
      },
      {
        clauseTitle: '7.1 Tazminat',
        originalText: 'her turlu zarari sinirsiz olarak tazmin eder',
        counterOffer: 'Tazminat dogrudan zarar ve sozlesme bedeli ile sinirlidir.',
        riskLevel: 'RED',
      },
      {
        clauseTitle: '8.1 Fesih cezasi',
        originalText: 'son 3 ayda odenen bedelin %50\'si tutarinda cezai sart',
        counterOffer: 'Sebepsiz fesihte cezai sart uygulanmaz; bildirim suresi 30 gundur.',
        riskLevel: 'RED',
      },
      {
        clauseTitle: '9.1 Yetki',
        originalText: "Saglayici'nin merkezinin bulundugu yer mahkemeleri",
        counterOffer: 'Yetkili merci musteri merkezinin bulundugu yer mahkemeleridir.',
        riskLevel: 'RED',
      },
    ],
    redFlags: [
      {
        title: '4.3 zam',
        originalText: 'onceden bildirimde bulunmaksizin artirabilir',
        counterOffer: 'Fiyat ancak 30 gun onceden yazili bildirimle artar.',
      },
    ],
    missing_protections: [],
  };

  const patches = listShieldPatches(apexAnalysis);
  const keys = patches.map((item) => item.articleKey);
  if (!keys.includes('4.3') || !keys.includes('4.4')) fail.push(`keys ${keys.join(',')}`);
  if (keys.filter((item) => item === '4.3').length !== 1) fail.push('4.3 merged with flag');
  if (keys.includes('4')) fail.push('parent 4 key');

  const apexDoc = stitchShieldDocument({ analysis: apexAnalysis, sourceText: APEX_FIXTURE });
  const text = apexDoc.text;
  if (!text.includes('5.000.000') || !text.includes('%50 pesin') || !text.includes('72 saat')) {
    fail.push('kept 4.1/4.2/5.2');
  }
  if (!text.includes('1. TARAFLAR') || !text.includes('3.1. Lisans') || !text.includes('IMZA')) {
    fail.push('kept structure');
  }
  if (/onceden bildirimde bulunmaksizin/i.test(text)) fail.push('4.3 old body');
  if (/aylik %5/i.test(text)) fail.push('4.4 old body');
  if (/veto hakki bulunmamaktadir/i.test(text)) fail.push('5.1 old body');
  if (/yapay zeka modellerini egitmek/i.test(text)) fail.push('6.2 old body');
  if (/sinirsiz olarak tazmin/i.test(text)) fail.push('7.1 old body');
  if (/son 3 ayda odenen/i.test(text)) fail.push('8.1 old body');
  if (/merkezinin bulundugu yer mahkemeleri/i.test(text) && !/musteri merkezinin/i.test(text)) {
    fail.push('9.1 old body');
  }
  if (!text.includes('4.3.') || !/30 gun onceden/i.test(text)) fail.push('4.3 not patched');

  const hit43 = locateInSource(APEX_FIXTURE, '4.3. Saglayici, piyasa kosullarina gore fiyati');
  const expanded = hit43 ? expandToArticle(APEX_FIXTURE, hit43.start, hit43.end) : null;
  if (!expanded?.headingLine?.includes('4.3')) fail.push('expand 4.3 heading');
  const body = expanded
    ? APEX_FIXTURE.slice(expanded.replaceStart, expanded.replaceEnd)
    : '';
  if (/4\.1/.test(body) || /4\.4/.test(body)) fail.push('parent 4 eaten');

  const nxlSource = `YAZILIM HIZMET SOZLESMESI

3. HIZMET KAPSAMI
3.3 Entegrasyonlar
Entegrasyonlar Google Drive ve benzeri hizmetlerle saglanir. API anahtari musteriye aittir.

7. Kabul ve Teslim
Teslimat saglayicinin kabulu ile baslar, musterinin veto hakki yoktur.

9. SORUMLULUK
Sinirsiz tazminat.

12. FESIH
Cezai sart.

14. YETKI
Saglayici mahkemeleri.
`;
  const nxlDoc = stitchShieldDocument({
    analysis: {
      contract_text: nxlSource,
      clauses: [
        {
          clauseTitle: '3.3 Entegrasyonlar',
          originalText: 'Kabul ve Teslim. Teslimat saglayicinin kabulu ile baslar',
          counterOffer: 'Teslimat, yalnizca Musterinin yazili ve acik onayi ile tamamlanir. 20 is gunu.',
          riskLevel: 'RED',
        },
        {
          clauseTitle: 'Madde 7 Kabul ve Teslim',
          originalText: 'Teslimat saglayicinin kabulu ile baslar, musterinin veto hakki yoktur',
          counterOffer: 'Teslimat, yalnizca Musterinin yazili ve acik onayi ile tamamlanir. 20 is gunu.',
          riskLevel: 'RED',
        },
        {
          clauseTitle: 'Madde 9',
          originalText: 'Sinirsiz tazminat',
          counterOffer: 'Tazminat sozlesme bedeli ile sinirlidir.',
          riskLevel: 'RED',
        },
      ],
      redFlags: [],
      missing_protections: [],
    },
  });
  const after33 = nxlDoc.text.match(/3\.3\s+Entegrasyonlar\s*\n([\s\S]*?)(?=\n7\.|\n9\.)/);
  if (!after33 || !/Google Drive/i.test(after33[1]) || /20 is gunu/i.test(after33[1])) {
    fail.push('nxl 3.3 overwritten');
  }
  if (!/^Entegrasyonlar/m.test(after33?.[1] || '')) fail.push('nxl 3.3 body start');
  const after7 = nxlDoc.text.match(/7\.\s+Kabul ve Teslim\s*\n([\s\S]*?)(?=\n9\.)/);
  if (!after7 || !/Musterinin yazili ve acik onayi/i.test(after7[1])) fail.push('nxl 7 not patched');
  if (!(nxlDoc.skipped || []).some((item) => item.reason === 'article_mismatch')) {
    fail.push('nxl mismatch skip');
  }

  const maddeSource = `MADDE 3
Kapsam
3.3 Google Drive entegrasyonu aciktir.

MADDE 4
body-four

MADDE 5
body-five

MADDE 6 Fikri
Haklar saklidir.

MADDE 7
7.1 test
7.2 kabul
`;
  const maddeDoc = stitchShieldDocument({
    analysis: {
      contract_text: maddeSource,
      clauses: [
        {
          clauseTitle: 'Fikri mulkiyet',
          originalText: 'Haklar saklidir.',
          counterOffer: 'IP sessizl',
          riskLevel: 'RED',
        },
        {
          clauseTitle: 'Fikri ek',
          originalText: 'Haklar saklidir.',
          counterOffer: 'Fikri haklar eklenmelidir',
          riskLevel: 'RED',
        },
      ],
      redFlags: [],
      missing_protections: [],
    },
  });
  if (!/MADDE 4[\s\S]*body-four/.test(maddeDoc.text)) fail.push('madde 4 eaten');
  if (!/MADDE 5[\s\S]*body-five/.test(maddeDoc.text)) fail.push('madde 5 eaten');
  if (!/3\.3 Google Drive/.test(maddeDoc.text)) fail.push('madde 3.3 eaten');
  if (!/7\.1 test/.test(maddeDoc.text)) fail.push('madde 7.1 eaten');
  if (/IP sessizl/.test(maddeDoc.text)) fail.push('truncated_to inserted');
  if (/eklenmelidir/.test(maddeDoc.text)) fail.push('advice-only inserted');
  if (!(maddeDoc.skipped || []).some((item) => item.reason === 'truncated_to')) {
    fail.push('madde truncated_to skip');
  }
  const madde4 = locateArticleHeading(maddeSource, '4');
  if (!madde4 || !/MADDE 4/i.test(madde4.matched || '')) fail.push('locate MADDE 4');
  if (!locateArticleHeading('ARTICLE 14. Governing law\n', '14')) fail.push('locate ARTICLE 14');
  if (!locateArticleHeading('Art. 14\nBody\n', '14')) fail.push('locate Art. 14');
  if (!locateArticleHeading('CLÁUSULA 8 — Objeto\n', '8')) fail.push('locate CLÁUSULA 8');

  const glueSource = `MADDE 14
14.4 eski govde yalnizca saglayici tarafindan isletilir.
MADDE 15
body-fifteen
`;
  const glueDoc = stitchShieldDocument({
    analysis: {
      contract_text: glueSource,
      clauses: [
        {
          clauseTitle: '14.4 isletim',
          originalText: 'eski govde yalnizca saglayici tarafindan isletilir',
          counterOffer: '14.4 Yeni govde yalniz yazili bildirimle isletilir.',
          riskLevel: 'RED',
        },
      ],
      redFlags: [],
      missing_protections: [],
    },
  });
  if (!/isletilir\.\r?\n\r?\nMADDE 15/.test(glueDoc.text)) fail.push('madde glue newline');
  if (!/body-fifteen/.test(glueDoc.text)) fail.push('madde 15 eaten');

  // WAVE BJ — boundary glue must never produce bulunmakKilit / geçemez.Müşteri
  {
    const a = stitchBoundaryGlue('...bulunmak.', 'Kilit personel...');
    const b = stitchBoundaryGlue('bulunmak', 'Kilit');
    const c = stitchBoundaryGlue('geçemez.', 'Müşteri');
    if (!a || `...bulunmak.${a}Kilit`.includes('bulunmak.Kilit')) fail.push('glue bulunmak.Kilit');
    if (!b || `bulunmak${b}Kilit`.includes('bulunmakKilit')) fail.push('glue bulunmakKilit');
    if (!c || `geçemez.${c}Müşteri`.includes('geçemez.Müşteri')) fail.push('glue geçemez.Müşteri');
  }


  const fortySource = Array.from({ length: 40 }, (_, i) => {
    const n = i + 1;
    return `MADDE ${n}\nbody-${n} lorem contract clause text here for article ${n}.\n`;
  }).join('\n');
  const fortyDoc = stitchShieldDocument({
    analysis: {
      contract_text: fortySource,
      clauses: [
        {
          clauseTitle: 'MADDE 9',
          originalText: 'body-9 lorem contract clause text here for article 9.',
          counterOffer: '9. Yeni govde yalniz yazili bildirimle isletilir ve sinirlidir.',
          riskLevel: 'RED',
        },
      ],
      redFlags: [],
      missing_protections: [],
    },
  });
  if (!/MADDE 36/.test(fortyDoc.text)) fail.push('madde 36 eaten');
  if (!/MADDE 40/.test(fortyDoc.text)) fail.push('madde 40 eaten');

  const ucretSource = `4. KAPSAM
Hizmet kapsamı.

5. ÜCRET VE ÖDEME
Toplam bedel 1.200.000 TL + KDV'dir. %30 imza aninda odenir.

Gecikmede aylik %5 faiz ve ihtarsiz aski uygulanir.

6. SURE
Sure belirtilir.
`;
  const ucretDoc = stitchShieldDocument({
    analysis: {
      contract_text: ucretSource,
      clauses: [
        {
          clauseTitle: '5. ÜCRET gecikme',
          originalText: 'Gecikmede aylik %5 faiz ve ihtarsiz aski uygulanir',
          counterOffer: 'Gecikme faizi yasal faizle sinirlidir ve aski yalniz ihtar sonrasi yapilir.',
          riskLevel: 'RED',
        },
      ],
      redFlags: [],
      missing_protections: [],
    },
  });
  if (!/1\.200\.000/.test(ucretDoc.text)) fail.push('ucret 1.200.000 eaten');
  if (!/%30/.test(ucretDoc.text)) fail.push('ucret %30 eaten');
  if (/ihtarsiz aski uygulanir/.test(ucretDoc.text)) fail.push('ucret delay leftover');
  if (!/yasal faizle sinirlidir/.test(ucretDoc.text)) fail.push('ucret delay not patched');

  const paraphrase = locateInSource(
    APEX_FIXTURE,
    'Saglayici fiyati tek tarafli ve onceden haber vermeden artirabilir'
  );
  const unmatched = (apexDoc.skipped || []).filter((item) => item.reason === 'not_found');
  if (unmatched.length) fail.push(`not_found ${unmatched.map((item) => item.id).join(',')}`);

  if (fail.length) {
    const err = new Error(`shield fixtures: ${fail.join('; ')}`);
    err.detail = { fail, keys, via43: hit43?.via || 'heading', paraphrase: paraphrase?.via || 'none', text };
    throw err;
  }
  return {
    keys,
    via43: hit43?.via || 'heading',
    paraphraseVia: paraphrase?.via || 'heading-fallback',
    articleKey43: articleKey('4.3 Fiyat artisi', apexAnalysis.clauses[0].originalText),
    parentEaten: false,
  };
}

