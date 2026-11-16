#!/usr/bin/env node
// Release checks (penetration test 16 Nov 2026, PT-02; retest R-01; development plan P.2, P.8 and P.11): the apps a
// client install gets, checked out by tools/fetch-releases.mjs at the commits pinned in releases.json, must
//  1. refuse a first save that carries another person's approval (PT-02: the pins of 15 Nov accepted one);
//  2. never redirect off-origin after sign-in (PT-03: the pins of #15 still sent /\attacker.example to attacker.example);
//  3. remove the matter when counsel directed destruction (PT-05: the pins of #15 answered destroyed:true and kept it).
// Each attack runs against whatever is checked out, with its legitimate control, so a pin can never again name a
// release that carries a finding the mains have fixed (the retest's R-01: "a corrected main alone does not correct
// existing installations").
//   node tools/release-checks.mjs <folder holding the app checkouts>
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const root = resolve(process.argv[2] || '.');
let fails = 0; const ok = (label, cond, extra) => { if (!cond) fails++; console.log((cond ? 'PASS' : 'FAIL') + ' · ' + label + (extra ? ' → ' + extra : '')); };
let n = 0; // a fresh module instance each time: the stores keep one `ready` flag per Worker
const mod = async (dir, file) => { const p = resolve(root, dir, file); if (!existsSync(p)) throw new Error(`${p} is not there: run tools/fetch-releases.mjs first`); return import(pathToFileURL(p).href + '?i=' + (++n)); };
const load = async (dir) => (await mod(dir, 'lib/core/rbac.js')).checkSave;
const APPS = ['risk_appetite', 'use-assessment', 'confidentiality-exposure-assessment', 'board-direction'];
const run = (checkSave, label, users, who, doc, want) => { const r = checkSave(null, doc, users.find(u => u.id === who), users); ok(label, !r.error === want, r.error); };

// Risk Appetite: a first save by an administrator with no engagement role, carrying the CRO's agreement or the board's approval
{
  const checkSave = await load('risk_appetite');
  const users = [{ id: 'ad', name: 'Admin', roles: [], isAdmin: true, active: true }, { id: 'cr', name: 'Chris', roles: ['cro'], active: true }];
  const fresh = () => ({ schema: 'triodian.raf.v1', engagement: { id: 'e1', insurer: 'Acme', overallPosition: '' }, people: [], current: {}, decisions: { d1: { cells: {} }, d2: { cells: {} }, d3: { cells: {}, referenceShown: [] } },
    questionsForCounsel: [], challenge: [], calibration: { status: 'default', version: 0, agreedBy: '', agreedById: '', agreedOn: '', approvedOn: '', minuteRef: '', approvedBy: '', issued: [] }, measureOwners: {}, history: [] });
  run(checkSave, 'Risk Appetite: the blank first save by an administrator is accepted (control)', users, 'ad', fresh(), true);
  const agreed = fresh(); agreed.calibration = { ...agreed.calibration, status: 'working', version: 1, agreedBy: 'Chris', agreedById: 'cr', agreedOn: '2026-11-01' };
  run(checkSave, 'Risk Appetite: a first save carrying the CRO’s agreement, by someone who is not the CRO, is refused', users, 'ad', agreed, false);
  const approved = fresh(); approved.calibration = { ...approved.calibration, status: 'approved', version: 1, agreedById: 'cr', agreedBy: 'Chris', agreedOn: '2026-11-01', approvedOn: '2026-11-02', minuteRef: 'M1', approvedBy: 'Board' };
  run(checkSave, 'Risk Appetite: a first save carrying the board’s approval is refused', users, 'ad', approved, false);
}

// Board Direction: a first save by the method owner carrying the chair's resolution or the scope agreement
{
  const checkSave = await load('board-direction');
  const users = [{ id: 'mo', name: 'Mo', roles: ['methodOwner'], active: true }, { id: 'ch', name: 'Cha', roles: ['chair'], active: true }, { id: 'gc', name: 'Gia', roles: ['gc'], active: true }];
  const fresh = () => ({ schema: 'triodian.bd.v1', engagement: { id: 'e1', company: 'Acme', mode: 'standalone', privilegeMarking: '' }, areas: [{ id: 'A1', name: 'Sales' }], scopeAgreed: { gcBy: '', gcOn: '', chairBy: '', chairOn: '' },
    inventory: [], positions: {}, questions: [], resolution: {}, people: [], versions: [], previous: null, history: [{ at: 'x', by: '', action: 'create', target: 'engagement', from: null, to: 'started' }] });
  run(checkSave, 'Board Direction: the blank first save by the method owner is accepted (control)', users, 'mo', fresh(), true);
  const resolved = fresh(); resolved.resolution = { by: 'ch', on: '2026-11-01', text: 'Resolved' };
  run(checkSave, 'Board Direction: a first save carrying the chair’s resolution, by someone who is not the chair, is refused', users, 'mo', resolved, false);
  const scoped = fresh(); scoped.scopeAgreed = { gcBy: 'gc', gcOn: '2026-11-01', chairBy: 'ch', chairOn: '2026-11-01' };
  run(checkSave, 'Board Direction: a first save carrying the GC’s and chair’s scope agreement is refused', users, 'mo', scoped, false);
}

// Use Assessment and Confidentiality had this rule from the 15 Nov pins (use-assessment #35, CEA #26); their own tests/rbac.test.mjs
// cover it and run in the suite leg.

// 2. Post-login redirect (PT-03; retest R-01): the shared session module's real /auth/login handler, driven with a
// synthetic demo account as the retest drove it, with the original slash/backslash payload and the retest's further
// destination variants. What counts is the Location the browser would follow: it must resolve to the app's own origin.
{
  const ORIGIN = 'https://confidentiality.client.example';
  const ATTACKS = ['/\\attacker.example/landing', '//attacker.example', '/\\/attacker.example', '/%5Cattacker.example', '/%2F%2Fattacker.example',
    'https://attacker.example/', 'http://attacker.example', 'javascript:alert(1)', '/\\attacker.example\\', '/\t/attacker.example', '/auth/email', '/login?next=//attacker.example'];
  for (const dir of APPS) {
    const { handleAuth, hashPassword } = await mod(dir, 'lib/identity/session.js');
    const env = { DEMO_LOGIN: JSON.stringify([{ username: 'probe', email: 'probe@client.example', hash: await hashPassword('probe-pass', 1000) }]), DEMO_SESSION_KEY: 'release-check-key', SUITE_DEMO: 'on' };
    const login = async next => { const form = new FormData(); form.set('username', 'probe'); form.set('password', 'probe-pass'); form.set('next', next);
      const res = await handleAuth(new Request(ORIGIN + '/auth/login', { method: 'POST', body: form }), env); return res ? { status: res.status, location: res.headers.get('Location') || '' } : null; };
    const ctl = await login('/engagements/1?tab=2');
    ok(`${dir}: a synthetic sign-in with a local destination lands there (control)`, ctl && ctl.status === 303 && ctl.location === '/engagements/1?tab=2', JSON.stringify(ctl));
    const bad = [];
    for (const a of ATTACKS) {
      const r = await login(a); if (!r) { bad.push(a + ' → no response'); continue; }
      let abs; try { abs = new URL(r.location, ORIGIN); } catch (e) { bad.push(a + ' → ' + r.location); continue; }
      if (abs.origin !== ORIGIN || abs.protocol !== 'https:' || abs.pathname.startsWith('/auth/')) bad.push(a + ' → ' + r.location);
    }
    ok(`${dir}: after sign-in, every off-origin, encoded or auth-route next destination stays on this origin`, bad.length === 0, bad.join(' ; '));
  }
}

// 3. Destruction (PT-05; retest R-01): Confidentiality's real API on its real D1 store over SQLite, seeded as the
// retest seeded it. After counsel's direction to destroy, the response must say destroyed only if the outbox body and
// the working-paper name are gone from every table; the archive case is the control.
{
  const dir = 'confidentiality-exposure-assessment';
  const { handle } = await mod(dir, 'lib/core/api.js');
  const d1 = sql => { const stmt = (q, args = []) => ({ bind: (...a) => stmt(q, a), async run() { const r = sql.prepare(q).run(...args); return { meta: { last_row_id: Number(r.lastInsertRowid), changes: r.changes } }; },
    async first() { return sql.prepare(q).get(...args) || null; }, async all() { return { results: sql.prepare(q).all(...args) }; } });
    return { prepare: q => stmt(q), async batch(list) { sql.exec('BEGIN'); try { const out = []; for (const s of list) out.push(await s.run()); sql.exec('COMMIT'); return out; } catch (e) { sql.exec('ROLLBACK'); throw e; } } }; };
  const ADMIN = 'admin@acme.test', NOW = '2026-11-16T01:00:00.000Z', DOC = 'Project Kestrel - bid price sensitivity.xlsx', BODY = 'Counsel question on Project Kestrel: the earn-out at $42m';
  const seeded = async disposition => {
    const sql = new DatabaseSync(':memory:'), store = (await mod(dir, 'lib/store/d1.js')).d1Store(d1(sql)); await store.init();
    await store.insertUser({ id: 'u-admin', email: ADMIN, name: 'Ada', organisation: 'Acme', roles: ['methodOwner', 'counsel'], isAdmin: true }, 'seed', NOW);
    const data = { schema: 'triodian.cea.v1', engagement: { id: 'e1', company: 'Acme', reference: 'M-1', closure: { by: 'u-admin', on: '2026-11-15', disposition, note: '' } },
      profile: { matterType: 'deal', codeName: 'Kestrel', tools: [], devicePolicy: 'managed', counselTurnaround: 2 }, people: [], documents: [{ id: 'D5', name: DOC, status: 'received', date: '2026-11-01' }], interviews: [],
      channels: [], questions: [], reviews: [{ point: 'R7', result: 'complete', by: 'u-admin', on: '2026-11-14' }], findings: [], history: [] };
    await store.putEngagement(JSON.stringify(data), 0, ADMIN, NOW);
    await store.addNotification({ key: 'q-1', to: 'counsel@law.test', subject: 'Question for counsel', body: BODY, status: 'sent' }, NOW);
    const call = (method, path, body) => handle({ method, path, email: ADMIN, text: async () => JSON.stringify(body), firstAdmins: [], sender: null }, store);
    return { sql, store, call };
  };
  const dump = sql => ['engagement', 'engagement_revisions', 'engagement_archive', 'notifications'].map(t => JSON.stringify(sql.prepare(`SELECT * FROM ${t}`).all())).join('\n');
  const d = await seeded('destroy');
  const r = await d.call('POST', '/api/next-assessment', { revision: (await d.store.getEngagement()).revision });
  const left = dump(d.sql), retained = [DOC, BODY, 'Kestrel'].filter(x => left.includes(x));
  ok('Confidentiality: a destroyed assessment leaves no notification body or working-paper name in any table', r.status === 200 && r.body.destroyed === true && retained.length === 0, `status ${r.status}, destroyed ${r.body && r.body.destroyed}, still held: ${retained.join(', ') || 'nothing'}`);
  const a = await seeded('archive');
  const ra = await a.call('POST', '/api/next-assessment', { revision: (await a.store.getEngagement()).revision });
  ok('Confidentiality: an archived assessment is kept and named (control)', ra.status === 200 && ra.body.destroyed === false && /Kestrel/.test(ra.body.label || ''), JSON.stringify(ra.body).slice(0, 120));
}

console.log(fails ? `\n${fails} release check(s) failed: releases.json names a release that still carries a finding the mains have fixed. Move the pin forward.` : '\nAll release checks passed');
process.exit(fails ? 1 : 0);
