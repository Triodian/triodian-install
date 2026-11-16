// Checks the installer's client configuration against the app checkouts beside this repo, without touching Cloudflare.
// Run: node test-install.mjs
import { clientConfig, accessApp } from './install.mjs';
import { APPS, appsFor, stripJsonc, JURISDICTIONS, SECTORS } from './lib-config.mjs';
import { resolve, join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
let fails = 0; const ok = (l, c, x) => { if (!c) fails++; console.log((c ? 'PASS' : 'FAIL') + ' · ' + l + (x ? ' → ' + x : '')); };
ok('JSONC: comments go, URLs in strings stay', JSON.parse(stripJsonc('{ // c\n "u": "https://x/y", /* b */ "n": 1, }')).u === 'https://x/y');
ok('a general company gets two apps; a regulated entity four', appsFor('general').map(a => a.id).join() === 'confidentiality,board-direction' && appsFor('regulated').length === 4);
const a = { code: 'acme', domain: 'acme.example.com', teamDomain: 'acme.cloudflareaccess.com', firstAdmins: ['gc@acme.example.com'], dir: resolve('..'), jurisdiction: 'AU', sector: 'AU-SUPERANNUATION' };
const ids = { identity: 'ID-IDENT', 'risk-appetite': 'ID-RA', 'use-assessment': 'ID-UA', confidentiality: 'ID-CEA', 'board-direction': 'ID-BD' };
for (const app of APPS) {
  const { config: c, host } = clientConfig(app, a, ids);
  ok(`${app.name}: named for the client, on its subdomain`, c.name === `${app.worker}-acme` && host.endsWith('.acme.example.com') && c.routes[0].pattern === host && !c.env);
  ok(`${app.name}: its own database and the shared identity database`, c.d1_databases.map(d => d.binding + ':' + d.database_id).join() === `DB:${ids[app.id]},IDENTITY:ID-IDENT`);
  ok(`${app.name}: demo off, one sign-in on the client domain, first admin named`, c.vars.SUITE_DEMO === 'off' && c.vars.DEMO_LOGIN === '' && c.vars.DEMO_ADMINS === '' && c.vars.SUITE_COOKIE_DOMAIN === 'acme.example.com' && c.vars.FIRST_ADMINS === 'gc@acme.example.com' && c.vars.ACCESS_TEAM_DOMAIN === 'acme.cloudflareaccess.com');
  ok(`${app.name}: no placeholder left`, !/CLIENT-DOMAIN|REPLACE-WITH/.test(JSON.stringify(c)), (JSON.stringify(c).match(/[^"]*(CLIENT-DOMAIN|REPLACE-WITH)[^"]*/) || [''])[0]);
  ok(`${app.name}: starts in the chosen jurisdiction and sector`, c.vars.DEFAULT_JURISDICTION === 'AU' && c.vars.DEFAULT_SECTOR === 'AU-SUPERANNUATION');
  for (const s of c.services || []) ok(`${app.name}: binding ${s.binding} points at this client's ${s.service.replace(/-acme$/, '')}`, /-acme$/.test(s.service));
}
const none = clientConfig(APPS[3], { ...a, jurisdiction: undefined, sector: undefined }, ids).config.vars;
ok('without a choice, an app starts in Australia with no sector', none.DEFAULT_JURISDICTION === 'AU' && none.DEFAULT_SECTOR === '');
ok('every sector belongs to a jurisdiction offered', SECTORS.every(d => JURISDICTIONS.some(j => j[0] === d.jurisdiction) && d.id.startsWith(d.jurisdiction + '-')));
const bd = join(a.dir, 'board-direction', 'public', 'bd-content.json');
const theirs = existsSync(bd) ? JSON.parse(readFileSync(bd, 'utf8')).regulatedSectors : null;
if (theirs) ok('the sectors match AI Board Direction’s copy of the Metamodel list', JSON.stringify(theirs.map(d => [d.id, d.name, d.financiallyRegulated])) === JSON.stringify(SECTORS.map(d => [d.id, d.name, d.financiallyRegulated])));
else console.log('SKIP · AI Board Direction has no regulated sectors yet (board-direction #26)');
// US.6: a United States client, and the pack each sector the installer offers starts on in the apps that have packs.
for (const app of APPS) {
  const v = clientConfig(app, { ...a, jurisdiction: 'US', sector: 'US-BANKING' }, ids).config.vars;
  ok(`${app.name}: a US bank starts in the United States, banking`, v.DEFAULT_JURISDICTION === 'US' && v.DEFAULT_SECTOR === 'US-BANKING');
}
for (const [repo, file, global] of [['risk_appetite', 'content.js', 'RAF_CONTENT'], ['use-assessment', 'aua-content.js', 'AUA_CONTENT']]) {
  const f = join(a.dir, repo, 'public', file), pk = join(a.dir, repo, 'public', 'shared', 'packs.js');
  if (!existsSync(f) || !existsSync(pk)) { console.log(`SKIP · ${repo} is not checked out beside this repo`); continue; }
  globalThis.window = {}; new Function('window', readFileSync(f, 'utf8'))(globalThis.window);
  const B = globalThis.window[global], P = {}; new Function('globalThis', 'module', readFileSync(pk, 'utf8'))(P, undefined);
  const T = P.TriodianPacks;
  if (!T || !T.startPack || !B.regulatedSectors) { console.log(`SKIP · ${repo} does not choose a pack from the install's sector yet (risk_appetite #35, use-assessment #34)`); continue; }
  const bad = SECTORS.map(d => [d.id, T.startPack(B, { jurisdiction: d.jurisdiction, sector: d.id })]).filter(([id, p]) => { const q = B.packs[p]; return !q || !(q.jurisdiction === id.slice(0, 2) || q.jurisdiction === 'any'); });
  ok(`${repo}: every sector the installer offers starts on a pack of its jurisdiction or a baseline`, !bad.length, bad.map(x => x.join(' → ')).join(', '));
  const us = ['US-BANKING', 'US-INSURANCE', 'US-SECURITIES', 'US-HEALTH', 'US-CRITICAL-INFRASTRUCTURE'].map(s => T.startPack(B, { jurisdiction: 'US', sector: s }));
  ok(`${repo}: each US main sector starts on its US overlay pack`, us.join() === 'usBanking,usInsurance,usSecurities,usHealth,usCriticalInfrastructure', us.join());
}
// ID.2: sign-in through the organisation's identity provider, federated in Access
{
  const app = APPS[0];
  const plain = accessApp(app, a, 'risk-appetite.acme.example.com');
  ok('without an identity provider the Access application offers the email code and names no idp', !('allowed_idps' in plain) && plain.domain === 'risk-appetite.acme.example.com/auth/email' && /email code/.test(plain.policies[0].name));
  const idp = accessApp(app, { ...a, idp: '0f8c1c2e-8d1b-4f3a-9b1d-0a1b2c3d4e5f' }, 'risk-appetite.acme.example.com');
  ok('with one, only that provider is offered on the sign-in path', idp.allowed_idps.length === 1 && idp.allowed_idps[0] === '0f8c1c2e-8d1b-4f3a-9b1d-0a1b2c3d4e5f' && /identity provider/.test(idp.policies[0].name) && idp.domain.endsWith('/auth/email'));
  ok('every app is told it sits behind Access', clientConfig(app, a, ids).config.vars.IDENTITY_PROVIDER === 'access');
}

console.log(fails ? `\n${fails} failed` : '\nAll passed'); process.exit(fails ? 1 : 0);
