---
name: ck:qa-spec-from-code
description: "Scaffold Phase 1 (Spec) of the org QA process by reverse-engineering requirements from existing source code/diff when there is no ticket/PRD: spec-overview, spec.md, checklist, test-strategy. Use when a change already exists in code but was never specced."
user-invocable: true
when_to_use: "Invoke when a feature/fix already exists in code (an uncommitted diff, a merged PR, an undocumented behavior) with no ticket/PRD/spec draft to work from, and you need to reconstruct the org's Phase 1 QA docs for it — before ck:qa-test-design."
category: utilities
keywords: [qa, spec, reverse-engineer, code-derived, retrofit, confirm-clear-checklist, test-strategy, phase1]
argument-hint: "<diff/PR/branch/feature area to derive the spec from>"
metadata:
  author: org
  version: "1.0.0"
---

# ck:qa-spec-from-code — Phase 1: Spec (reconstructed from existing source code)

Produces the required Phase 1 outputs defined in `docs/qa/QA_TEST_PROCESS_GUIDE.md` (process: §2): `spec-overview.md`, `spec.md`, `confirm-clear-checklist.md`, `test-strategy.md`. Canonical blank templates live in this skill's `assets/` — copy from there, don't re-derive structure from the guide's illustrative examples. If the target repo doesn't have `docs/qa/QA_TEST_PROCESS_GUIDE.md` yet, fall back to this file's own rules below and tell the user the guide is missing — don't silently invent process rules to fill the gap.

**Companion skill:** if a ticket, PRD, or spec draft already exists, use `ck:qa-spec-from-ticket` instead and treat that document — not the code — as the source of truth.

**Does NOT** run `/ck:scenario`, build `tc-matrix.md`, or run tests — that's `ck:qa-test-design` and `/ck:test`. **Does NOT** assign final P0-P3 priority on FR/AC rows with confidence — priority is a PM call; mark tentative priorities clearly and leave the Approval/PM row unresolved until PM signs off.

## Source of truth, and its central risk

There is no requester document here — the actual diff/source code is the only ground truth for what changed. That makes this skill's single biggest failure mode **leaking implementation into the spec**: pasting function names, internal variable names, file:line references, or library-internal types (Pydantic/FastAPI internals, TS type names) into sections meant to define business-observable behavior, instead of translating what the code does into what a caller/user/PM would observe.

**Business language, not code description — non-negotiable for this skill.** `spec.md`'s Main Flow, Requirements (FR), Business/Validation Rules (BR/VR), and Acceptance Criteria must describe *observable* behavior: API request/response shape, HTTP status codes, stage/state names, error messages — verifiable by a PM or QA without reading the implementation. Endpoint paths, request/response field values, and status codes are contract-level and belong there. Function names, internal variables, file:line refs, and framework-internal types do not — they belong only in **Technical Notes** (API/Module row) or the **Implementation Notes** subsection of `spec.md` (already scaffolded in `assets/spec.md`, right after Technical Notes). Before finalizing, re-read Main Flow/FR/BR-VR/AC and ask: "would this sentence still make sense to someone who has never opened this file?" If not, rewrite it or move the code reference to Implementation Notes.

## Language

Write all generated prose — Goal, Main Flow, Scope bullets, FR/BR/VR descriptions, Given/When/Then cell text, Open Questions, risk/dependency notes, Implementation Notes prose, etc. — in Vietnamese. Keep IT/domain jargon and anything that is a literal system value in its original form (usually English) instead of translating it: HTTP methods and status codes (`POST`, `422`, `404`), API paths, enum/state literals (e.g. stage names like `Debug`/`Ready-to-Merge`, checkpoint values like `DEBUG_APPROVED`), function/variable/file names cited in Implementation Notes, library/framework/tool names (FastAPI, Pydantic, pytest, React, TypeScript), standard QA/testing terms and abbreviations (API, RBAC, JWT, OAuth, CI/CD, E2E, A11y, Given/When/Then, Pyramid/Trophy/Honeycomb, P0-P3, N/A, TBD), and ID prefixes (FR-, BR-, VR-, AC-, US-). Template section headers and table column names stay as they are in `assets/` (English) — that's the fixed document structure, not prose. This is independent of the business-language guardrail above: that rule is about *altitude* (behavior vs. implementation detail), this one is about *literal language* (Vietnamese vs. English) — both apply at once, e.g. a Main Flow step is Vietnamese prose describing observable behavior, with any HTTP/API/enum literal kept in English inside it.

## When NOT to use

- A ticket/PRD/spec draft already exists — use `ck:qa-spec-from-code`'s companion, `ck:qa-spec-from-ticket`, and treat that document as authoritative instead of the code.
- Feature already has an approved `spec.md` — go straight to `ck:qa-test-design`.
- Trivial config-only change with no acceptance criteria to define.

## Workflow

1. Identify the code surface to spec: an uncommitted diff, a specific commit/PR, or a described feature area. Read it in full — `git diff`/`git show`, the touched files, and any existing docs that already describe the behavior (e.g. an architecture doc) — before drafting anything. Also check whether a matching ticket genuinely doesn't exist (e.g. `gh issue list`) rather than assuming; if one turns up, switch to `ck:qa-spec-from-ticket`.
2. Copy `assets/spec-overview.md` as the base and fill in first — Goal, Main Flow, Scope, Constraints, Raw Acceptance Criteria, Open Questions — written as the observed behavior change, in business language (see guardrail above). Record in Ticket/PRD that this was sourced from code, not a document, and note what was checked (diff, files, commits). This is the short pre-draft Tech Lead reviews before the full spec; keep it tight, don't duplicate the full spec.md detail here.
3. Copy `assets/spec.md` as the base and expand from the overview — General Information, Goal, User Stories, Scope, Main Flow (+ Alternate/Error Flows), Requirements (FR-ID table), Business and Validation Rules (BR/VR-ID table), Technical Notes (+ Implementation Notes), Non-Functional Requirements, Acceptance Criteria (AC-ID, Given/When/Then), Test Data and Environment, Dependencies and Risks, Rollback Plan, Open Questions, Approval. Acceptance criteria must be Given-When-Then or a concrete number. No field left blank without an explicit "N/A — reason" or `TBD` with owner. Always add an Open Question asking whether a real ticket/ID should be filed for traceability, and a Dependencies/Risks row noting that intent was inferred from code and needs stakeholder confirmation, not just Tech Lead/QA sign-off.
4. Copy `assets/confirm-clear-checklist.md` as the base — walk the 10 fixed items (auth model, RBAC matrix, rate limit, retry policy, test seed/cleanup, base URL/environments, idempotency, endpoint/job timeout, webhook sync/async, frontend router/render type) one by one. For each, search the codebase for real evidence before marking `Confirmed`. Never mark `Confirmed` without an Evidence/Decision value. Items you can't verify from the repo → `Open`, assign an Owner, and ask the user. For every `Open` item, also fill the **AI Suggestion** column with a concrete, reasoned recommendation grounded in the feature's actual context (spec.md content, repo stack, comparable patterns already in the codebase) — not a generic textbook answer. Label it clearly as a suggestion: never let it silently count as Evidence, never flip Status to `Confirmed` because a suggestion exists — a human still has to accept or override it. Fill Blocking Questions and the Result checkbox (`Ready for Test Strategy` vs `Blocked`) — don't leave both unchecked.
5. Copy `assets/test-strategy.md` as the base — pick Pyramid/Trophy/Honeycomb and state the reason from the repo's *actual* existing test composition (count/shape of current tests), not a generic default. Set layer ratio and coverage targets, and set the tool per layer from the repo's actual dependencies (check `package.json`/`requirements.txt`/`pytest.ini`/`manage.py` — don't assume a stack that isn't installed). Run the existing test suite to record a real baseline-green/red status for Entry Criteria — don't assume it's green. Entry/Exit Criteria are embedded directly in this file (sections 6-7) — fill them here, not in a separate file.
6. Surface a scope + corner-case summary back to the user for confirmation (this is QA's step 1.3) — explicitly flag anything inferred rather than confirmed, anything in Constraints/BR-VR/AC that looks incomplete or contradictory, and the fact that this spec describes existing code behavior and still needs a real stakeholder to confirm it matches actual intent (not just describe what shipped).
7. Do not fill the Approval table's PM row yourself; leave it for the real PM to sign.

## Output location

`docs/qa/<feature>/spec-overview.md`, `docs/qa/<feature>/spec.md`, `docs/qa/<feature>/confirm-clear-checklist.md`, `docs/qa/<feature>/test-strategy.md`. If the project already has its own docs convention for feature bundles (e.g. `docs/<feature>/`), use that instead — check before creating a new folder pattern.

## Exit check

Before handing off, verify against the Phase 1 Exit Checklist in `docs/qa/QA_TEST_PROCESS_GUIDE.md` §2: spec.md has no unexplained blanks, checklist Result is `Ready for Test Strategy` (not `Blocked`), test-strategy.md has no unfilled `__%`/model choice, spec.md's Approval table PM row is explicitly unsigned (not silently skipped), Main Flow/FR/BR-VR/AC read as business/black-box behavior with zero leaked function names, internal variables, or file:line refs outside Technical Notes/Implementation Notes, and an Open Question exists about filing a real ticket for traceability.

## Next step

Hand off to `ck:qa-test-design` once the Phase 1 Exit Checklist passes.
