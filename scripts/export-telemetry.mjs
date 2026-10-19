// WAVE ECON.4: exports the anonymous token telemetry (public.ai_cost_daily) as a CSV for `npm run cost:report`, without
// opening the SQL editor. The table holds only day / feature / plan / model / token sums (no user, device or text), and the
// file is written under scripts/.telemetry/ which git ignores.
//
//   $env:SUPABASE_URL = "https://<project-ref>.supabase.co"
//   $env:SUPABASE_SERVICE_ROLE_KEY = "<service_role key>"       (Supabase dashboard > Project Settings > API; this terminal only)
//   npm run cost:export                    (last 30 days)
//   npm run cost:export -- --days 7 --out C:\temp\week.csv
//   npm run cost:report -- scripts\.telemetry\ai-cost-<date>.csv
//
// The service key bypasses every security rule: it is read from the environment only, never printed, never written to a file,
// and you should close the terminal (or clear the variable) afterwards.
import fs from 'fs';
import path from 'path';
import { aggregateDaily, toCsv } from './lib/telemetry.mjs';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};
const days = Math.max(1, Math.min(366, Number(option('days', 30)) || 30));
const url = (process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim().replace(/\/+$/, '');
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) || !key) {
  console.log('Set SUPABASE_URL (https://<project-ref>.supabase.co) and SUPABASE_SERVICE_ROLE_KEY for this terminal first (see the header of this file).');
  process.exit(2);
}

// Legacy service_role keys are JWTs and go in both headers; the newer sb_secret_... keys are not JWTs and go in apikey only.
const looksLikePlaceholder = /^<.*>$/.test(key) || /service[_ ]?role[_ ]?key/i.test(key);
if (looksLikePlaceholder) {
  console.log('SUPABASE_SERVICE_ROLE_KEY still holds a placeholder: paste the real service_role key from Project Settings > API (never into a chat).');
  process.exit(2);
}
const authHeaders = /^eyJ[\w-]+\.[\w-]+\.[\w-]+$/.test(key) ? { apikey: key, Authorization: `Bearer ${key}` } : { apikey: key };

const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
const PAGE = 1000;
const daily = [];
for (let from = 0; ; from += PAGE) {
  const response = await fetch(`${url}/rest/v1/ai_cost_daily?select=day,feature,plan,model,calls,input_tokens,output_tokens,truncated,failed&day=gte.${since}&order=day.asc`, {
    headers: { ...authHeaders, Range: `${from}-${from + PAGE - 1}`, 'Range-Unit': 'items', Prefer: 'count=none' },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.log(`FAIL  ${response.status} reading public.ai_cost_daily: ${body.slice(0, 300)}`);
    console.log(response.status === 401 || response.status === 403 ? 'Check that the key is the service_role key (not the anon key) of this project.' : 'Check that migration 20261014120000_econ1_cost_guard.sql is applied.');
    process.exit(1);
  }
  const page = await response.json();
  daily.push(...page);
  if (page.length < PAGE) break;
}

const rows = aggregateDaily(daily);
const out = path.resolve(option('out', path.join('scripts', '.telemetry', `ai-cost-${new Date().toISOString().slice(0, 10)}.csv`)));
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, toCsv(rows));
const calls = rows.reduce((total, r) => total + r.calls, 0);
console.log(`OK  ${daily.length} daily rows since ${since} -> ${rows.length} feature/plan/model rows, ${calls} calls`);
console.log(`File: ${out}`);
console.log(`Next: npm run cost:report -- "${out}"      (add --matrix for the pricing-matrix costInputs block)`);
if (!calls) console.log('No calls recorded in this window yet: use the app with a signed-in account first.');
