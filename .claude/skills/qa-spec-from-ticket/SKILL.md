---
name: ck:qa-spec-from-ticket
description: "Scaffold Phase 1 (Spec) of the org QA process from a ticket/PRD/spec draft the requester already provided: spec-overview, spec.md, checklist, test-strategy. Use at the start of a new feature/ticket, before test design."
user-invocable: true
when_to_use: "Invoke when a PM/stakeholder has already given you a ticket, PRD, or spec draft to formalize into the org's Phase 1 QA docs — before ck:qa-test-design."
category: utilities
keywords: [qa, spec, ticket, prd, confirm-clear-checklist, test-strategy, phase1]
argument-hint: "<ticket/PRD path or feature name>"
metadata:
  author: org
  version: "1.0.0"
---

# ck:qa-spec-from-ticket — Phase 1: Spec (from a provided ticket/PRD/draft)

Produces the required Phase 1 outputs defined in `docs/qa/QA_TEST_PROCESS_GUIDE.md` (process: §2): `spec-overview.md`, `spec.md`, `confirm-clear-checklist.md`, `test-strategy.md`. Canonical blank templates live in this skill's `assets/` — copy from there, don't re-derive structure from the guide's illustrative examples. If the target repo doesn't have `docs/qa/QA_TEST_PROCESS_GUIDE.md` yet, fall back to this file's own rules below and tell the user the guide is missing — don't silently invent process rules to fill the gap.

**Companion skill:** if there is no ticket/PRD/draft — you're speccing a change that already exists only as code (a diff, a merged PR, an undocumented feature) — use `ck:qa-spec-from-code` instead. That path reconstructs requirements from source and needs different guardrails against leaking implementation detail into the spec.

**Does NOT** run `/ck:scenario`, build `tc-matrix.md`, or run tests — that's `ck:qa-test-design` and `/ck:test`. **Does NOT** assign final P0-P3 priority on FR/AC rows with confidence — priority is a PM call; mark tentative priorities clearly and leave the Approval/PM row unresolved until PM signs off.

## Source of truth

The provided ticket/PRD/draft is authoritative for Goal, User Stories, Scope, Main Flow, Requirements (FR), Business/Validation Rules, and Acceptance Criteria — these sections should trace back to what the requester wrote, not to what you find by reading the application's source code. Reading the codebase is still expected, but scoped to two things: (1) filling **Technical Notes** and the **confirm-clear-checklist** with real evidence of current system behavior (auth model, RBAC, rate limit, etc.), and (2) sanity-checking that the draft's requirements are actually feasible/consistent with the existing system. If the draft is silent, vague, or contradicts what the code does today, surface it as an Open Question — don't fill the gap by inventing a requirement from the implementation.

## Language

Write all generated prose — Goal, Main Flow, Scope bullets, FR/BR/VR descriptions, Given/When/Then cell text, Open Questions, risk/dependency notes, etc. — in Vietnamese. Keep IT/domain jargon and anything that is a literal system value in its original form (usually English) instead of translating it: HTTP methods and status codes (`POST`, `422`, `404`), API paths, enum/state literals (e.g. stage names like `Debug`/`Ready-to-Merge`, checkpoint values like `DEBUG_APPROVED`), library/framework/tool names (FastAPI, Pydantic, pytest, React, TypeScript), standard QA/testing terms and abbreviations (API, RBAC, JWT, OAuth, CI/CD, E2E, A11y, Given/When/Then, Pyramid/Trophy/Honeycomb, P0-P3, N/A, TBD), and ID prefixes (FR-, BR-, VR-, AC-, US-). Template section headers and table column names stay as they are in `assets/` (English) — that's the fixed document structure, not prose. When in doubt whether a term is "chuyên ngành" or a plain word, keep it in English if translating it would make it harder to grep/match against the actual system (code, API, UI labels) — that traceability matters more than full localization.

## When NOT to use

- Feature already has an approved `spec.md` — go straight to `ck:qa-test-design`.
- Trivial config-only change with no acceptance criteria to define.
- No ticket/PRD/draft exists at all — use `ck:qa-spec-from-code`.

## Workflow

1. Read the input ticket/PRD/draft path first — in full, before drafting anything. If only a feature name/description was given with no document, ask the user for the actual ticket/PRD/draft, or confirm there genuinely isn't one (in which case redirect to `ck:qa-spec-from-code`).
2. Copy `assets/spec-overview.md` as the base and fill in first — Goal, Main Flow, Scope, Constraints, Raw Acceptance Criteria, Open Questions — transcribed and structured from the draft. This is the short pre-draft Tech Lead reviews before the full spec; keep it tight, don't duplicate the full spec.md detail here.
3. Copy `assets/spec.md` as the base and expand from the overview — General Information, Goal, User Stories, Scope, Main Flow (+ Alternate/Error Flows), Requirements (FR-ID table), Business and Validation Rules (BR/VR-ID table), Technical Notes, Non-Functional Requirements, Acceptance Criteria (AC-ID, Given/When/Then), Test Data and Environment, Dependencies and Risks, Rollback Plan, Open Questions, Approval. Acceptance criteria must be Given-When-Then or a concrete number — reject vague phrasing like "hoạt động tốt"/"nhanh" and ask for a measurable version instead. No field left blank without an explicit "N/A — reason" or `TBD` with owner.
4. Copy `assets/confirm-clear-checklist.md` as the base — walk the 10 fixed items (auth model, RBAC matrix, rate limit, retry policy, test seed/cleanup, base URL/environments, idempotency, endpoint/job timeout, webhook sync/async, frontend router/render type) one by one. For each, search the codebase for real evidence before marking `Confirmed`. Never mark `Confirmed` without an Evidence/Decision value. Items you can't verify from the repo → `Open`, assign an Owner, and ask the user. For every `Open` item, also fill the **AI Suggestion** column with a concrete, reasoned recommendation grounded in the feature's actual context (spec.md content, repo stack, comparable patterns already in the codebase) — not a generic textbook answer. Label it clearly as a suggestion: never let it silently count as Evidence, never flip Status to `Confirmed` because a suggestion exists — a human still has to accept or override it. Fill Blocking Questions and the Result checkbox (`Ready for Test Strategy` vs `Blocked`) — don't leave both unchecked.
5. Copy `assets/test-strategy.md` as the base — pick Pyramid/Trophy/Honeycomb and state the reason (don't re-derive new criteria), set layer ratio and coverage targets, and set the tool per layer from the repo's actual dependencies (check `package.json`/`requirements.txt`/`pytest.ini`/`manage.py` — don't assume a stack that isn't installed). Entry/Exit Criteria are now embedded directly in this file (sections 6-7) — fill them here, not in a separate file.
6. Surface a scope + corner-case summary back to the user for confirmation (this is QA's step 1.3) — explicitly flag anything in Constraints, Business/Validation Rules, or Acceptance Criteria that looks incomplete or contradictory, and anything the draft didn't specify that you had to leave as an Open Question.
7. Do not fill the Approval table's PM row yourself; leave it for the real PM to sign.

## Output location

`docs/qa/<feature>/spec-overview.md`, `docs/qa/<feature>/spec.md`, `docs/qa/<feature>/confirm-clear-checklist.md`, `docs/qa/<feature>/test-strategy.md`. If the project already has its own docs convention for feature bundles (e.g. `docs/<feature>/`), use that instead — check before creating a new folder pattern.

## Exit check

Before handing off, verify against the Phase 1 Exit Checklist in `docs/qa/QA_TEST_PROCESS_GUIDE.md` §2: spec.md has no unexplained blanks, checklist Result is `Ready for Test Strategy` (not `Blocked`), test-strategy.md has no unfilled `__%`/model choice, spec.md's Approval table PM row is explicitly unsigned (not silently skipped), and every FR/BR/AC row traces back to something the draft actually said (or is flagged as an Open Question) rather than being invented from reading the codebase.

## Next step

Hand off to `ck:qa-test-design` once the Phase 1 Exit Checklist passes.
