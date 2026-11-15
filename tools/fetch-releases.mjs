#!/usr/bin/env node
// Fetches the four engagement apps at the releases pinned in releases.json, into one folder, the way install.mjs does
// for a client, so the suite and chain tests can run against the exact manifest a client would get (security review
// 15 Nov 2026, S.8).   node tools/fetch-releases.mjs <folder>
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { APPS } from '../lib-config.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const RELEASES = JSON.parse(readFileSync(join(HERE, '..', 'releases.json'), 'utf8')).apps;
const root = resolve(process.argv[2] || '.');
const git = (args, cwd) => execFileSync('git', args, { cwd, stdio: 'inherit' });
for (const app of APPS) {
  const ref = (RELEASES[app.id] || {}).ref;
  if (!ref) throw new Error(`releases.json has no release for ${app.id}`);
  const dir = join(root, app.dir), url = `https://github.com/Triodian/${app.repo}.git`;
  if (!existsSync(join(dir, '.git'))) git(['clone', '--quiet', '--depth', '1', url, dir]);
  const origin = execFileSync('git', ['-C', dir, 'remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim().replace(/\.git$/, '').toLowerCase();
  if (origin !== url.replace(/\.git$/, '').toLowerCase()) throw new Error(`${dir} is a checkout of ${origin}, not of ${url}. Refusing to use it.`);
  git(['-C', dir, 'fetch', '--quiet', '--depth', '1', 'origin', ref]);
  git(['-C', dir, 'checkout', '--quiet', '--detach', 'FETCH_HEAD']);
  console.log(`${app.name}: ${ref}`);
}
