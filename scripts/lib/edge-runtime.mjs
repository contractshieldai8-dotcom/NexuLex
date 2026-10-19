// WAVE ECON.4: boots the REAL analyze-contract Edge Function in-process (same technique as scripts/test-analyze-guard.mjs):
// the TypeScript is transpiled, Deno.serve is captured, and requests are handed straight to the registered handler.
// The caller supplies the network (global fetch), so the handler's Supabase and Anthropic calls go wherever the caller routes them.
import ts from 'typescript';

export function transpileEdge(source, env) {
  const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  let handler;
  const pending = [];
  globalThis.Deno = { serve: (h) => { handler = h; }, env: { get: (name) => env[name] } };
  globalThis.EdgeRuntime = { waitUntil: (promise) => pending.push(promise) };
  new Function(js)();
  if (typeof handler !== 'function') throw new Error('edge-runtime: the function did not register a Deno.serve handler');
  return {
    handle: (request) => handler(request),
    // Background work (token telemetry) is queued with EdgeRuntime.waitUntil: wait for it before reading results.
    settle: async () => { await Promise.all(pending.splice(0)); },
  };
}
