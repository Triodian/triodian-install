#!/usr/bin/env node
// Release checks (penetration test 16 Nov 2026, PT-02; development plan P.2 and P.8): the apps a client install gets,
// checked out by tools/fetch-releases.mjs at the commits pinned in releases.json, must refuse a first save that
// carries another person's approval. The pins of 15 Nov (Risk Appetite 4e4e090d, Board Direction 4a89c5c8) accepted
// one; their mains of 16 Nov refuse it. This runs the forged payloads against whatever is checked out, with the blank
// first save as the control, so a pin can never again name a release that accepts them.
//   node tools/release-checks.mjs <folder holding the app checkouts>
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';

const root = resolve(process.argv[2] || '.');
let fails = 0; const ok = (label, cond, extra) => { if (!cond) fails++; console.log((cond ? 'PASS' : 'FAIL') + ' · ' + label + (extra ? ' → ' + extra : '')); };
const load = async (dir) => { const p = resolve(root, dir, 'lib/core/rbac.js'); if (!existsSync(p)) throw new Error(`${p} is not there: run tools/fetch-releases.mjs first`); return (await import(pathToFileURL(p).href)).checkSave; };
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

console.log(fails ? `\n${fails} release check(s) failed: releases.json names a release that accepts a forged first save. Move the pin forward.` : '\nAll release checks passed');
process.exit(fails ? 1 : 0);
