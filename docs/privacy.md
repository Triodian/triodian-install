# Privacy notice for the Triodian apps

**Draft for counsel's review · as at 13 November 2026 · Triodian Pty Ltd (ABN 34 703 647 750), Brisbane**

This notice covers the Triodian apps: AI Board Direction, AI Risk Appetite, AI Use Assessment, AI Confidentiality
Exposure Assessment, Triodian Start and the AI Obligations Atlas. The Triodian website has its own notice at
[triodian.com/privacy](https://triodian.com/privacy).

## In short

- The apps hold **no member, customer or client personal information**. They record conclusions about an organisation's
  AI arrangements, not the organisation's data or documents.
- The apps **do hold personal information about the people who take part in an engagement**: their name, organisation,
  work email and roles, and a record of what each person did.
- AI Board Direction also holds each director's **briefing answers** and the dates they read and completed the briefing.

## Who is responsible

| How the apps are run | Who decides what is held and why | Triodian's part |
| --- | --- | --- |
| **Client-run:** the client installs the apps in its own Cloudflare account | The client. Its own privacy notice applies to its people | None, unless the client adds Triodian's people as users |
| **Triodian-administered:** Triodian runs a deployment for one client | The client, for its engagement | Triodian holds the information on the client's behalf and can reach it as administrator |
| **Triodian's own sites:** Triodian Start, the demo sites and the Atlas | Triodian | Triodian |

## What is held

| Information | Where | Why | Who can see it |
| --- | --- | --- | --- |
| Name, organisation, work email, roles, whether the account is active | The shared identity database of the deployment | To sign you in and to apply the rules for your role | Administrators of the deployment; other people in the engagement see your name, organisation and roles |
| Your name and role against each change you save, each sign-off, and each refused save | Each app's engagement history and audit log | So the record shows who decided, proposed, reviewed and approved what | People with a role in the engagement, as the method allows; administrators |
| The last 200 saved versions of the engagement | Each app's database | To merge two people's edits and to show versions | As the engagement |
| Directors' briefing answers, and the dates each director read and completed the briefing | AI Board Direction, in a table of its own | So a director can return to the briefing, and so the education record can show dates | Answers: the director, the board adviser and Triodian's facilitator. Dates: the people who see the education record. The chair, other directors and the GC do not see another director's answers |
| Notification emails and whether each was sent | Each app's outbox table | To tell you an action is waiting for you | Administrators |
| Your sign-up answers (your role, the kind and size of organisation, where it is, what prompted you), your team, and whether you asked for marketing email | Triodian Start | To show the engagements that fit and to set one up if you ask | You, the people you name to your team, and Triodian's administrators |
| An optional practitioner logo | The engagement | To show the practitioner's name on outputs | As the engagement |

Signing in sends a one-time code to your email address through Cloudflare Access. On Triodian Start you may instead
sign in with Google or GitHub; Triodian then receives your email address from that provider and nothing else.

The apps set a session cookie when you sign in. They load no third-party scripts, fonts, analytics or advertising.

## What is not held

- No member, customer, policyholder or client personal information.
- No source documents. A file you load, such as a matter brief or a register, is read in your browser, and only the
  fields the app keeps are saved.
- In the AI Obligations Atlas, a matter brief and a client portfolio stay in your browser and are never sent to a server.
- The worked examples use fictional organisations and people. Nothing you do in one is saved.

## Where it is held

In Cloudflare D1 databases in the Cloudflare account the apps are installed in, encrypted at rest and in transit.
Cloudflare places each database, near where it was created unless a location hint is given, and a hint is a preference only; there is no setting that keeps it in Australia. The [security answers](security-answers.md)
say more, including what is not yet in place.

## How long it is kept

For as long as the engagement is kept. The retention period, the place of storage and what happens at the end are
recorded for each engagement in set-up and printed on the technical annex. When a deployment is destroyed, its
databases are deleted. Triodian Start keeps a sign-up until you ask for it to be removed.

## Marketing email

Only if you tick the box in Triodian Start. You can untick it there at any time.

## Your requests

To see, correct or remove what an app holds about you:

- in a client's deployment, ask the client's administrator, or the person who invited you;
- on Triodian's own sites, write to info@triodian.com.

If you are not satisfied with Triodian's answer, you may complain to the Office of the Australian Information
Commissioner.

> This notice describes what the software holds. It is a draft for counsel's review and is not legal advice.
