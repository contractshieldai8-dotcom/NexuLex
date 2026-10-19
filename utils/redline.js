// Kelime düzeyi redline: silinenler kırmızı üstü çizili, eklenenler yeşil.

export function buildRedline(original, revised) {
  const left = String(original || '').split(/\s+/).filter(Boolean);
  const right = String(revised || '').split(/\s+/).filter(Boolean);
  const tokens = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      tokens.push({ type: 'same', text: left[i] });
      i += 1;
      j += 1;
      continue;
    }

    let nextJ = -1;
    for (let look = j + 1; look < Math.min(right.length, j + 24); look += 1) {
      if (right[look] === left[i]) {
        nextJ = look;
        break;
      }
    }
    let nextI = -1;
    for (let look = i + 1; look < Math.min(left.length, i + 24); look += 1) {
      if (left[look] === right[j]) {
        nextI = look;
        break;
      }
    }

    if (nextJ !== -1 && (nextI === -1 || nextJ - j <= nextI - i)) {
      tokens.push({ type: 'add', text: right[j] });
      j += 1;
    } else if (nextI !== -1) {
      tokens.push({ type: 'del', text: left[i] });
      i += 1;
    } else {
      tokens.push({ type: 'del', text: left[i] });
      tokens.push({ type: 'add', text: right[j] });
      i += 1;
      j += 1;
    }
  }

  while (i < left.length) {
    tokens.push({ type: 'del', text: left[i] });
    i += 1;
  }
  while (j < right.length) {
    tokens.push({ type: 'add', text: right[j] });
    j += 1;
  }
  return tokens;
}

/** Merge adjacent same-op tokens into one run to avoid RN Text node bloat. */
export function groupRedlineRuns(tokens) {
  const runs = [];
  (tokens || []).forEach((token) => {
    if (!token || !token.text) return;
    const last = runs[runs.length - 1];
    if (last && last.type === token.type) {
      last.text = `${last.text} ${token.text}`;
      return;
    }
    runs.push({ type: token.type, text: String(token.text) });
  });
  return runs;
}

const REDLINE_CHAR_CAP = 25000;
const REDLINE_TOKEN_CAP = 4000;
const REDLINE_RUN_DISPLAY_CAP = 1500;

/**
 * Build grouped redline runs with optional display cap for long contracts.
 * Does not change AI compare payloads — display-only.
 */
export function buildGroupedRedline(original, revised) {
  const orig = String(original || '');
  const rev = String(revised || '');
  const tokens = buildRedline(orig, rev);
  const runs = groupRedlineRuns(tokens);
  const heavy =
    orig.length + rev.length > REDLINE_CHAR_CAP || tokens.length > REDLINE_TOKEN_CAP;
  if (!heavy || runs.length <= REDLINE_RUN_DISPLAY_CAP) {
    return {
      runs,
      truncated: false,
      totalRuns: runs.length,
      tokenCount: tokens.length,
      heavy,
    };
  }
  const capped = runs.slice(0, REDLINE_RUN_DISPLAY_CAP);
  return {
    runs: capped,
    truncated: true,
    totalRuns: runs.length,
    tokenCount: tokens.length,
    heavy: true,
  };
}

export function redlineHtml(original, revised) {
  return buildRedline(original, revised)
    .map((token) => {
      const safe = String(token.text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      if (token.type === 'del') return `<span style="color:#B42318;text-decoration:line-through">${safe}</span>`;
      if (token.type === 'add') return `<span style="color:#047857;font-weight:700">${safe}</span>`;
      return safe;
    })
    .join(' ');
}
