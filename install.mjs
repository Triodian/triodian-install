#!/usr/bin/env node
// Guided installer for the Triodian AI governance apps (development plan task 1B.6).
// Asks the jurisdiction and regulated sector, which apps (general or regulated), and the web domain; then, in the Cloudflare account the API token belongs to:
// fetches the apps, creates their databases and the shared identity database, writes each app's client configuration,
// sets up email sign-in with Cloudflare Access, deploys in order, and names the first administrator.
// The apps share one sign-in and talk to each other through service bindings, so no secret is typed.
//
//   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... node install.mjs
//   node install.mjs --dry-run            prints every step and writes the configurations, changes nothing in Cloudflare
//   node install.mjs --answers file.json  takes the answers from a file instead of asking
//
// The API token needs: Account · D1 · Edit, Account · Workers Scripts · Edit, Zone · Workers Routes · Edit (on the
// domain's zone), Account · Access: Apps and Policies · Edit. Node 20 or later, and git.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { APPS, appsFor, readConfig, JURISDICTIONS, SECTORS } from './lib-config.mjs';

const args = process.argv.slice(2), DRY = args.includes('--dry-run');
const answersFile = args.includes('--answers') ? args[args.indexOf('--answers') + 1] : null;
const say = s => console.log(s), step = s => console.log('\n· ' + s);
const SUB = { 'risk-appetite': 'risk-appetite', 'use-assessment': 'use-assessment', confidentiality: 'confidentiality', 'board-direction': 'board-direction' };

async function ask() {
  if (answersFile) return JSON.parse(readFileSync(answersFile, 'utf8'));
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const q = async (text, def, check) => { for (;;) { const a = (await rl.question(`${text}${def ? ` [${def}]` : ''}: `)).trim() || def || ''; const e = check ? check(a) : ''; if (!e) return a; say('  ' + e); } };
  say('Triodian AI governance apps · installer\n');
  const a = {};
  a.code = await q('Short code for this client (letters and digits, used in Worker and database names)', '', v => /^[a-z][a-z0-9]{1,19}$/.test(v) ? '' : 'Use 2 to 20 lowercase letters and digits, starting with a letter.');
  a.jurisdiction = (await q(`Jurisdiction the client works in (${JURISDICTIONS.map(j => `${j[0]} ${j[1]}`).join(', ')})`, 'AU', v => JURISDICTIONS.some(j => j[0] === v.toUpperCase()) ? '' : `Type ${JURISDICTIONS.map(j => j[0]).join(' or ')}.`)).toUpperCase();
  const secs = SECTORS.filter(d => d.jurisdiction === a.jurisdiction);
  say('  Regulated sectors:\n' + ['   0  None (choose in each app later)', ...secs.map((d, i) => `  ${String(i + 1).padStart(2)}  ${d.name}`)].join('\n'));
  const n = await q('Regulated sector (number)', '0', v => /^\d+$/.test(v) && +v <= secs.length ? '' : `Type a number from 0 to ${secs.length}.`);
  a.sector = +n ? secs[+n - 1].id : '';
  const regulated = +n && secs[+n - 1].financiallyRegulated;
  a.profile = await q('General company or regulated entity? (general / regulated)', regulated ? 'regulated' : 'general', v => ['general', 'regulated'].includes(v) ? '' : 'Type general or regulated.');
  a.domain = await q('Domain the apps sit under (each app gets a subdomain, for example board-direction.<domain>)', '', v => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(v) ? '' : 'Type a domain such as acme.com.au, on a zone in this Cloudflare account.');
  a.teamDomain = await q('Cloudflare Zero Trust team domain (Zero Trust → Settings → Custom pages)', '', v => /\.cloudflareaccess\.com$/.test(v) ? '' : 'It ends in .cloudflareaccess.com.');
  a.firstAdmins = (await q('First administrator email(s), comma-separated', '', v => v.split(',').every(e => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e.trim())) ? '' : 'Type one or more email addresses.')).split(',').map(e => e.trim().toLowerCase());
  a.dir = await q('Folder to fetch the apps into', `./triodian-${a.code}`);
  rl.close();
  return a;
}
function run(cmd, argv, opts = {}) {
  say(`  $ ${cmd} ${argv.map(x => /\s/.test(x) ? JSON.stringify(x) : x).join(' ')}`);
  if (DRY) return '';
  return execFileSync(cmd, argv, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'], ...opts });
}
const wrangler = (cwd, argv, input) => run('npx', ['--yes', 'wrangler@4', ...argv], { cwd, input });
async function cf(path, body) {
  say(`  → Cloudflare API ${body ? 'POST' : 'GET'} ${path}`);
  if (DRY) return { result: { aud: 'DRY-RUN-AUD' } };
  const r = await fetch('https://api.cloudflare.com/client/v4' + path, { method: body ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + process.env.CLOUDFLARE_API_TOKEN, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json();
  if (!j.success) throw new Error(`Cloudflare API ${path}: ${JSON.stringify(j.errors)}`);
  return j;
}
function d1Create(cwd, name) {
  const out = wrangler(cwd, ['d1', 'create', name]);
  if (DRY) return 'DRY-RUN-' + name;
  const m = out.match(/"database_id":\s*"([0-9a-f-]{36})"/) || out.match(/database_id\s*=\s*"([0-9a-f-]{36})"/);
  if (!m) throw new Error(`Could not read the id of the new database ${name}. Output:\n${out}`);
  return m[1];
}

/** The client configuration for one app, written beside its wrangler.jsonc as wrangler.<code>.json. Exported for tests. */
export function clientConfig(app, a, ids) {
  const dir = join(a.dir, app.dir), base = readConfig(join(dir, 'wrangler.jsonc')), env = (base.env || {}).client || {};
  const host = `${SUB[app.id]}.${a.domain}`, c = { ...base };
  delete c.env;
  c.name = `${app.worker}-${a.code}`;
  c.routes = [{ pattern: host, custom_domain: true }];
  c.d1_databases = [{ binding: 'DB', database_name: `${app.worker}-${a.code}`, database_id: ids[app.id] },
    { binding: 'IDENTITY', database_name: `triodian-identity-${a.code}`, database_id: ids.identity }];
  c.services = (env.services || base.services || []).map(s => ({ ...s, service: s.service.replace(/-(client|test)$/, '') + `-${a.code}` }));
  c.vars = { ...(env.vars || {}), SUITE_DEMO: 'off', DEMO_LOGIN: '', DEMO_ADMINS: '', SITE_URL: `https://${host}`, SUITE_COOKIE_DOMAIN: a.domain, SUITE_SESSION_COOKIE: 'tri_suite',
    ACCESS_TEAM_DOMAIN: a.teamDomain, FIRST_ADMINS: a.firstAdmins.join(','), NOTIFY_SENDING: 'off', NOTIFY_FROM: '',
    // Where each app starts; people change both in the app at any time.
    DEFAULT_JURISDICTION: a.jurisdiction || 'AU', DEFAULT_SECTOR: a.sector || '' };
  if (env.triggers || base.triggers) c.triggers = env.triggers || base.triggers;
  return { config: c, host, file: join(dir, `wrangler.${a.code}.json`) };
}

async function main() {
  const a = await ask();
  a.dir = resolve(a.dir);
  const apps = appsFor(a.profile);
  if (!DRY && (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID)) throw new Error('Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID first (see the top of this file for the permissions).');
  if (a.sector && !SECTORS.some(d => d.id === a.sector && d.jurisdiction === (a.jurisdiction || 'AU'))) throw new Error(`${a.sector} is not a regulated sector of ${a.jurisdiction || 'AU'}.`);
  const sec = SECTORS.find(d => d.id === a.sector);
  say(`\nInstalling ${apps.map(x => x.name).join(', ')} for ${a.code}, under ${a.domain}, starting in ${(JURISDICTIONS.find(j => j[0] === (a.jurisdiction || 'AU')) || [])[1]}${sec ? `, ${sec.name}` : ''}.${DRY ? ' (dry run: nothing is changed in Cloudflare)' : ''}`);

  step('Fetching the apps');
  mkdirSync(a.dir, { recursive: true });
  for (const app of apps) {
    const dir = join(a.dir, app.dir);
    if (existsSync(join(dir, '.git'))) run('git', ['-C', dir, 'pull', '--ff-only']);
    else run('git', ['clone', '--depth', '1', `https://github.com/Triodian/${app.repo}.git`, dir]);
  }
  if (DRY) for (const app of apps) if (!existsSync(join(a.dir, app.dir, 'wrangler.jsonc'))) throw new Error(`Dry run: ${join(a.dir, app.dir)} has no wrangler.jsonc. Point the folder at existing checkouts to preview the configurations.`);

  step('Creating the databases');
  const ids = { identity: d1Create(a.dir, `triodian-identity-${a.code}`) };
  for (const app of apps) ids[app.id] = d1Create(a.dir, `${app.worker}-${a.code}`);

  step('Writing each app’s configuration');
  const made = apps.map(app => clientConfig(app, a, ids));
  for (const m of made) { writeFileSync(m.file, JSON.stringify(m.config, null, 2) + '\n'); say(`  wrote ${m.file}`); }

  step('Setting up email sign-in (Cloudflare Access, one application per app, for /auth/email only)');
  for (const [i, app] of apps.entries()) {
    const m = made[i];
    const r = await cf(`/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID || 'ACCOUNT'}/access/apps`, {
      name: `${app.name} (${a.code}) sign-in`, domain: `${m.host}/auth/email`, type: 'self_hosted', session_duration: '24h',
      policies: [{ name: 'Anyone with an email code', decision: 'allow', include: [{ everyone: {} }] }],
    });
    wrangler(join(a.dir, app.dir), ['secret', 'put', 'ACCESS_AUD', '-c', m.file], r.result.aud);
  }

  step('Deploying, Risk Appetite first');
  for (const [i, app] of apps.entries()) wrangler(join(a.dir, app.dir), ['deploy', '-c', made[i].file]);

  say(`\nDone. ${a.firstAdmins.join(', ')} can now sign in to each app and add people in Admin:`);
  for (const m of made) say(`  https://${m.host}`);
  say('People are added once for the suite; give each their roles app by app. Email notifications are off until NOTIFY_SENDING and NOTIFY_FROM are set.');
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch(e => { console.error('\n' + e.message); process.exit(1); });
