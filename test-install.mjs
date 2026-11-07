// Checks the installer's client configuration against the app checkouts beside this repo, without touching Cloudflare.
// Run: node test-install.mjs
import { clientConfig } from './install.mjs';
import { APPS, appsFor, stripJsonc, JURISDICTIONS, DOMAINS } from './lib-config.mjs';
import { resolve, join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
let fails = 0; const ok = (l, c, x) => { if (!c) fails++; console.log((c ? 'PASS' : 'FAIL') + ' · ' + l + (x ? ' → ' + x : '')); };
ok('JSONC: comments go, URLs in strings stay', JSON.parse(stripJsonc('{ // c\n "u": "https://x/y", /* b */ "n": 1, }')).u === 'https://x/y');
ok('a general company gets two apps; a regulated entity four', appsFor('general').map(a => a.id).join() === 'confidentiality,board-direction' && appsFor('regulated').length === 4);
const a = { code: 'acme', domain: 'acme.example.com', teamDomain: 'acme.cloudflareaccess.com', firstAdmins: ['gc@acme.example.com'], dir: resolve('..'), jurisdiction: 'AU', regulatedDomain: 'AU-SUPERANNUATION' };
const ids = { identity: 'ID-IDENT', 'risk-appetite': 'ID-RA', 'use-assessment': 'ID-UA', confidentiality: 'ID-CEA', 'board-direction': 'ID-BD' };
for (const app of APPS) {
  const { config: c, host } = clientConfig(app, a, ids);
  ok(`${app.name}: named for the client, on its subdomain`, c.name === `${app.worker}-acme` && host.endsWith('.acme.example.com') && c.routes[0].pattern === host && !c.env);
  ok(`${app.name}: its own database and the shared identity database`, c.d1_databases.map(d => d.binding + ':' + d.database_id).join() === `DB:${ids[app.id]},IDENTITY:ID-IDENT`);
  ok(`${app.name}: demo off, one sign-in on the client domain, first admin named`, c.vars.SUITE_DEMO === 'off' && c.vars.DEMO_LOGIN === '' && c.vars.DEMO_ADMINS === '' && c.vars.SUITE_COOKIE_DOMAIN === 'acme.example.com' && c.vars.FIRST_ADMINS === 'gc@acme.example.com' && c.vars.ACCESS_TEAM_DOMAIN === 'acme.cloudflareaccess.com');
  ok(`${app.name}: no placeholder left`, !/CLIENT-DOMAIN|REPLACE-WITH/.test(JSON.stringify(c)), (JSON.stringify(c).match(/[^"]*(CLIENT-DOMAIN|REPLACE-WITH)[^"]*/) || [''])[0]);
  ok(`${app.name}: starts in the chosen jurisdiction and domain`, c.vars.DEFAULT_JURISDICTION === 'AU' && c.vars.DEFAULT_DOMAIN === 'AU-SUPERANNUATION');
  for (const s of c.services || []) ok(`${app.name}: binding ${s.binding} points at this client's ${s.service.replace(/-acme$/, '')}`, /-acme$/.test(s.service));
}
const none = clientConfig(APPS[3], { ...a, jurisdiction: undefined, regulatedDomain: undefined }, ids).config.vars;
ok('without a choice, an app starts in Australia with no domain', none.DEFAULT_JURISDICTION === 'AU' && none.DEFAULT_DOMAIN === '');
ok('every domain belongs to a jurisdiction offered', DOMAINS.every(d => JURISDICTIONS.some(j => j[0] === d.jurisdiction) && d.id.startsWith(d.jurisdiction + '-')));
const bd = join(a.dir, 'board-direction', 'public', 'bd-content.json');
const theirs = existsSync(bd) ? JSON.parse(readFileSync(bd, 'utf8')).regulatedDomains : null;
if (theirs) ok('the domains match AI Board Direction’s copy of the Metamodel list', JSON.stringify(theirs.map(d => [d.id, d.name, d.financiallyRegulated])) === JSON.stringify(DOMAINS.map(d => [d.id, d.name, d.financiallyRegulated])));
else console.log('SKIP · AI Board Direction has no regulated domains yet (board-direction #26)');
console.log(fails ? `\n${fails} failed` : '\nAll passed'); process.exit(fails ? 1 : 0);
