# Security answers for a client's provider review

**Draft for counsel's review · as at 13 November 2026 · Triodian Pty Ltd (ABN 34 703 647 750), Brisbane**

A regulated client that uses the Triodian AI governance apps will review Triodian as a service provider, under its
operational risk and information security obligations (for an APRA-regulated entity, CPS 230 and CPS 234). This page
answers the questions such a review usually asks, from what the code in these repositories does today. Where something
is not yet in place, it says so. Whether Triodian is a material service provider, and which obligations apply, is the
client's assessment.

Two pages sit beside this one: the [ISO/IEC 27001:2022 Annex A control statement](iso27001-annex-a.md), which lists
every Annex A control and where Triodian stands on it, and the [privacy notice for the apps](privacy.md).

## The short answers

| Question | Answer |
| --- | --- |
| What do the apps hold? | Engagement records: positions, classifications, findings, questions for counsel, and personal information about the people in the engagement: their names, work emails and roles, who made each change and, in AI Board Direction, directors' briefing answers. No member, customer or client personal information, and no source documents. See the [privacy notice](privacy.md). |
| Where is it held? | In Cloudflare D1 databases in the Cloudflare account the apps are installed in. |
| Is it encrypted? | Yes, by Cloudflare: AES-256 at rest and TLS in transit, with keys Cloudflare manages ([Cloudflare D1 data security](https://developers.cloudflare.com/d1/platform/data-security)). |
| Who can sign in? | Only people an administrator has added, after email verification through Cloudflare Access. What each person may change is enforced on the server by role. |
| Who runs it? | Either the client, in its own Cloudflare account, or Triodian on the client's behalf. Triodian administers client deployments for now (decided 8 November 2026). |
| Can the client leave? | Yes. The code is open source under Apache 2.0, the engagement exports as JSON, and the shared files are published formats. |

## 1. What Triodian provides

- **Facilitation:** Triodian's people run the method with the client's counsel, risk team and board. That is a
  professional service, separate from the software.
- **The apps:** AI Board Direction, AI Risk Appetite, AI Use Assessment and AI Confidentiality Exposure Assessment, plus
  the public AI Obligations Atlas. Each engagement app is a Cloudflare Worker with its own D1 database, and the apps
  share one identity database. The source is public at github.com/Triodian under the Apache License 2.0.
- **Two ways to run the apps:**
  - **Client-run:** the client installs the apps into its own Cloudflare account with `install.mjs`. Triodian has no
    access unless the client adds Triodian's people as users.
  - **Triodian-administered:** Triodian installs and administers the deployment for the client. Triodian's
    administrators can then reach the deployment's Cloudflare account and its data. This is the current model.

## 2. Data held, and data not held

**Held, in each app's database:**

- **The engagement:** the positions people record, classifications, findings, questions for counsel and their
  answers, sign-offs, and versions.
- **For AI Use Assessment, the register of AI arrangements:** the function, provider and platform names, authority
  and consequence classifications, evidence levels and findings. This is the most commercially sensitive content the
  apps hold.
- **People:** each person's name, organisation, work email and roles, in the shared identity database. This is
  personal information; the [privacy notice](privacy.md) lists it.
- **Directors' briefing answers (AI Board Direction):** each director's answers and the dates they read and completed
  the briefing, in a table of their own. Only the director, the board adviser and the facilitator see the answers.
- **An audit log** of user and role changes, saves and refused saves, and the last 200 saved versions of the
  engagement, used to merge two people's edits.
- **Email notifications** in an outbox table, with their status.
- **An optional practitioner logo:** a PNG of up to 100 KB, set in set-up.

**Not held:**

- No member, customer or client personal information. The method works from the client's own documents about
  its AI arrangements, and the apps record conclusions about those arrangements, not the documents.
- No source documents. Files a user loads, such as a matter brief, a calibration set or a board directions file, are
  read in the browser, and only the fields the app keeps are saved.
- No deal content in the Confidentiality Exposure Assessment. It records channels and protections, not the matter's
  information.
- The Atlas matter brief and client portfolio stay in the lawyer's browser and are never sent to a server.

## 3. Where data is stored

- **The databases:** Cloudflare D1, in the Cloudflare account the apps are installed in. The workers run on
  Cloudflare's network.
- **Location:** D1 places a new database near where the creation request came from, unless given a location hint. A
  hint such as `oc` (Oceania) is a preference, not a guarantee. D1 can be restricted by jurisdiction only to the
  European Union, FedRAMP data centres or the United States; there is no Australian jurisdiction
  ([Cloudflare D1 data location](https://developers.cloudflare.com/d1/configuration/data-location/)).
- **Gap:** `install.mjs` does not yet pass a location hint. Until it does, a database created from Australia will
  usually be placed nearby, but this is not assured. Confirm the location in the Cloudflare dashboard after
  installation.
- **Offshoring:** if the client needs data held in Australia as a condition, that has to be agreed and checked before
  installation. For an APRA-regulated entity, holding data offshore can also carry a notification duty.

## 4. Encryption, keys and secrets

- **Encryption:** D1 encrypts all data at rest with AES-256 (GCM), and all traffic between the Worker, Cloudflare's
  network and D1 uses TLS. Cloudflare manages the keys.
- **Secrets in each Worker:**
  - `ACCESS_AUD`: the Cloudflare Access audience tag, used to check sign-in tokens. It cannot be used to create a
    sign-in.
  - Demo sign-in settings: present only on Triodian's demo sites, and empty on a client deployment.
- **No secrets link the apps:** the apps reach each other through Cloudflare service bindings, so no secret or token
  is created for that.
- **No secrets in the source:** the repositories hold no secrets. GitHub secret scanning and push protection are on,
  and the full git history was scanned before the repositories were made public.
- **The installer's API token:** `install.mjs` needs a Cloudflare API token that can create databases, deploy Workers
  and set up Access. Whoever installs holds it; it is not stored in the apps. Revoke it after installation, or keep it
  under the client's own key management.

## 5. Access and identity

- **Sign-in:** Cloudflare Access sends a one-time PIN to the person's email address. Access protects only the sign-in
  step (`/auth/email`); the app then issues its own session.
- **Sessions:** a session cookie lasting 12 hours, marked `HttpOnly`, `Secure` and `SameSite=Lax`. Signing in to one
  app signs the person in to the others on the same domain, and signing out of one signs out of all.
- **Who may use an app:** only active users an administrator has added. Anyone else who signs in is listed as waiting
  for access.
- **What they may change:** decided by their role in the engagement and checked on the server for every save. A save
  that changes anything outside the person's role is refused and logged.
- **Separation of duties:** built into the method. For example, the chair alone records the board's resolution,
  counsel alone answers counsel questions, and a peer reviewer cannot review their own classification.
- **Gap:** single sign-on with the client's identity provider (such as Microsoft Entra ID) is not yet built.

## 6. Logging and monitoring

- **The audit log:** each app keeps an audit log in its own database. The engagement history is append-only, and the
  server stamps each entry with the person's name and role.
- **Cloudflare's logs:** Workers Logs are on, so Cloudflare keeps request logs and error messages for the deployment's
  account.
- **Gap:** there is no export of the audit log to the client's SIEM yet.

## 7. Sub-processors and third parties

- **Cloudflare:** Workers, D1, Access, Email Service and Workers Logs. Cloudflare's own certifications are listed in
  its Trust Hub.
- **Email:** notifications go through Cloudflare Email Service. On a client deployment they are off until the client
  sets a sending address.
- **GitHub:** holds the source code only, never client data.
- **No third-party scripts:** the apps load no scripts or fonts from other sites. The fonts are served by the app
  itself.

## 8. Security testing and change control

- **Tests:** every change goes through a pull request, a code owner's review and automated tests: the server's rule
  tests and browser tests for each app, and a suite test that runs the apps together. Nothing reaches `main` without
  them.
- **Dependencies:** Dependabot raises security updates for them.
- **Headers:** responses carry `X-Content-Type-Options`, `X-Frame-Options: DENY` and a strict `Referrer-Policy`.
- **Gaps:** no Content-Security-Policy header yet, no independent penetration test, and no SOC 2 or ISO/IEC 27001
  certification of Triodian itself. The [Annex A control statement](iso27001-annex-a.md) says where each control
  stands.
- **A client's own penetration test:** a client may test the apps itself. Triodian offers three things for it:
  - **A target:** a test deployment made by `install.mjs`, with fictional data, separate from any engagement.
  - **A written scope:** the hosts, the roles and test accounts provided, what is out of scope (Cloudflare's own
    platform, under Cloudflare's testing policy), and the dates.
  - **A remediation window:** time agreed in advance to fix what the test finds, and a re-test, before the engagement
    opens.

## 9. Vulnerabilities and incidents

- **Vulnerabilities:** report them privately through GitHub's private vulnerability reporting on the affected
  repository, as each repository's SECURITY.md describes.
- **Incidents affecting a client deployment:** info@triodian.com. The time within which Triodian notifies the client
  of an incident, and what the notice contains, belong in the agreement.

## 10. Continuity, exit and substitution

- **The code:** open source under Apache 2.0, so the client can run, inspect and change it without Triodian.
- **The data:** each engagement exports as a JSON file. The files the apps share are published as versioned JSON
  Schemas in Triodian_Metamodel (`exchange/`), so another tool can read them.
- **Moving off Cloudflare:** the apps are built so the same code can run on AWS or Azure for one organisation. Only the
  entry point, identity and storage adapters change (`risk_appetite/docs/architecture.md`).
- **Gap:** backups and point-in-time restore have not yet been set and tested for client deployments. The architecture
  notes list this, with data residency, as work before an enterprise go-live.

## 11. Open items before a regulated client relies on the apps

| Item | Status |
| --- | --- |
| Location hint (`oc`) in `install.mjs`, and a check of each database's location after installation | Not started |
| Content-Security-Policy header on every app | Not started |
| Single sign-on with the client's identity provider | Not started |
| Backups and point-in-time restore for client deployments, with a tested restore | Not started |
| Audit log export to the client's SIEM | Not started |
| Independent penetration test | Not started by Triodian. A client may run its own against a test deployment, with a written scope and a remediation window (section 8) |
| ISO/IEC 27001 certification | Not held. An Annex A control statement is published; rows about Triodian as a company are waiting on confirmation |
| Privacy notice for the apps | Drafted (`privacy.md`); for counsel |
| Agreement terms: incident notice, audit and access rights, sub-contractors, data location, exit | For counsel |
| Counsel's review of this page | Waiting |

> These answers describe the software and how it is run. They are not legal advice and do not say whether any
> obligation is met; that is for the client and its counsel.
