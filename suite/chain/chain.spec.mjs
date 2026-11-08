// Gate G2 (development plan): one regulated worked example runs the whole chain. Coastline Super, a fictional
// superannuation trustee in Australia, goes from AI Board Direction (connected mode) to AI Risk Appetite and AI Use
// Assessment and back:
//   1. Board Direction: the chair records the board directions BD1 to BD7
//   2. Risk Appetite: set-up loads them over the BOARD binding; decision 1 shows them; K11 holds back a ceiling above BD1
//   3. Risk Appetite: the CRO agrees the working appetite and the board approves it, which issues the calibration set
//   4. Use Assessment: the calibration set loads over the APPETITE binding; Triodian issues the in-use feed
//   5. Risk Appetite: decision 3 loads the feed over the ASSESSMENT binding; decision 8 shows the measures
//   6. Board Direction: the chair takes the board view over the APPETITE binding, and it matches the approved set
//   7. Board Direction: the APRA letter evidence index gathers all three apps' artefacts over APPETITE (and ASSESSMENT)
// Each step goes through the apps' own pages and APIs. Agreeing and approving are done the way the pages do them
// (window.RAF), because the pages require every cell of all eight decisions first; those screens have their own tests.
import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import { APPS, ADMIN } from './playwright.config.mjs';

// Every file that crosses a link is checked against its published schema (Triodian_Metamodel exchange/, task R.4).
const EXCHANGE = join(resolve(process.env.CHAIN_ROOT || join(dirname(fileURLToPath(import.meta.url)), '../../..')), 'triodian_metamodel/exchange');
const ajv = new Ajv({ allErrors: true, strict: false });
for (const f of readdirSync(EXCHANGE).filter(f => f.endsWith('.schema.json'))) ajv.addSchema(JSON.parse(readFileSync(join(EXCHANGE, f), 'utf8')), f);
function conforms(schemaFile, data) {
  const v = ajv.getSchema(schemaFile); expect(v, schemaFile).toBeTruthy();
  const ok = v(data); expect(ok ? [] : v.errors.map(e => `${e.instancePath || '/'} ${e.message}${e.params && e.params.additionalProperty ? ' (' + e.params.additionalProperty + ')' : ''}`), `${schemaFile}`).toEqual([]);
}

test.describe.configure({ mode: 'serial' });
const base = k => `http://localhost:${APPS[k].port}`;
async function api(k, method, path, body, as = ADMIN) {
  const r = await fetch(base(k) + path, { method, headers: { 'X-Dev-User': as, 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  let json = null; try { json = await r.json(); } catch (e) {}
  return { status: r.status, body: json };
}
async function open(browser, k, as, path = '/', example = false) {
  const ctx = await browser.newContext({ extraHTTPHeaders: { 'X-Dev-User': as } });
  await ctx.addInitScript((example) => { try { sessionStorage.setItem('triodian.suite.seen', '1'); if (!example) sessionStorage.setItem('triodian.example.left', '1'); } catch (e) {} }, example);
  const p = await ctx.newPage(); p._errors = []; p.on('pageerror', e => p._errors.push(String(e)));
  await p.goto(base(k) + path); await p.waitForTimeout(800);
  return { ctx, p };
}
const stored = async k => (await api(k, 'GET', '/api/engagement')).body;
const saved = async (k, test) => expect.poll(async () => { const s = await stored(k); return !!(s && s.exists && test(s.data)); }, { timeout: 20_000 }).toBe(true);

const P = { chair: 'chair@coastline.test', ceo: 'ceo@coastline.test', recorder: 'recorder@coastline.test', cro: 'cro@coastline.test', board: 'board@coastline.test', mo: 'mo@coastline.test' };
const ids = {};
const AREAS = ['Member services and communications', 'Claims and group insurance', 'Advice', 'Investments', 'Administration and payments', 'Complaints and disputes', 'Finance and reporting', 'Legal and compliance', 'Technology operations'];
const POSTURE = ['S3', 'S2', 'S2', 'S3', 'S3', 'S2', 'S2', 'S1', 'S3']; // Claims and group insurance: Cautious, so up to A2

test('set-up: the people, in each app', async () => {
  for (const [k, list] of Object.entries({ bd: [['chair', ['chair']], ['ceo', ['ceo']], ['recorder', ['recorder']]], ra: [['cro', ['cro']], ['board', ['board']]], ua: [['mo', ['methodOwner']]] })) {
    for (const [who, roles] of list) {
      const r = await api(k, 'POST', '/api/admin/users', { email: P[who], name: who.toUpperCase() + ' (Coastline)', organisation: 'Coastline Super (fictional)', roles, isAdmin: false, active: true });
      expect([201, 409], `${k} ${who}: ${JSON.stringify(r.body)}`).toContain(r.status);
      ids[k + ':' + who] = r.body.user ? r.body.user.id : (await api(k, 'GET', '/api/admin/users')).body.users.find(u => u.email === P[who]).id;
    }
  }
});

test('the three apps reach each other through their service bindings', async () => {
  // Each link answers 503 until the other app's session has registered; then it answers from that app (200 or 404).
  for (const [k, path] of [['ra', '/api/directions-from-board'], ['ra', '/api/feedback-from-assessment'], ['ua', '/api/calibration-from-appetite'], ['bd', '/api/board-view-from-appetite']])
    await expect.poll(async () => (await api(k, 'GET', path)).status, { timeout: 60_000, message: `${k} ${path}` }).not.toBe(503);
});

test('1 · Board Direction: the chair records the board directions', async ({ browser }) => {
  const ch = ids['bd:chair'];
  const data = { schema: 'triodian.bd.v1', engagement: { id: 'e-coastline-bd', company: 'Coastline Super (fictional)', entityType: 'superannuationTrustee', jurisdiction: 'AU', sector: 'AU-SUPERANNUATION', mode: 'connected', sectorPack: 'superTrustee', reference: 'CS-BD-2026', privilegeMarking: 'Privileged and confidential · prepared at the request of counsel', practitioner: { firm: '', line: '' }, boardDates: { workshop: '2026-11-18', resolution: '2026-12-02' }, gcActsAsCounsel: false, secondApproverId: '' },
    areas: AREAS.map((name, i) => ({ id: 'A' + (i + 1), name })), scopeAgreed: {}, inventory: [],
    positions: {
      B2: Object.fromEntries(AREAS.map((_, i) => ['A' + (i + 1), { posture: POSTURE[i], condition: i === 1 ? 'A person decides every death or disablement claim' : '', proposedBy: ch }])),
      B3: { lines: [{ id: 'RL1', use: 'AI declining a death or disablement claim with no person reviewing it', scope: 'Claims and group insurance', appliesTo: 'The trustee and its providers', testedAgainst: 'none', proposedBy: ch }] },
      B4: { events: [{ id: 'RV1', event: 'A new AI use at A3 (Decides) or above', timing: 'Before it starts', by: 'CEO', proposedBy: ch }] },
      B6: { harms: { H1: { statement: 'A member wrongly denied or delayed a benefit', threshold: 'Any single instance', source: 'New', proposedBy: ch } } },
      B7: { measures: [{ id: 'BM3', measure: 'Material AI incidents', limit: '0', owner: 'CEO' }], events: [{ id: 'EV1', event: 'A material AI incident', to: 'Chair', within: '24 hours' }], proposedBy: ch },
      B8: { owners: { AC3: 'The CEO' }, proposedBy: ch },
    },
    questions: [], resolution: {}, people: [], versions: [], previous: null, history: [] };
  const put = await api('bd', 'PUT', '/api/engagement', { revision: 0, data });
  expect(put.status, JSON.stringify(put.body)).toBe(200);
  expect((await api('bd', 'GET', '/api/board-directions')).status).toBe(404); // not served before the chair records them

  const { ctx, p } = await open(browser, 'bd', P.chair);
  await p.locator('#step-B9 > summary').click();
  await p.click('[data-act="recordDirections"]'); await p.click('[data-act="recordDirections"]');
  await expect(p.locator('#toast')).toContainText('The board directions are recorded');
  await saved('bd', d => (d.directions || {}).by === ch);
  const dir = await api('bd', 'GET', '/api/board-directions');
  expect(dir.status).toBe(200);
  expect(dir.body.directions.BD1.areas.find(a => a.name === 'Claims and group insurance').maxTier).toBe('A2');
  conforms('board-directions-v1.schema.json', dir.body);
  expect(p._errors).toEqual([]);
  await ctx.close();
});

test('2 · Risk Appetite: the directions load over the binding, show on decision 1, and K11 holds back a ceiling above them', async ({ browser }) => {
  const a = await open(browser, 'ra', ADMIN, '/admin/');
  await a.p.locator('[data-act="new"]').click();
  await a.p.locator('#f_engagement_sectorPack').selectOption('superTrustee');
  await a.p.locator('#f_engagement_insurer').fill('Coastline Super (fictional)'); await a.p.locator('#f_engagement_insurer').blur();
  await a.p.click('[data-act="loadDirBoard"]');
  await expect(a.p.locator('#toast')).toContainText('Board directions loaded');
  await expect(a.p.locator('body')).toContainText('Every function matches a BD1 area.');
  await a.p.evaluate(() => window.RAF.save());
  await saved('ra', d => d.boardDirections && d.boardDirections.source === 'board' && d.engagement.sectorPack === 'superTrustee');
  expect(a.p._errors).toEqual([]);
  await a.ctx.close();

  const { ctx, p } = await open(browser, 'ra', P.cro, '/#d1');
  await p.evaluate(() => window.RAF.go('d1'));
  await expect(p.locator('body')).toContainText('The board’s directions for this decision · BD1, BD2, BD3');
  await expect(p.locator('body')).toContainText('Claims and group insurance: Cautious · up to A2 · A person decides every death or disablement claim');
  // every decision 1 ceiling, within the posture except Claims and group insurance for own staff at A3
  const cro = ids['ra:cro'];
  await p.evaluate(({ cro }) => {
    const S = window.RAF.state, max = { ms: 'A4', ci: 'A2', ad: 'A2', iv: 'A4', ap: 'A4', cd: 'A2', fi: 'A2', lc: 'A1', to: 'A4' };
    S.functions.forEach(f => ['own', 'provider', 'platform'].forEach(l => { S.decisions.d1.cells[`d1.${f.id}.${l}`] = { value: f.id === 'ci' && l === 'own' ? 'A3' : max[f.id], condition: '', testable: false, reason: '', boardRevisit: '', proposedBy: cro, recordedBy: 'cro', owner: cro, dissent: '', status: 'set', notSetOwner: '', notSetDue: '', source: '' }; }));
    window.RAF.render();
  }, { cro });
  let k11 = await p.evaluate(() => window.RAF.checks().find(k => k.id === 'K11'));
  expect(k11.state).toBe('fail');
  expect(k11.off.map(o => o.id)).toEqual(['d1.ci.own']);
  await p.evaluate(() => { const c = window.RAF.state.decisions.d1.cells['d1.ci.own']; c.reason = 'Triage only: routes claims to fast-track or review, and a person decides each one'; c.boardRevisit = 'Board meeting 2 December 2026'; window.RAF.render(); });
  k11 = await p.evaluate(() => window.RAF.checks().find(k => k.id === 'K11'));
  expect(k11.state).toBe('pass');
  await p.evaluate(() => window.RAF.save());
  await saved('ra', d => Object.keys(d.decisions.d1.cells).length === 27 && d.decisions.d1.cells['d1.ci.own'].boardRevisit);
  expect(p._errors).toEqual([]);
  await ctx.close();
});

test('3 · Risk Appetite: the CRO agrees the working appetite and the board approves it', async ({ browser }) => {
  const c = await open(browser, 'ra', P.cro);
  await c.p.evaluate(() => { // as agreeWorking() does
    const S = window.RAF.state, cro = S.people.find(p => (p.roles || []).includes('cro')), c = S.calibration, today = new Date().toLocaleDateString('en-CA');
    c.version = 1; c.status = 'working'; c.agreedBy = cro.name; c.agreedById = cro.id; c.agreedOn = today;
    c.issued.push({ version: 1, status: 'working', on: today, by: cro.name, snapshot: window.RAF.snapshot() });
    c.issued[c.issued.length - 1].set = window.RAF.calibrationSet();
    window.RAF.save();
  });
  await saved('ra', d => d.calibration.status === 'working' && d.calibration.issued.length === 1);
  expect(c.p._errors).toEqual([]);
  await c.ctx.close();

  const b = await open(browser, 'ra', P.board);
  await b.p.evaluate(() => { // as recordApproval() does
    const c = window.RAF.state.calibration, date = '2026-12-02', minute = 'Board minute 2026/12-04', by = 'The Board';
    c.status = 'approved'; c.approvedOn = date; c.minuteRef = minute; c.approvedBy = by;
    c.issued.push({ version: c.version, status: 'approved', on: date, minuteRef: minute, by, snapshot: window.RAF.snapshot() });
    c.issued[c.issued.length - 1].set = window.RAF.calibrationSet();
    window.RAF.save();
  });
  await saved('ra', d => d.calibration.status === 'approved');
  const cal = await api('ra', 'GET', '/api/calibration-set');
  expect(cal.status).toBe(200);
  expect(cal.body.status).toBe('approved');
  expect(cal.body.calibrationSet.parameters.P1['Claims and group insurance'].own.tier).toBe('A3');
  conforms('calibration-set-v1.schema.json', cal.body.calibrationSet);
  expect(b.p._errors).toEqual([]);
  await b.ctx.close();
});

test('4 · Use Assessment: the calibration set loads over the binding, and Triodian issues the in-use feed', async ({ browser }) => {
  // The assessment starts from the worked example's register, re-pointed at Coastline and the super pack.
  const ex = await open(browser, 'ua', ADMIN, '/', true);
  await expect(ex.p.locator('.examplebar', { hasText: 'Worked example:' })).toBeVisible({ timeout: 15_000 });
  const data = await ex.p.evaluate(() => JSON.parse(JSON.stringify(window.AUA.state)));
  await ex.ctx.close();
  Object.assign(data.engagement, { id: 'e-coastline-ua', example: false, insurer: 'Coastline Super (fictional)', sectorPack: 'superTrustee', reference: 'CS-UA-2026' });
  data.calibration = { loaded: false, status: 'default', version: 0, date: '', approvedBy: '', agreedBy: '', privilegeMarking: '', minuteRef: '', fellBack: [], parameters: {} };
  data.versions = []; data.previous = null; data.history = []; delete data.feedback;
  const put = await api('ua', 'PUT', '/api/engagement', { revision: 0, data });
  expect(put.status, JSON.stringify(put.body).slice(0, 300)).toBe(200);

  const { ctx, p } = await open(browser, 'ua', P.mo);
  await p.evaluate(() => window.AUA.go('setup'));
  await p.click('[data-act="loadCalApp"]');
  await expect(p.locator('#toast')).toContainText('Calibration loaded');
  await expect.poll(() => p.evaluate(() => window.AUA.state.calibration.status)).toBe('approved');
  await p.evaluate(() => window.AUA.go('outputs'));
  await p.click('[data-act="outTab"][data-t="DL1"]');
  await p.click('#out-feed');
  await expect(p.locator('#toast')).toContainText('The in-use feed is issued');
  await saved('ua', d => !!d.feedback);
  const f = await api('ua', 'GET', '/api/appetite-feedback');
  expect(f.status).toBe(200);
  expect(f.body.schema).toBe('triodian.aua.extract.v2');
  expect(f.body.measures.map(m => m.ref)).toEqual(['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10']);
  expect(f.body.measures.find(m => m.ref === 'M1').value).not.toBeNull(); // counted, now the calibration set is loaded
  conforms('register-extract-v2.schema.json', f.body);
  expect(p._errors).toEqual([]);
  await ctx.close();
});

test('5 · Risk Appetite: decision 8 loads the in-use feed over the binding, without reopening the approved appetite', async ({ browser }) => {
  const { ctx, p } = await open(browser, 'ra', P.cro);
  await p.evaluate(() => window.RAF.go('d8'));
  await expect(p.locator('body')).toContainText('In use now · no in-use feed loaded');
  await p.locator('summary', { hasText: 'In use now' }).click();
  await p.click('[data-act="loadFeed8"]');
  await expect(p.locator('#toast')).toContainText('In-use feed loaded');
  await expect(p.locator('body')).toContainText('In use now · from the AI Use Assessment in-use feed');
  await p.evaluate(() => window.RAF.save());
  await saved('ra', d => d.inUse && d.inUse.source === 'assessment' && d.inUse.measures.length === 10);
  const s = (await stored('ra')).data.calibration;
  expect([s.status, s.version]).toEqual(['approved', 1]); // reporting data: the approved version stands
  expect(p._errors).toEqual([]);
  await ctx.close();
});

test('6 · Board Direction: the chair takes the board view, and it matches the approved calibration set', async ({ browser }) => {
  const { ctx, p } = await open(browser, 'bd', P.chair);
  await p.locator('#step-B9 > summary').click();
  await p.click('[data-act="takeBoardView"]');
  await expect(p.locator('#step-B9')).toContainText('the AI risk appetite is approved by the board, version 1');
  await expect(p.locator('#step-B9')).toContainText('Claims and group insurance');
  await expect(p.locator('#step-B9')).toContainText('A3'); // the approved ceilings show in the table
  await expect(p.locator('#step-B9')).toContainText('In use now · counted from the AI Use Assessment register');
  await saved('bd', d => (d.boardViews || []).length === 1);
  const view = (await stored('bd')).data.boardViews[0].view, cal = await api('ra', 'GET', '/api/calibration-set');
  expect(JSON.stringify(view.approved)).toBe(JSON.stringify(cal.body)); // the board view is the approved set, word for word
  expect(view.inUse.measures.length).toBe(10);
  conforms('board-view-v1.schema.json', view);
  conforms('board-view-v1.schema.json', (await api('ra', 'GET', '/api/board-view')).body);
  expect(p._errors).toEqual([]);
  await ctx.close();
});

// Task R.2: the APRA letter evidence index. Board Direction gathers the artefacts over APPETITE; Risk Appetite adds
// its own and, over ASSESSMENT, Use Assessment's. Each letter bullet shows its evidence or "none yet".
test('7 · Board Direction: the evidence index gathers the artefacts of all three apps, by letter bullet and by ISO/IEC 42001 control', async ({ browser }) => {
  const { ctx, p } = await open(browser, 'bd', P.chair);
  const r = await api('bd', 'GET', '/api/evidence-from-appetite');
  expect(r.status).toBe(200);
  expect(r.body.notes).toEqual([]); // both links answered
  const art = (app, id) => r.body.artefacts.find(a => a.app === app && a.id === id) || {};
  expect(art('RA', 'calibration').status).toBe('recorded'); // approved at step 3
  expect(art('RA', 'inUse').status).toBe('recorded'); // loaded at step 5
  expect(art('UA', 'FN').status).toBe('recorded'); // the in-use feed issued at step 4
  expect(art('UA', 'DL1').letter).toContain('G3');
  const card = p.locator('#evidence');
  await p.click('[data-act="gatherEvidence"]');
  await expect(card).toContainText('Gathered from AI Risk Appetite and AI Use Assessment');
  await expect(card.locator('[data-ev="G3"]')).toContainText('AI dependency register');
  await expect(card.locator('[data-ev="B2"]')).toContainText('Calibration set');
  await expect(card.locator('[data-ev="A2"]')).toContainText('none yet');
  await p.selectOption('#ev-by', 'iso');
  await expect(card.locator('[data-ev="A.10"]')).toContainText('Findings F1 to F4');
  const md = await p.evaluate(() => window.BDApp.evidenceMarkdown('letter'));
  expect(md).toMatch(/## B2 [^]*\| AI Risk Appetite \| Calibration set \| Recorded \|/);
  expect(md).toMatch(/## G3 [^]*\| AI Use Assessment \| AI dependency register \|/);
  expect(md).toMatch(/## S3 [^\n]*\n\n[^\n]*\n\nNone yet\./);
  expect(p._errors).toEqual([]);
  await ctx.close();
});
