// Reading and writing the apps' wrangler.jsonc files. Shared by the installer and the suite test.
import { readFileSync } from 'node:fs';

/** The engagement apps, in the order they must be deployed (Risk Appetite first: Use Assessment binds to it). */
export const APPS = [
  { id: 'risk-appetite', repo: 'risk_appetite', dir: 'risk_appetite', worker: 'risk-appetite', name: 'AI Risk Appetite', regulatedOnly: true },
  { id: 'use-assessment', repo: 'use-assessment', dir: 'use-assessment', worker: 'use-assessment', name: 'AI Use Assessment', regulatedOnly: true },
  { id: 'confidentiality', repo: 'Confidentiality-Exposure-Assessment', dir: 'confidentiality-exposure-assessment', worker: 'confidentiality-exposure-assessment', name: 'AI Confidentiality Exposure Assessment', regulatedOnly: false },
  { id: 'board-direction', repo: 'board-direction', dir: 'board-direction', worker: 'board-direction', name: 'AI Board Direction', regulatedOnly: false },
];
/** Apps for a profile: general companies get Board Direction and the confidentiality app; regulated entities get all four. */
export const appsFor = profile => APPS.filter(a => profile === 'regulated' || !a.regulatedOnly);

/** Strips // and /* *\/ comments and trailing commas from JSONC, leaving strings (and the // in URLs) alone. */
export function stripJsonc(text) {
  let out = '', i = 0, inStr = false;
  while (i < text.length) {
    const c = text[i], n = text[i + 1];
    if (inStr) { out += c; if (c === '\\') { out += n; i += 2; continue; } if (c === '"') inStr = false; i++; continue; }
    if (c === '"') { inStr = true; out += c; i++; continue; }
    if (c === '/' && n === '/') { while (i < text.length && text[i] !== '\n') i++; continue; }
    if (c === '/' && n === '*') { i = text.indexOf('*/', i + 2); i = i < 0 ? text.length : i + 2; continue; }
    out += c; i++;
  }
  return out.replace(/,(\s*[}\]])/g, '$1');
}
export const readConfig = path => JSON.parse(stripJsonc(readFileSync(path, 'utf8')));

/** Jurisdictions the apps cover, and their regulated sectors (Triodian Metamodel 2.5.0, reference-data/regulated-sectors.json).
    test-install.mjs checks this list against AI Board Direction's copy. A deployment starts in the jurisdiction and sector chosen
    here (DEFAULT_JURISDICTION, DEFAULT_SECTOR); each app lets people change both later. */
export const JURISDICTIONS = [['AU', 'Australia'], ['SG', 'Singapore']];
export const SECTORS = [
  { id: 'AU-BANKING', jurisdiction: 'AU', name: 'Banking', financiallyRegulated: true },
  { id: 'AU-INSURANCE', jurisdiction: 'AU', name: 'Insurance', financiallyRegulated: true },
  { id: 'AU-SUPERANNUATION', jurisdiction: 'AU', name: 'Superannuation', financiallyRegulated: true },
  { id: 'AU-FINANCIAL-SERVICES', jurisdiction: 'AU', name: 'Financial services and markets', financiallyRegulated: true },
  { id: 'AU-CREDIT', jurisdiction: 'AU', name: 'Credit', financiallyRegulated: true },
  { id: 'AU-PAYMENTS', jurisdiction: 'AU', name: 'Payments', financiallyRegulated: true },
  { id: 'AU-LISTED', jurisdiction: 'AU', name: 'Listed companies', financiallyRegulated: false },
  { id: 'AU-HEALTH', jurisdiction: 'AU', name: 'Health', financiallyRegulated: false },
  { id: 'AU-CRITICAL-INFRASTRUCTURE', jurisdiction: 'AU', name: 'Critical infrastructure', financiallyRegulated: false },
  { id: 'AU-DEFENCE', jurisdiction: 'AU', name: 'Defence industry', financiallyRegulated: false },
  { id: 'AU-GENERAL', jurisdiction: 'AU', name: 'Not financially regulated', financiallyRegulated: false },
  { id: 'SG-BANKING', jurisdiction: 'SG', name: 'Banking', financiallyRegulated: true },
  { id: 'SG-INSURANCE', jurisdiction: 'SG', name: 'Insurance', financiallyRegulated: true },
  { id: 'SG-CAPITAL-MARKETS', jurisdiction: 'SG', name: 'Capital markets', financiallyRegulated: true },
  { id: 'SG-PAYMENTS', jurisdiction: 'SG', name: 'Payments', financiallyRegulated: true },
  { id: 'SG-LISTED', jurisdiction: 'SG', name: 'Listed companies', financiallyRegulated: false },
  { id: 'SG-HEALTH', jurisdiction: 'SG', name: 'Health', financiallyRegulated: false },
  { id: 'SG-CRITICAL-INFRASTRUCTURE', jurisdiction: 'SG', name: 'Critical infrastructure', financiallyRegulated: false },
  { id: 'SG-DEFENCE', jurisdiction: 'SG', name: 'Defence industry', financiallyRegulated: false },
  { id: 'SG-GENERAL', jurisdiction: 'SG', name: 'Not financially regulated', financiallyRegulated: false },
];
