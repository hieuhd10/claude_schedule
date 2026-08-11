---
name: ck:qa-test-design
description: "Scaffold Phase 2 (Test Design) of the org QA process: scenario summary, tc-matrix, entry-criteria checklist, Postman skeleton, test-data stubs. Use after spec.md exists, before test execution."
user-invocable: true
when_to_use: "Invoke after ck:qa-spec-from-ticket or ck:qa-spec-from-code is done, before /ck:test or /ck:web-testing."
category: utilities
keywords: [qa, test-design, tc-matrix, postman, fixtures, phase2]
argument-hint: "<feature> [--iterations N | --saturation]"
metadata:
  author: org
  version: "1.0.0"
---

# ck:qa-test-design — Phase 2: Test Design

Produces the Phase 2 outputs defined in `docs/qa/QA_TEST_PROCESS_GUIDE.md` (process: §3): `scenario-{feature}-{date}.md`, `tc-matrix.md`, test-data fixture stubs, `postman-collection.json` + `postman-environment.json`, `entry-criteria-checklist.md`. Canonical blank templates live in this skill's `assets/`.

**Does NOT** write spec.md/test-strategy.md (that's `ck:qa-spec-from-ticket` or `ck:qa-spec-from-code`) and **does NOT** execute the suite (that's `/ck:test` / `/ck:web-testing`).

## When NOT to use

- Phase 1 (`spec.md` + `test-strategy.md`) isn't done yet — run `ck:qa-spec-from-ticket` (a ticket/PRD/draft already exists) or `ck:qa-spec-from-code` (no ticket exists, speccing from an existing diff/feature) first.
- A fresh `scenario-{feature}-*.md` already exists and nothing in scope changed — reuse it instead of regenerating.

## Workflow

1. Read `spec.md` and `test-strategy.md` for the feature. If either is missing, stop and tell the user to run `ck:qa-spec-from-ticket` or `ck:qa-spec-from-code` first — don't guess scope or ratios.
2. Run `/ck:scenario "<feature>"`, forwarding `--iterations N` / `--saturation` if the user passed them (default one-shot for P2/P3 features, `--saturation` for P0/P1 or high-risk features per guide §3 step 2.1). Distill the raw `/ck:scenario` output into `assets/scenario-template.md`'s shape (Scope, Scenarios table, Coverage Summary by flow-type dimension, Top Risks, Open Questions) — this is a QA-facing summary, not a copy-paste of the raw saturation-loop report. Save as `scenario-{feature}-{date}.md`.
3. Copy `assets/tc-matrix.md` as the base: every Critical/High/Medium scenario row gets ≥1 TC-ID. Low-severity rows follow the priority (P0-P3) from spec.md to decide dedicated TC vs grouped coverage. Never leave Type/Priority/Precondition/Test Data blank. Fill the Summary-by-priority table at the bottom once counts are known.
4. Assign each TC's Type (Unit/Integration/E2E/API/A11y/Perf) and check the resulting distribution against the ratio locked in `test-strategy.md` — flag drift instead of silently accepting it.
5. Scaffold test data: `tests/fixtures/factories/`, `tests/fixtures/seed.*`, `tests/fixtures/auth.*`. Inspect the repo's existing test folder/language conventions first (e.g. pytest fixtures vs factory_boy vs Jest test-utils) — don't invent a new pattern if one already exists.
6. Copy `assets/postman-collection.template.json` + `assets/postman-environment.template.json` as the base — already includes bearer auth wired to `{{access_token}}`, a `base_url` variable, and one working sample request (`Sample health check` with a `pm.test` assertion) under `Happy Path/`. Replace the sample with real requests under `Auth/`, `Happy Path/`, `Edge Cases/`, `Error Cases/`, keeping the `pm.test` pattern. Mark unknown field-level assertions as `TODO` rather than inventing field names. Save as `postman-collection.json` + `postman-environment.json`.
7. Copy `assets/entry-criteria-checklist.md` as the base and check it against real state (build status, migrations, environment reachability). Unmet items go in the Exceptions table (reason/risk/approver), not silently checked off. Fill the Decision checkbox (`Ready for Execution` vs `Blocked`).

## Output location

Same feature folder as Phase 1 outputs (`docs/qa/<feature>/`) for markdown; `tests/fixtures/` and `tests/postman/` (or the project's existing test root) for code/data artifacts.

## Exit check

100% Critical/High scenarios have a TC, no blank Type/Priority/Precondition cells, factories/seed/auth run independently (no ordering dependency), Postman collection imports cleanly, entry-criteria-checklist.md Decision = `Ready for Execution`.

## Next step

Once Entry Criteria pass, hand off to `/ck:test` and/or `/ck:web-testing` for execution. Once a run produces raw results, hand off to `ck:qa-report`.
