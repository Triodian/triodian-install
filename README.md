# Triodian installer and suite test

[![Suite test](https://github.com/Triodian/triodian-install/actions/workflows/suite.yml/badge.svg)](https://github.com/Triodian/triodian-install/actions/workflows/suite.yml) [![Licence: Apache 2.0](https://img.shields.io/badge/licence-Apache%202.0-blue.svg)](LICENSE)

Two things for the four Triodian AI governance engagement apps (AI Risk Appetite, AI Use Assessment, AI Confidentiality
Exposure Assessment and AI Board Direction):

- **`install.mjs`**: a guided installer that puts the apps a client needs into a Cloudflare account (development plan
  task 1B.6).
- **`suite/run.mjs`**: the suite test, which runs the apps together on one machine and checks they work as one suite
  (task 1B.7).

The apps stay separate, each with its own repo, Worker and engagement database. They share one identity database, so
a person is added once and signs in once, and they reach each other through Cloudflare service bindings, so no
secret is created to link them.

## Installing for a client

Needs Node 20 or later, git, a Cloudflare account with Zero Trust set up (the free plan is enough), and a Cloudflare
API token with:

| Permission | Why |
| --- | --- |
| Account · D1 · Edit | the apps' databases and the shared identity database |
| Account · Workers Scripts · Edit | deploying the apps |
| Zone · Workers Routes · Edit, on the client's domain | each app's subdomain |
| Account · Access: Apps and Policies · Edit | email sign-in on each app's `/auth/email` |

```
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... node install.mjs
```

It asks for a short client code, the client's **jurisdiction** (Australia or Singapore) and **regulated sector** (for
example banking, insurance, superannuation, health or critical infrastructure, or none), whether the client is a
**general company** (AI Board Direction and AI Confidentiality Exposure Assessment) or a **regulated entity** (all four;
the default when the sector is financially regulated), the domain, the Zero Trust team domain and the first
administrator's email. The jurisdiction and regulated sector are where each app starts (`DEFAULT_JURISDICTION`,
`DEFAULT_SECTOR`); people change both in the apps at any time. The sectors are the Triodian Metamodel's list. It then:

1. fetches each app from GitHub;
2. creates each app's database and the shared identity database;
3. writes each app's configuration (`wrangler.<code>.json`, beside its `wrangler.jsonc`), with the demo off;
4. creates an Access application for each app's `/auth/email` and stores its tag on the Worker;
5. deploys, Risk Appetite first, because Use Assessment binds to it;
6. lists the addresses. The first administrator signs in and adds people in Admin.

`node install.mjs --dry-run` prints every step and writes the configurations without changing anything in Cloudflare.
`--answers file.json` takes the answers from a file, for example:

```json
{ "code": "acme", "jurisdiction": "AU", "sector": "AU-SUPERANNUATION", "profile": "regulated",
  "domain": "acme.com.au", "teamDomain": "acme.cloudflareaccess.com", "firstAdmins": ["gc@acme.com.au"], "dir": "./triodian-acme" }
```

`sector` is one of the ids in `lib-config.mjs`, or empty.

## Security answers for a client's review

A regulated client will review Triodian as a service provider. [docs/security-answers.md](docs/security-answers.md)
answers the usual questions from what the code does today, and lists what is not yet in place (a location hint for
the databases, a Content-Security-Policy, single sign-on, tested backups, a penetration test).

## The suite test

With the app repos checked out beside this one and `npm ci` run in each app's `tests/e2e`:

```
node suite/run.mjs
```

It starts the four apps with `wrangler dev`, sharing one local identity database, and checks that signing in to one
app signs the person in to the others, that a person added in two apps is one record with roles per app, that Admin
shows each person's roles in the other apps, that Use Assessment reaches Risk Appetite through the service binding, and
that signing out of one app signs out of all. GitHub Actions runs it on every push here and once a day
(`.github/workflows/suite.yml`), against `main` of each app; run it by hand with a branch name to test a change across
the apps before it merges. It needs no secrets: the app repos are public.

## The regulated chain (gates G2 and G-ART)

`suite/chain` runs one regulated worked example through AI Board Direction, AI Risk Appetite and AI Use Assessment, with
their real service bindings: Coastline Super, a fictional superannuation trustee. The chair records the board
directions; Risk Appetite loads them, shows them on decision 1 and holds back a ceiling above them (K11); the CRO agrees
and the board approves the appetite; Use Assessment imports Coastline's own provider register (`suite/chain/fixtures`,
refusing two malformed rows), runs in Lite scope over the six arrangements behind critical operations, loads the
calibration set and issues the in-use feed; Risk Appetite loads the feed on decision 8; the chair takes the board view,
which must match the approved calibration set; and Board Direction gathers the APRA letter evidence index, where Use
Assessment's artefacts say they cover the Lite scope. Set `CHAIN_OUT` to a folder to keep the index as Markdown. Every file that crosses a link is checked against its published schema in Triodian_Metamodel `exchange/` (checked out beside the apps).

Each app runs in its own `wrangler dev` session; Wrangler's local dev registry connects their bindings as Cloudflare
does. No secrets and no Cloudflare account. With the app repos checked out beside this one:

```
cd suite/chain && npm ci && npx playwright test
```

The suite workflow runs it after the suite test.

## Contributing

Contributions are welcome: see [CONTRIBUTING.md](CONTRIBUTING.md) and the [code of conduct](CODE_OF_CONDUCT.md).
Report security problems privately, as [SECURITY.md](SECURITY.md) describes, not as issues.

## Licence

Open source under the [Apache License, Version 2.0](LICENSE). Copyright 2026 Triodian Pty Ltd. See [`NOTICE`](NOTICE).
