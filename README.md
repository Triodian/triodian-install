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

Needs Node 20 or later, git, and a Cloudflare API token with:

| Permission | Why |
| --- | --- |
| Account · D1 · Edit | the apps' databases and the shared identity database |
| Account · Workers Scripts · Edit | deploying the apps |
| Zone · Workers Routes · Edit, on the client's domain | each app's subdomain |
| Account · Access: Apps and Policies · Edit | email sign-in on each app's `/auth/email` |

```
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... node install.mjs
```

It asks for a short client code, whether the client is a **general company** (AI Board Direction and AI
Confidentiality Exposure Assessment) or a **regulated entity** (all four), the domain, the Zero Trust team domain and
the first administrator's email. It then:

1. fetches each app from GitHub;
2. creates each app's database and the shared identity database;
3. writes each app's configuration (`wrangler.<code>.json`, beside its `wrangler.jsonc`), with the demo off;
4. creates an Access application for each app's `/auth/email` and stores its tag on the Worker;
5. deploys, Risk Appetite first, because Use Assessment binds to it;
6. lists the addresses. The first administrator signs in and adds people in Admin.

`node install.mjs --dry-run` prints every step and writes the configurations without changing anything in Cloudflare.
`--answers file.json` takes the answers from a file.

## The suite test

With the app repos checked out beside this one and `npm ci` run in each app's `tests/e2e`:

```
node suite/run.mjs
```

It starts the four apps with `wrangler dev`, sharing one local identity database, and checks that signing in to one
app signs the person in to the others, that a person added in two apps is one record with roles per app, that Admin
shows each person's roles in the other apps, that Use Assessment reaches Risk Appetite through the service binding, and
that signing out of one app signs out of all. GitHub Actions runs it on every push here and once a day
(`.github/workflows/suite.yml`). While the app repos are private, the workflow needs a `SUITE_READ_TOKEN` secret in this
repo: a fine-grained token with read-only **Contents** access to the four app repos. Delete it once they are public.

The installer fetches the apps anonymously, so it needs the app repos to be public, or git credentials on the machine
that runs it.

## Contributing

Contributions are welcome: see [CONTRIBUTING.md](CONTRIBUTING.md) and the [code of conduct](CODE_OF_CONDUCT.md).
Report security problems privately, as [SECURITY.md](SECURITY.md) describes, not as issues.

## Licence

Open source under the [Apache License, Version 2.0](LICENSE). Copyright 2026 Triodian Pty Ltd. See [`NOTICE`](NOTICE).
