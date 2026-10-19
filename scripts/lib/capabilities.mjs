// WAVE ECON.4: judges a Models API record (GET /v1/models/{id}) against what ContractShield actually sends.
// Pure and offline-testable: scripts/test-benchmark.mjs feeds it canned records. Severity:
//   fail = a request we send would be rejected or the model is gone, warn = worth a look, info = for the record.
import { PRICE, readSource, EDGE_FILES } from './claude.mjs';

const supported = (node) => node?.supported === true;

// Largest values the app can send, read from the analyze-contract source (never hard-coded here).
export function appNeeds() {
  const source = readSource(EDGE_FILES.analyze);
  const caps = (source.match(/const MAX_TEXT_CHARS[^=]*= \{([^}]*)\}/) || [])[1] || '';
  const textChars = Math.max(0, ...[...caps.matchAll(/(\d[\d_]*)/g)].map((m) => Number(m[1].replace(/_/g, ''))));
  const maxTokens = Number((source.match(/const MAX_ALLOWED_TOKENS = ([\d_]+);/) || [])[1]?.replace(/_/g, '')) || 0;
  return { textChars, maxTokens };
}

// info: ModelInfo from the API. params: thinkingParams(model). roles: where the model is used, e.g. ['analyze-contract:default'].
export function evaluateCapabilities(model, info, params, roles, needs = appNeeds()) {
  const findings = [];
  const add = (level, text) => findings.push({ level, text });
  if (!info || typeof info !== 'object') {
    add('fail', 'no model record returned');
    return findings;
  }
  const caps = info.capabilities;
  const type = params?.thinking?.type;
  const effort = params?.output_config?.effort;
  const touchesFiles = roles.some((role) => role.startsWith('analyze-contract'));

  if (info.lifecycle === 'retired') add('fail', 'model is retired: requests naming it fail');
  else if (info.lifecycle === 'deprecated') add('warn', `model is deprecated${info.retires_at ? ` (retires ${info.retires_at.slice(0, 10)})` : ''}: plan a swap`);
  else if (info.retires_at) add('warn', `retirement is scheduled for ${info.retires_at.slice(0, 10)}`);

  if (!caps) {
    add('warn', 'the API returned no capabilities object for this model; thinking and file support could not be checked');
  } else {
    const types = caps.thinking?.types;
    if (type === 'disabled' && !supported(types?.disabled)) add('fail', 'profile sends thinking:{type:"disabled"} but the model answers 400 to it');
    if (type === 'adaptive' && !supported(types?.adaptive)) add('fail', 'profile sends thinking:{type:"adaptive"} but the model does not accept it');
    if (type === 'between_tools') {
      // The Models API does not list "between_tools"; the profile uses it because "disabled" is refused. Check that premise.
      if (supported(types?.disabled)) add('warn', 'profile uses "between_tools" although the model now accepts "disabled": re-read the thinking docs and simplify the profile');
      else add('info', '"between_tools" is not listed by the API (expected); "disabled" is refused, which is why the profile uses it');
    }
    if (effort) {
      if (!supported(caps.effort)) add('fail', `profile sends effort "${effort}" but the model has no effort control`);
      else if (!supported(caps.effort[effort])) add('fail', `profile sends effort "${effort}" which the model does not support`);
    }
    if (touchesFiles && !supported(caps.image_input)) add('fail', 'scanned pages (images) are sent to this model but it reports no image input');
    if (touchesFiles && !supported(caps.pdf_input)) add('fail', 'PDF documents are sent to this model but it reports no PDF input');
    if (!supported(caps.structured_outputs)) add('info', 'no structured-output support (the app parses JSON itself, so this is fine)');
  }

  if (typeof info.max_tokens === 'number' && needs.maxTokens && info.max_tokens < needs.maxTokens) {
    add('fail', `the app asks for up to ${needs.maxTokens} output tokens but the model caps at ${info.max_tokens}`);
  }
  // ~3 characters per token is a conservative rule of thumb for Turkish legal text; the cap is for the Professional plan.
  if (typeof info.max_input_tokens === 'number' && needs.textChars && info.max_input_tokens * 3 < needs.textChars) {
    add('warn', `a ${needs.textChars}-character contract (~${Math.round(needs.textChars / 3)} tokens) may exceed the ${info.max_input_tokens}-token context window`);
  }
  if (!PRICE[model]) add('warn', 'model is missing from the price table in scripts/lib/claude.mjs: cost reports show "n/a"');
  return findings;
}

export const worst = (findings) => (findings.some((f) => f.level === 'fail') ? 'fail' : findings.some((f) => f.level === 'warn') ? 'warn' : 'ok');
