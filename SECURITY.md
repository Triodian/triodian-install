# Security policy

## Reporting a vulnerability

Please report security problems privately, through GitHub: open the **Security** tab of this repository and choose
**Report a vulnerability**. Do not open a public issue.

Include what you found, how to reproduce it, and what it could let someone do. We will acknowledge the report, keep you
informed while we fix it, and credit you when the fix is published, unless you would rather not be named.

## Supported versions

Only the latest `main` is supported. Deployments update from `main`.

## Scope

In scope: this repository's code and its default configuration. Out of scope: deployments run by others, denial of
service by volume, and findings that need an already compromised Cloudflare account or administrator.

Secrets are never kept in this repository. The installer reads the Cloudflare API token from the environment and
does not write it anywhere. The configurations it writes (`wrangler.<code>.json`) hold database ids, domains and the
Access team domain, which are not secrets, and stay on the machine that ran it.

## For a client's provider review

[docs/security-answers.md](docs/security-answers.md) answers the questions a regulated client's provider review
usually asks (for an APRA-regulated entity, under CPS 230 and CPS 234): what data the apps hold and where, encryption,
keys and secrets, access, logging, sub-processors, incidents and exit, with the open items listed.
