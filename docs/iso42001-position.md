# ISO/IEC 42001:2023 position statement

**As at 15 November 2026 · Triodian Pty Ltd (ABN 34 703 647 750), Brisbane**

Triodian does not hold an ISO/IEC 42001 certificate. This statement takes each clause of ISO/IEC 42001:2023 and each
control in its Annex A and says where Triodian stands on it today as the organisation that designs, develops and
publishes the Triodian Assessment Suite, so a client, a practitioner or a contributor can read it against their own review. It
sits beside the [ISO/IEC 27001:2022 Annex A control statement](iso27001-annex-a.md), the
[security answers](security-answers.md) and the [privacy notice](privacy.md).

**Summary.** Clauses 4 to 10: 2 in place, 5 partial. Annex A: 20 implemented, 16 partial, 2 not applicable, of 38.

**Scope.** Triodian as the maker of the apps: the design, development, testing, release and documentation of
AI Board Direction, AI Risk Appetite, AI Use Assessment, AI Confidentiality Exposure Assessment, the AI Obligations
Atlas, Triodian Start, the practice hub and the installer, and of the framework text, sector packs, baselines and Atlas
records they carry. It does not cover a client's own AI management system, or what a client does with the apps, and it
is not written from the standpoint of Triodian as a service provider administering a deployment (that is the
[security answers](security-answers.md)).

**What the AI systems are, in this scope.** The apps themselves embed no AI model: they record positions, enforce
role rules deterministically on the server and generate documents from recorded facts. ISO/IEC 42001 reaches Triodian
in three ways:

1. **AI used to build the apps.** Code, tests and documentation are produced with AI coding assistants working under
   a named person's direction, and reach `main` only through a pull request, a code owner's review and passing tests.
2. **The Atlas update agent.** An AI-assisted pipeline drafts obligation records from official text and submits them as
   proposals; a named reviewer approves every record before it is published.
3. **The apps as products about AI.** Their content states how an organisation may govern AI; its correctness and its
   limits (no legal conclusions, no recommendations on what a position should be) are Triodian's responsibility.

**How to read it.** *Implemented* or *In place* means it exists and can be shown, usually in a repository, its tests or
its published documents. *Partial* means part of it is in place, and the row says which part is not. *Not applicable*
gives the reason. Rows marked *To confirm* describe Triodian as a company rather than the repositories: they are
written from what is known and are waiting on confirmation by Triodian's director. Clause and control names are the
short titles of ISO/IEC 42001:2023; read the text in a licensed copy of the standard.

## Clauses 4 to 10: the management system

| Clause | Name | Status | Where Triodian stands |
| --- | --- | --- | --- |
| 4 | Context of the organization | Partial | The scope above and the interested parties (clients, practitioners, their counsel, regulators reading the outputs, contributors, the people whose names the apps hold) are stated here and in the security answers. Triodian's role as developer and provider of AI-related products is understood; a written context analysis for Triodian itself is not yet kept separately from this statement. |
| 5 | Leadership and AI policy | Partial | *To confirm.* Product principles are published on the website and enforced in the apps' language rules (no legal conclusions, no recommendations on positions, no product named). There is no signed AI policy for Triodian as a company, and no written assignment of AIMS roles beyond the code owners named in each repository. |
| 6 | Planning: risks, opportunities, impact assessment, objectives | Partial | Risks to the apps are tracked as risks in the development plan and closed with their mitigations. No AI risk assessment or AI system impact assessment has yet been run on Triodian's own use of AI in development or on the Atlas update agent. Objectives exist as the development plan's gates; they are not stated as AIMS objectives. |
| 7 | Support: resources, competence, awareness, communication, documented information | Partial | Documented information is strong: every method is a published framework, every exchange file a versioned schema, every change a reviewed pull request, and the documentation site is built from the repositories. *To confirm:* competence and awareness records for Triodian's own people, and the independent reviewer's, are not yet kept. |
| 8 | Operation | In place | Development, testing, release and content change run to a written and repeated process: test branch first, server and browser tests, golden copies of worked examples that may change by additions only, main protected, deployments tied to commits; content edited in content files and rebuilt; Atlas records proposed with sources and approved by a named reviewer. |
| 9 | Performance evaluation | Partial | CI runs on every change and the suite test runs the apps together; measures at close are reported for each engagement. No internal audit of the AIMS and no management review have yet been held. |
| 10 | Improvement | In place | Nonconformities are raised as issues or plan items, fixed through the same pull request and test path, and recorded; defects found in a worked example or by a client are added to the regression tests. |

## Annex A controls

### A.2 Policies related to AI

| Control | Name | Status | Where Triodian stands |
| --- | --- | --- | --- |
| A.2.2 | AI policy | Partial | *To confirm.* The apps' standing rules (positions are the client's, legal determinations are counsel's, Triodian states no view) and language rules are written in every framework and enforced in code. No signed AI policy for Triodian as a company covering its own use of AI tools. |
| A.2.3 | Alignment with other organizational policies | Partial | *To confirm.* The standing rules align with the privacy notice and the security statements. There are no other written company policies yet to align with. |
| A.2.4 | Review of the AI policy | Partial | Framework text carries a date and is re-checked each quarter with the instruments it cites; the Atlas research notes carry a checked date. No scheduled review of a company AI policy, because none exists yet. |

### A.3 Internal organization

| Control | Name | Status | Where Triodian stands |
| --- | --- | --- | --- |
| A.3.2 | AI roles and responsibilities | Partial | Code owners are named in each repository; the named Atlas reviewer approves records; the method owner signs the technical annex. *To confirm:* responsibilities for Triodian's own use of AI tools in development are not written down. |
| A.3.3 | Reporting of concerns | Implemented | Each repository has private vulnerability reporting and a SECURITY.md; issues and discussions are open on GitHub; a contested point inside an engagement is recorded and answered on the record. |

### A.4 Resources for AI systems

| Control | Name | Status | Where Triodian stands |
| --- | --- | --- | --- |
| A.4.2 | Resource documentation | Partial | The resources behind the apps (Cloudflare Workers and D1, GitHub, the Metamodel's reference data) are documented in the security answers and each README. The AI coding assistants used in development and the model behind the Atlas update agent are not yet listed as resources with their versions. |
| A.4.3 | Data resources | Implemented | The apps' content is reference data with schemas (baseline profiles, controls, regulated sectors, exchange formats) and framework text; Atlas records carry their sources. No training data exists, because no model is trained. |
| A.4.4 | Tooling resources | Partial | Build, test and content tools are in each repository and run in CI. The AI coding assistants are a tooling resource used under a person's direction; which are used, and on what terms, is *to confirm* and not yet documented. |
| A.4.5 | System and computing resources | Implemented | Each app's computing resources are declared in its `wrangler.jsonc` and created by the installer, so a deployment can be rebuilt and compared. |
| A.4.6 | Human resources | Partial | *To confirm.* The people who direct AI-assisted development, review pull requests and approve Atlas records are named per repository. Their competence for these roles is not recorded. |

### A.5 Assessing impacts of AI systems

| Control | Name | Status | Where Triodian stands |
| --- | --- | --- | --- |
| A.5.2 | AI system impact assessment process | Partial | The apps give clients an impact assessment process (AI Use Assessment's classification, consequence scale and findings). Triodian has not yet run an impact assessment on its own AI use: AI-assisted development and the Atlas update agent. |
| A.5.3 | Documentation of AI system impact assessments | Partial | Clients' assessments are documented by the apps with versions and evidence lines. There is no documented assessment of Triodian's own AI systems yet. |
| A.5.4 | Assessing AI system impact on individuals or groups of individuals | Partial | The apps are designed so that AI-assisted output cannot decide anything about an individual: every position is proposed and recorded by a named person, and directors' briefing answers are visible only to that director and the facilitator. The design reasoning is in the frameworks; a formal assessment of impact on individuals has not been written. |
| A.5.5 | Assessing societal impacts of AI systems | Partial | The suite's purpose, limits and standing rules are published. No written societal impact assessment. |

### A.6 AI system life cycle

| Control | Name | Status | Where Triodian stands |
| --- | --- | --- | --- |
| A.6.1.2 | Objectives for responsible development of AI system | Implemented | Stated in every framework and enforced in code: the apps state no legal conclusion, recommend no position, name no product, hold no customer or member data, and enforce separation of duties on the server. |
| A.6.1.3 | Processes for responsible design and development of AI systems | Implemented | Every change is a pull request with tests; wording lives in content files and is rebuilt; rules live in one shared file read by browser and server with a test for each permission; golden copies of worked examples may change by additions only; main is protected. The same process applies to AI-assisted and hand-written changes. |
| A.6.2.2 | AI system requirements and specification | Implemented | Each app is specified by its framework, its content file, its roles file and its exchange schemas; each task in the development plan carries a done-when. |
| A.6.2.3 | Documentation of AI system design and development | Implemented | Architecture notes, link set-up notes, the runbook, the frameworks and the exchange schemas are in the repositories and on the documentation site; pull requests record what changed and why. |
| A.6.2.4 | AI system verification and validation | Implemented | Server rule tests, browser tests, the suite test that runs the apps together, schema validation of every exchange file, and worked examples run end to end in CI. |
| A.6.2.5 | AI system deployment | Implemented | The installer creates a deployment from declared configuration with no secret typed; code reaches a Worker only from `main` or a named administrator's deploy; each app has a test deployment separate from live. |
| A.6.2.6 | AI system operation and monitoring | Partial | Status endpoints report each deployment's stage and open actions; Workers Logs record requests and errors. No alerting, and no monitoring of the AI coding assistants' output beyond review and tests. |
| A.6.2.7 | AI system technical documentation | Implemented | The documentation site publishes the frameworks, the mappings to external instruments, the reference data and each app's docs, built from the repositories so it cannot drift from the code. |
| A.6.2.8 | AI system recording of event logs | Implemented | Each app keeps an append-only engagement history and an audit log stamped by the server, including refused saves; every output names the version it came from. |

### A.7 Data for AI systems

| Control | Name | Status | Where Triodian stands |
| --- | --- | --- | --- |
| A.7.2 | Data for development and enhancement of AI system | Not applicable | Triodian trains no model. The apps are developed from framework text, reference data and tests, not from data sets. |
| A.7.3 | Acquisition of data | Implemented | Atlas records are drawn from the instruments' official text, each with its source; records resting on an announcement are held as leads until the text is available; worked examples use fictional organisations only. |
| A.7.4 | Quality of data for AI systems | Implemented | Reference data is validated against schemas in CI; Atlas proposals pass a dry run and a named reviewer; a record's tier follows a fixed rule (law in force is binding; guidance expected; proposals and not-yet-in-force instruments anticipated; chosen standards adopted). |
| A.7.5 | Data provenance | Implemented | Every Atlas record carries its sources, reviewer and approval; every exchange file its version; every output its evidence line and version. |
| A.7.6 | Data preparation | Not applicable | No data is prepared for training or inference. |

### A.8 Information for interested parties

| Control | Name | Status | Where Triodian stands |
| --- | --- | --- | --- |
| A.8.2 | System documentation and information for users | Implemented | User guides in each app, the documentation site, the worked examples, and the privacy notice. |
| A.8.3 | External reporting | Implemented | Private vulnerability reporting on every repository; the incident contact in the security answers; a contested point in an engagement answered on the record. |
| A.8.4 | Communication of incidents | Partial | The route exists (SECURITY.md, info@triodian.com). No written incident communication procedure or notice times; those belong in the client agreement and are *to confirm*. |
| A.8.5 | Information for interested parties | Implemented | Licensing and support terms, the standing rules, the limits of the apps (no legal advice, no recommendation on positions) and this statement are published. |

### A.9 Use of AI systems

| Control | Name | Status | Where Triodian stands |
| --- | --- | --- | --- |
| A.9.2 | Processes for responsible use of AI systems | Partial | For AI-assisted development: no code reaches `main` without a person's review and passing tests; for the Atlas agent: no record is published without a named reviewer. *To confirm:* written rules for Triodian's people on what may be given to an AI tool (client material, engagement records) do not yet exist. |
| A.9.3 | Objectives for responsible use of AI system | Partial | The objectives are practised (human direction, review, tests, named approval) and stated in this document; they are not yet set out as objectives with measures. |
| A.9.4 | Intended use of the AI system | Implemented | The apps' intended use and limits are stated in every framework, on the documentation site and on every output: they record and check positions; they do not decide, advise or recommend. |

### A.10 Third-party and customer relationships

| Control | Name | Status | Where Triodian stands |
| --- | --- | --- | --- |
| A.10.2 | Allocating responsibilities | Implemented | Each framework's roles table says who decides, who records, who reviews and where each party stops; in a client-run deployment the client's responsibilities are set out in the security answers and the privacy notice. |
| A.10.3 | Suppliers | Partial | Cloudflare and GitHub are named with their roles and data locations in the security answers. The providers of the AI coding assistants and of the model behind the Atlas agent are not yet listed as suppliers with their terms; *to confirm*. |
| A.10.4 | Customers | Implemented | What a client receives, what it must supply and what it owns are stated in the frameworks, the engagement plan output, the licensing terms and the privacy notice; the apps export every engagement as JSON in published formats so a client can leave. |

## What is not covered by an Annex A row

| Matter | Position |
| --- | --- |
| Certification | Triodian is not certified to ISO/IEC 42001 and makes no claim to be. Accredited certification bodies exist in Australia under the JAS-ANZ AI Management System Scheme. Any statement of intent to seek certification is made separately and dated. |
| Triodian's own use of the apps | Triodian can run AI Board Direction and AI Use Assessment on itself; doing so would produce the AI policy, risk and impact assessments and Statement of Applicability the partial rows above are missing. Not yet done. |
| The hardware and enforcement products | Outside this statement's scope. |

> This statement describes how Triodian makes the apps. It is not a certificate and is not an auditor's opinion.
> Whether the apps meet a client's obligations is for the client and its counsel.

Sources: [JAS-ANZ, AI Management System Scheme](https://www.jasanz.org/stories/artificial-intelligence-management-system-scheme).
