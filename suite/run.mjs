// Suite test (development plan task 1B.7): runs the four engagement apps together on this machine, sharing one local
// identity database, and checks that they work as one suite. No secrets and no Cloudflare account: each app runs in
// `wrangler dev` with local storage, and the first app accepts the development sign-in header.
//
// Expects the app repos checked out side by side with this one (../risk_appetite, ../use-assessment, ...), each with
// its tests/e2e dependencies installed (they hold wrangler). Run: node suite/run.mjs
import { spawn } from 'node:child_process';
import { writeFileSync, rmSync, mkdtempSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { APPS, readConfig } from '../lib-config.mjs';

const HERE = dirname(fileURLToPath(import.meta.url)), ROOT = resolve(process.argv[2] || join(HERE, '../..')), ADMIN = 'damian.hickey@triodian.com', BASE_PORT = 8811;
let fails = 0; const ok = (label, cond, extra) => { if (!cond) fails++; console.log((cond ? 'PASS' : 'FAIL') + ' · ' + label + (extra ? ' → ' + extra : '')); };
const persist = mkdtempSync(join(tmpdir(), 'triodian-suite-'));
const procs = [], written = [];

/** A local config for one app: its own database, the shared identity database, bindings to the other apps by their
 *  local names, and no routes. Only the first app takes the development sign-in header. */
function suiteConfig(app, i) {
  i = APPS.indexOf(app);
  const dir = join(ROOT, app.dir), c = readConfig(join(dir, 'wrangler.jsonc'));
  delete c.env; delete c.routes;
  c.d1_databases = (c.d1_databases || []).filter(d => d.binding !== 'IDENTITY')
    .concat([{ binding: 'IDENTITY', database_name: 'triodian-identity', database_id: 'suite-local-identity' }]);
  c.vars = { ...(c.vars || {}), NOTIFY_SENDING: 'off', SUITE_DEMO: 'on', SUITE_SESSION_COOKIE: 'tri_suite', SUITE_COOKIE_DOMAIN: '' };
  for (const k of ['DEMO_LOGIN', 'DEMO_ADMINS']) c.vars[k] = '';
  if (i === 0) c.vars.LOCAL_DEV_NO_SIGNIN_EMAIL = ADMIN;
  const path = join(dir, 'wrangler.suite.local.jsonc');
  writeFileSync(path, JSON.stringify(c, null, 2)); written.push(path);
  return path;
}
const KEYS = ['ra', 'ua', 'cea', 'bd'];
/** One wrangler dev session: the router first (it takes the port), then the four apps, so the identity database is shared. */
function startAll() {
  const first = join(ROOT, APPS[0].dir), wrangler = join(first, 'tests/e2e/node_modules/wrangler/bin/wrangler.js');
  if (!existsSync(wrangler)) throw new Error(`${APPS[0].dir}: run npm ci in tests/e2e first (wrangler is not installed there).`);
  const cfgs = APPS.map(suiteConfig);
  const router = join(HERE, 'router.local.json');
  writeFileSync(router, JSON.stringify({ name: 'suite-router', main: 'router.js', compatibility_date: '2026-10-01',
    services: APPS.map((a, i) => ({ binding: KEYS[i].toUpperCase(), service: readConfig(join(ROOT, a.dir, 'wrangler.jsonc')).name })) }, null, 2)); written.push(router);
  const argv = [wrangler, 'dev', '-c', router, ...cfgs.flatMap(c => ['-c', c]), '--port', String(BASE_PORT), '--ip', '127.0.0.1', '--local-upstream', 'localhost',
    '--inspector-port', '9311', '--persist-to', persist, '--show-interactive-dev-session=false'];
  const p = spawn(process.execPath, argv, { cwd: HERE, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  let log = ''; p.stdout.on('data', d => { log += d; }); p.stderr.on('data', d => { log += d; });
  procs.push(p);
  APPS.forEach((a, i) => { a.base = `http://localhost:${BASE_PORT}/${KEYS[i]}`; a.log = () => log; });
}
async function up(app) {
  for (let t = 0; t < 120; t++) { try { const r = await fetch(app.base + '/login/'); if (r.status < 500) return true; } catch (e) {} await new Promise(r => setTimeout(r, 1000)); }
  console.log(app.log().slice(-3000)); return false;
}
const call = async (app, path, { cookie, dev, method = 'GET', body } = {}) => {
  const headers = { Accept: 'application/json' };
  if (cookie) headers.Cookie = cookie; if (dev) headers['X-Dev-User'] = dev; if (body) headers['Content-Type'] = 'application/json';
  const r = await fetch(app.base + path, { method, headers, body: body ? JSON.stringify(body) : undefined, redirect: 'manual' });
  let j = null; try { j = await r.clone().json(); } catch (e) {}
  return { status: r.status, body: j, cookie: r.headers.get('set-cookie') || '' };
};
function stop() { for (const p of procs) { try { process.kill(-p.pid, 'SIGTERM'); } catch (e) { try { p.kill('SIGTERM'); } catch (x) {} } } for (const f of written) rmSync(f, { force: true }); rmSync(persist, { recursive: true, force: true }); }
process.on('exit', stop); process.on('SIGINT', () => process.exit(130));

try {
  startAll();
  for (const a of APPS) ok(`${a.name} starts`, await up(a));
  const [ra, ua, cea, bd] = APPS;

  // one sign-in: sign in to Risk Appetite, then use the same cookie everywhere
  const signin = await call(ra, '/auth/email?next=/', { dev: ADMIN });
  const cookie = (signin.cookie.match(/tri_suite=[^;]+/) || [''])[0];
  ok('signing in to one app sets the suite cookie', signin.status === 303 && !!cookie, signin.cookie);
  for (const a of [ua, cea, bd]) {
    const me = await call(a, '/api/me', { cookie });
    ok(`${a.name} knows the person without a second sign-in`, me.status === 200 && me.body.user && me.body.user.email === ADMIN, JSON.stringify(me.body).slice(0, 120));
  }
  ok('without the cookie, another app does not', (await call(bd, '/api/me')).status === 401);

  // people added once: add someone in Risk Appetite, then add the same email in Board Direction
  const add1 = await call(ra, '/api/admin/users', { cookie, method: 'POST', body: { email: 'chris@acme.test', name: 'Chris Lane', organisation: 'Acme', roles: ['cro'] } });
  ok('Risk Appetite adds a person', add1.status === 201, JSON.stringify(add1.body).slice(0, 160));
  const add2 = await call(bd, '/api/admin/users', { cookie, method: 'POST', body: { email: 'chris@acme.test', name: 'Chris Lane', organisation: '', roles: ['director'] } });
  ok('Board Direction adds the same person: one record, same id, organisation kept', add2.status === 201 && add2.body.user.id === add1.body.user.id && add2.body.user.organisation === 'Acme', JSON.stringify(add2.body).slice(0, 160));
  const list = await call(bd, '/api/admin/users', { cookie });
  const chris = list.body.users.find(u => u.email === 'chris@acme.test');
  ok('roles stay per app', chris.roles.join() === 'director');
  ok('Admin shows the person’s roles in the other apps', ((list.body.otherApps || {})[chris.id] || []).some(o => o.app === 'risk-appetite' && o.roles.join() === 'cro'), JSON.stringify(list.body.otherApps));

  // the calibration link through the service binding (task 1B.4), where the Risk Appetite app offers it
  const cal = await call(ua, '/api/calibration-from-appetite', { cookie });
  ok('Use Assessment reaches Risk Appetite through the binding', cal.status === 404 && /No calibration set/.test((cal.body || {}).error || ''), `${cal.status} ${JSON.stringify(cal.body).slice(0, 160)}`);

  // signing out of one app signs out of all
  await call(cea, '/auth/logout', { cookie });
  // (Risk Appetite takes the development header, so it is not used for this check)
  ok('signing out of one app signs out of the others', (await call(ua, '/api/me', { cookie })).status === 401 && (await call(bd, '/api/me', { cookie })).status === 401);
} catch (e) { fails++; console.log('FAIL · ' + e.message); }
console.log(fails ? `\n${fails} failed` : '\nAll passed'); stop(); process.exit(fails ? 1 : 0);
