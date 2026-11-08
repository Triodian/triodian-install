// Gate G2 (development plan): the regulated chain, end to end. Three `wrangler dev` sessions run AI Risk Appetite, AI
// Use Assessment and AI Board Direction from their checkouts beside this repo, each on its own port with local storage.
// Wrangler's local dev registry connects their service bindings (BOARD, ASSESSMENT, APPETITE) as Cloudflare does, so
// the test goes through the same entrypoints the deployed apps use. No secrets and no Cloudflare account.
//
// Run from this folder after `npm ci`: npx playwright test   (CHAIN_ROOT points at the folder holding the app checkouts)
import { defineConfig } from '@playwright/test';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(process.env.CHAIN_ROOT || join(HERE, '../../..'));
export const ADMIN = 'damian.hickey@triodian.com';
export const APPS = { ra: { dir: 'risk_appetite', port: 8831 }, ua: { dir: 'use-assessment', port: 8832 }, bd: { dir: 'board-direction', port: 8833 } };
const persist = process.env.CHAIN_STATE || mkdtempSync(join(tmpdir(), 'triodian-chain-'));
const wrangler = join(HERE, 'node_modules/wrangler/bin/wrangler.js');
// A dev registry of its own, so the three sessions find each other and not an app's own test run or a stale entry.
const registry = join(persist, 'registry');

export default defineConfig({
  testDir: '.',
  testMatch: /.*\.spec\.mjs$/,
  fullyParallel: false,
  workers: 1,
  timeout: 180_000,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: { viewport: { width: 1280, height: 900 }, timezoneId: 'Australia/Brisbane', trace: 'retain-on-failure', launchOptions: { executablePath: process.env.CHROME_PATH || undefined } },
  webServer: Object.entries(APPS).map(([k, a], i) => ({
    cwd: join(ROOT, a.dir),
    command: [`node ${wrangler} dev`, `--port ${a.port} --ip 127.0.0.1 --local-upstream localhost`, `--inspector-port ${9331 + i}`,
      `--persist-to ${join(persist, k)}`, `--var LOCAL_DEV_NO_SIGNIN_EMAIL:${ADMIN}`, '--var NOTIFY_SENDING:off', `--var SITE_URL:http://localhost:${a.port}`,
      '--show-interactive-dev-session=false'].join(' '),
    env: { ...process.env, WRANGLER_REGISTRY_PATH: registry },
    url: `http://localhost:${a.port}/login/`,
    timeout: 120_000,
    reuseExistingServer: false,
  })),
});
