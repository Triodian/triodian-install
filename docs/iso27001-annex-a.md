# ISO/IEC 27001:2022 Annex A control statement

**Draft · as at 13 November 2026 · Triodian Pty Ltd (ABN 34 703 647 750), Brisbane**

Triodian does not hold an ISO/IEC 27001 certificate. This statement lists every control in Annex A of ISO/IEC 27001:2022
and says where Triodian stands on it today, so a client can read it against its own supplier review. It sits beside the
[security answers](security-answers.md) and the [privacy notice](privacy.md).

**Summary.** 24 implemented, 54 partial, 15 not applicable, of 93.

**Scope.** The Triodian app suite as software, and a deployment Triodian administers for a client. In a client-run
deployment the client’s own controls apply to its Cloudflare account, its people and its devices.

**How to read it.** *Implemented* means the control is in place and can be shown, usually in the code or its tests.
*Partial* means part of it is in place, and the row says which part is not. *Not applicable* gives the reason.
Rows marked *To confirm* describe Triodian as a company, not the software: they are written from what is known and are
waiting on confirmation by Triodian’s director before this statement is given to a client. Control names are the short
titles of ISO/IEC 27001:2022 Annex A; read the control text in a licensed copy of the standard.


## 5 Organizational controls

| Control | Name | Status | Where Triodian stands |
| --- | --- | --- | --- |
| 5.1 | Policies for information security | Partial | *To confirm.* Each repository has a SECURITY.md and this pack states how the apps are built and run. There is no single written information security policy approved by management yet. |
| 5.2 | Information security roles and responsibilities | Partial | *To confirm.* Code owners are named in each repository and deployment administrators are named per client. Security roles for Triodian as a company are not yet written down. |
| 5.3 | Segregation of duties | Implemented | In the apps, separation of duties is enforced by person on the server (a reviewer cannot review their own work; only counsel answers counsel questions). In development, a change needs a pull request and a code owner’s review before it reaches `main`. |
| 5.4 | Management responsibilities | Partial | *To confirm.* Management directs the security work through the development plan. No signed statement of management responsibilities yet. |
| 5.5 | Contact with authorities | Partial | *To confirm.* Incident contact is info@triodian.com. Contacts with regulators and authorities for a client deployment are set in the client agreement. |
| 5.6 | Contact with special interest groups | Partial | *To confirm.* GitHub security advisories and Cloudflare notices are followed. No membership of a security forum is recorded. |
| 5.7 | Threat intelligence | Partial | Dependabot security updates and GitHub secret scanning are on for every repository. No wider threat intelligence process. |
| 5.8 | Information security in project management | Partial | Security items are tasks in the development plan and are tested like any other change. No separate project security procedure. |
| 5.9 | Inventory of information and other associated assets | Partial | The repositories, Workers and databases of a deployment are listed by the installer and the practice hub. No asset register for Triodian’s own devices and accounts yet. |
| 5.10 | Acceptable use of information and other associated assets | Partial | *To confirm.* No written acceptable-use rules for Triodian’s people yet. |
| 5.11 | Return of assets | Partial | *To confirm.* Access to a client deployment is removed in Admin and in the Cloudflare account when a person leaves an engagement. No written leaver procedure. |
| 5.12 | Classification of information | Partial | The apps carry the engagement’s privilege marking on every screen and output. Triodian has no classification scheme of its own for its internal information. |
| 5.13 | Labelling of information | Partial | Every output is labelled with the privilege marking, its status and its version. Internal Triodian documents are not labelled to a scheme. |
| 5.14 | Information transfer | Partial | All transfer is over TLS. Files leave an app only when a user exports them. No written rule on how exports are sent between people. |
| 5.15 | Access control | Implemented | Only active users an administrator has added can use an app; every save is checked against the person’s role on the server, and a refused save is logged. |
| 5.16 | Identity management | Implemented | One identity record per person in the shared identity database; an administrator adds, changes and deactivates users; changes are in the audit log. |
| 5.17 | Authentication information | Implemented | No passwords on a client deployment: sign-in is a one-time code sent by Cloudflare Access to the person’s email. Sessions last 12 hours. |
| 5.18 | Access rights | Implemented | Roles are given per engagement by an administrator and can be removed at any time; the audit log records each change. |
| 5.19 | Information security in supplier relationships | Partial | Suppliers are named in section 7 (Cloudflare, GitHub). No written supplier security procedure. |
| 5.20 | Addressing information security within supplier agreements | Partial | *To confirm.* Cloudflare and GitHub are used on their standard terms. Terms with clients are for counsel (section 11). |
| 5.21 | Managing information security in the ICT supply chain | Partial | Dependencies are few, pinned and watched by Dependabot; the apps load no third-party scripts or fonts. No software bill of materials is published. |
| 5.22 | Monitoring, review and change management of supplier services | Partial | *To confirm.* Cloudflare and GitHub status and changes are followed informally. No recorded supplier review. |
| 5.23 | Information security for use of cloud services | Partial | The use of Cloudflare is described in sections 3 to 7, including the data-location limits. No written cloud exit test yet; the code is built to move (section 10). |
| 5.24 | Information security incident management planning and preparation | Partial | Vulnerabilities are reported privately through GitHub; incidents go to info@triodian.com. No written incident response plan yet. |
| 5.25 | Assessment and decision on information security events | Partial | *To confirm.* Events are assessed by the code owner. No written criteria. |
| 5.26 | Response to information security incidents | Partial | *To confirm.* No written response procedure; notice times belong in the client agreement. |
| 5.27 | Learning from information security incidents | Partial | *To confirm.* Fixes go through the same pull request and test path. No post-incident review record yet (no incident has been recorded). |
| 5.28 | Collection of evidence | Partial | The audit log and engagement history are append-only and stamped by the server. No procedure for preserving evidence outside the apps. |
| 5.29 | Information security during disruption | Partial | The code is open source and each engagement exports as JSON, so work can continue elsewhere. No written continuity plan for Triodian itself. |
| 5.30 | ICT readiness for business continuity | Partial | Workers and D1 run on Cloudflare’s network. Backups and point-in-time restore are not yet set and tested for client deployments (section 10). |
| 5.31 | Legal, statutory, regulatory and contractual requirements | Partial | Each client’s obligations are for the client and its counsel. Triodian’s own obligations (privacy, contract) are with counsel for review. |
| 5.32 | Intellectual property rights | Implemented | All code is under the Apache License 2.0 with a NOTICE file; third-party licences are kept with the code; the Triodian name and logo are trademarks. |
| 5.33 | Protection of records | Partial | Engagement records are versioned and kept in the database; retention and disposal are set per engagement (development plan task ISO.9). No Triodian records schedule yet. |
| 5.34 | Privacy and protection of PII | Partial | The apps hold names, work emails, roles and, in AI Board Direction, directors’ briefing answers; see `docs/privacy.md`. No member, customer or client personal information is held. Counsel’s review of the notice is pending. |
| 5.35 | Independent review of information security | Partial | No independent review yet. A client may run its own penetration test against a test deployment (section 8). |
| 5.36 | Compliance with policies, rules and standards for information security | Partial | *To confirm.* The automated tests check the apps against their own rules on every change. No compliance review of Triodian’s own practices. |
| 5.37 | Documented operating procedures | Implemented | Installation, upgrade, archive and destroy are documented in this repository and were followed end to end (development plan task 4.4). |

## 6 People controls

| Control | Name | Status | Where Triodian stands |
| --- | --- | --- | --- |
| 6.1 | Screening | Partial | *To confirm.* No written screening procedure. |
| 6.2 | Terms and conditions of employment | Partial | *To confirm.* Confidentiality is a term of engagement for Triodian’s people; not checked for this statement. |
| 6.3 | Information security awareness, education and training | Partial | *To confirm.* No recorded security training. |
| 6.4 | Disciplinary process | Partial | *To confirm.* No written disciplinary process for security breaches. |
| 6.5 | Responsibilities after termination or change of employment | Partial | *To confirm.* Access is removed when a person leaves; no written procedure. |
| 6.6 | Confidentiality or non-disclosure agreements | Partial | *To confirm.* Confidentiality agreements with clients and partners are for counsel; not checked for this statement. |
| 6.7 | Remote working | Partial | *To confirm.* Triodian’s people work remotely. No written remote-working rules. |
| 6.8 | Information security event reporting | Implemented | Each repository’s SECURITY.md gives the private reporting route; incidents on a client deployment go to info@triodian.com. |

## 7 Physical controls

| Control | Name | Status | Where Triodian stands |
| --- | --- | --- | --- |
| 7.1 | Physical security perimeters | Not applicable | Triodian keeps no premises or equipment that hold client data. The data is in Cloudflare’s data centres, covered by Cloudflare’s own certifications. |
| 7.2 | Physical entry | Not applicable | As 7.1. |
| 7.3 | Securing offices, rooms and facilities | Not applicable | As 7.1. |
| 7.4 | Physical security monitoring | Not applicable | As 7.1. |
| 7.5 | Protecting against physical and environmental threats | Not applicable | As 7.1. |
| 7.6 | Working in secure areas | Not applicable | As 7.1. |
| 7.7 | Clear desk and clear screen | Partial | *To confirm.* No written clear-desk and clear-screen rule for Triodian’s people. |
| 7.8 | Equipment siting and protection | Not applicable | As 7.1. |
| 7.9 | Security of assets off-premises | Partial | *To confirm.* Administrators’ laptops can reach a Triodian-administered deployment. No written device rules. |
| 7.10 | Storage media | Partial | *To confirm.* Client data is not kept on removable media by design; no written rule. |
| 7.11 | Supporting utilities | Not applicable | As 7.1. |
| 7.12 | Cabling security | Not applicable | As 7.1. |
| 7.13 | Equipment maintenance | Not applicable | As 7.1. |
| 7.14 | Secure disposal or re-use of equipment | Partial | *To confirm.* No written disposal procedure for Triodian’s devices. |

## 8 Technological controls

| Control | Name | Status | Where Triodian stands |
| --- | --- | --- | --- |
| 8.1 | User endpoint devices | Partial | *To confirm.* No written standard for administrators’ devices (disk encryption, screen lock, updates). |
| 8.2 | Privileged access rights | Partial | Administrator rights in an app are given by name and logged. Cloudflare account access for a Triodian-administered deployment is held by named administrators; multi-factor sign-in to Cloudflare and GitHub is to confirm. |
| 8.3 | Information access restriction | Implemented | Each role sees and changes only what the method gives it; the server enforces this on every request. |
| 8.4 | Access to source code | Implemented | The source is public by design. Changes need a pull request, a code owner’s review and passing tests; `main` is protected. |
| 8.5 | Secure authentication | Implemented | Email one-time code through Cloudflare Access, then an `HttpOnly`, `Secure`, `SameSite=Lax` session. Single sign-on with the client’s identity provider is not yet built (section 5). |
| 8.6 | Capacity management | Not applicable | Capacity is managed by Cloudflare’s platform. |
| 8.7 | Protection against malware | Partial | *To confirm.* No written malware protection standard for administrators’ devices. The apps accept no file uploads other than a small PNG logo and JSON or CSV read in the browser. |
| 8.8 | Management of technical vulnerabilities | Partial | Dependabot, secret scanning with push protection, and private vulnerability reporting. No independent penetration test yet. |
| 8.9 | Configuration management | Implemented | Each Worker’s configuration is in its repository (`wrangler.jsonc`) and a deployment is created by the installer, so it can be rebuilt and compared. |
| 8.10 | Information deletion | Partial | The runbook archives and destroys a client deployment. Retention period and disposition per engagement are recorded in set-up (development plan task ISO.9). |
| 8.11 | Data masking | Not applicable | The apps hold no member, customer or client personal information to mask. Worked examples use fictional data. |
| 8.12 | Data leakage prevention | Partial | The apps hold conclusions about AI arrangements, not the client’s documents or data, but AI Use Assessment’s register is commercially sensitive. Exports are made by a named user and logged. Nothing limits what an export is used for once it leaves the app. |
| 8.13 | Information backup | Partial | Not yet set and tested for client deployments (section 10). |
| 8.14 | Redundancy of information processing facilities | Implemented | Provided by Cloudflare’s network for Workers and D1. |
| 8.15 | Logging | Partial | Audit log and append-only engagement history in each app; Cloudflare Workers Logs. No export to the client’s SIEM yet. |
| 8.16 | Monitoring activities | Partial | Workers Logs record requests and errors. No alerting on them yet. |
| 8.17 | Clock synchronization | Implemented | Timestamps are set by the server on Cloudflare’s platform. |
| 8.18 | Use of privileged utility programs | Not applicable | There are no privileged utility programs on the platform. |
| 8.19 | Installation of software on operational systems | Implemented | Code reaches a Worker only through Workers Builds from `main` or a named administrator’s deploy. |
| 8.20 | Networks security | Implemented | Provided by Cloudflare’s network; the apps expose only HTTPS. |
| 8.21 | Security of network services | Implemented | As 8.20. |
| 8.22 | Segregation of networks | Implemented | Each app is its own Worker with its own database; apps reach each other only through service bindings. |
| 8.23 | Web filtering | Not applicable | The apps make no outbound web requests on a user’s behalf. |
| 8.24 | Use of cryptography | Implemented | AES-256 at rest and TLS in transit, with keys Cloudflare manages (section 4). |
| 8.25 | Secure development life cycle | Implemented | Pull request, code owner’s review, automated server and browser tests, and a suite test, on every change. |
| 8.26 | Application security requirements | Partial | Security rules (roles, refusals, structure checks) are written as tests. No separate written security requirements. |
| 8.27 | Secure system architecture and engineering principles | Implemented | `risk_appetite/docs/architecture.md` sets out the design: server-side rule checks, no secrets between apps, adapters for identity and storage. |
| 8.28 | Secure coding | Partial | Output is escaped, saves are validated against a structure, and headers are set. No Content-Security-Policy header yet (section 8). |
| 8.29 | Security testing in development and acceptance | Partial | Automated tests include refused-save and access tests. No independent penetration test yet. |
| 8.30 | Outsourced development | Not applicable | *To confirm.* No development is outsourced. |
| 8.31 | Separation of development, test and production environments | Implemented | Tests run against a local database; each app has a separate test Worker and database from the live one. |
| 8.32 | Change management | Implemented | Every change is a reviewed pull request with its tests; deployments are tied to commits. |
| 8.33 | Test information | Implemented | Tests and worked examples use fictional organisations and people only. |
| 8.34 | Protection of information systems during audit testing | Partial | A client’s penetration test runs against a test deployment made by the installer, under a written scope (section 8). |

> This statement describes the software and how Triodian runs it. It is not a certificate and is not an auditor’s
> opinion. Whether it meets a client’s obligations is for the client and its counsel.
