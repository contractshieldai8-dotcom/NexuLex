// WAVE H: pure helpers for the first-minute experience (no React Native imports, so scripts can test them).

/** Collapses whitespace so a sample still matches after the keyboard or paste handling touched it. */
export function normalizeSample(text) {
  return String(text == null ? '' : text).replace(/\s+/g, ' ').trim();
}

/** True when `text` is exactly the sample that was loaded (and has not been edited). */
export function isSampleText(text, sample) {
  const a = normalizeSample(text);
  const b = normalizeSample(sample);
  return a.length > 0 && a === b;
}

/**
 * The sample chip is only for people who have not seen a result yet: no text, no file, no scan, nothing
 * running and no finished result on screen.
 */
export function shouldOfferSample({ sampleDone, hasText, hasFile, imageCount, loading, hasResult }) {
  if (sampleDone || loading || hasResult || hasFile) return false;
  if (hasText) return false;
  return !(Number(imageCount) > 0);
}

/** The first sample is free (no analysis credit); later ones, or after a real analysis, are not. */
export function sampleIsFree({ fromSample, sampleDone }) {
  return Boolean(fromSample) && !sampleDone;
}
