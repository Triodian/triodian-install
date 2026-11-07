// Checks the installer's client configuration against the app checkouts beside this repo, without touching Cloudflare.
// Run: node test-install.mjs
import { clientConfig } from './install.mjs';
import { APPS, appsFor, stripJsonc } from './lib-config.mjs';
import { resolve } from 'node:path';
let fails = 0; const ok = (l, c, x) => { if (!c) fails++; console.log((c ? 'PASS' : 'FAIL') + ' · ' + l + (x ? ' → ' + x : '')); };
ok('JSONC: comments go, URLs in strings stay', JSON.parse(stripJsonc('{ // c\n "u": "https://x/y", /* b */ "n": 1, }')).u === 'https://x/y');
ok('a general company gets two apps; a regulated entity four', appsFor('general').map(a => a.id).join() === 'confidentiality,board-direction' && appsFor('regulated').length === 4);
const a = { code: 'acme', domain: 'acme.example.com', teamDomain: 'acme.cloudflareaccess.com', firstAdmins: ['gc@acme.example.com'], dir: resolve('..') };
const ids = { identity: 'ID-IDENT', 'risk-appetite': 'ID-RA', 'use-assessment': 'ID-UA', confidentiality: 'ID-CEA', 'board-direction': 'ID-BD' };
for (const app of APPS) {
  const { config: c, host } = clientConfig(app, a, ids);
  ok(`${app.name}: named for the client, on its subdomain`, c.name === `${app.worker}-acme` && host.endsWith('.acme.example.com') && c.routes[0].pattern === host && !c.env);
  ok(`${app.name}: its own database and the shared identity database`, c.d1_databases.map(d => d.binding + ':' + d.database_id).join() === `DB:${ids[app.id]},IDENTITY:ID-IDENT`);
  ok(`${app.name}: demo off, one sign-in on the client domain, first admin named`, c.vars.SUITE_DEMO === 'off' && c.vars.DEMO_LOGIN === '' && c.vars.DEMO_ADMINS === '' && c.vars.SUITE_COOKIE_DOMAIN === 'acme.example.com' && c.vars.FIRST_ADMINS === 'gc@acme.example.com' && c.vars.ACCESS_TEAM_DOMAIN === 'acme.cloudflareaccess.com');
  ok(`${app.name}: no placeholder left`, !/CLIENT-DOMAIN|REPLACE-WITH/.test(JSON.stringify(c)), (JSON.stringify(c).match(/[^"]*(CLIENT-DOMAIN|REPLACE-WITH)[^"]*/) || [''])[0]);
  for (const s of c.services || []) ok(`${app.name}: binding ${s.binding} points at this client's ${s.service.replace(/-acme$/, '')}`, /-acme$/.test(s.service));
}
console.log(fails ? `\n${fails} failed` : '\nAll passed'); process.exit(fails ? 1 : 0);
