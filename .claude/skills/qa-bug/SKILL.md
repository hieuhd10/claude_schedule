---
name: ck:qa-bug
description: "Log a bug or flaky test, triage severity P0-P3, pull regression TC-IDs from tc-matrix.md after a fix. Use the moment a bug/flaky test is found, or right after a fix, for mandatory P0/P1 regression."
user-invocable: true
when_to_use: "Invoke the moment a bug is found (any phase) or right after a fix lands, before closing it out."
category: utilities
keywords: [qa, bug, regression, flaky, bug-track]
argument-hint: "found <description> | fixed <BUG-id> | flaky <test/TC name>"
metadata:
  author: org
  version: "1.0.0"
---

# ck:qa-bug — Bug Track (runs parallel to all 4 phases)

Produces/updates `BUG-[YYYYMMDD]-NNN.md` (canonical blank template: `assets/bug-report.md`) or `FLAKY-[YYYYMMDD]-NNN.md` (canonical blank template: `assets/flaky-report.md`), and enforces the guide §6 regression rule. Runs independently of the 4 sequential phases — can trigger during Phase 1 just as easily as Phase 4.

**Does NOT** fix bugs itself — delegates to `/ck:debug` (root cause) and `/ck:fix` (fix). **Does NOT** decide Go/No-Go — that's `ck:qa-go-no-go`.

## When NOT to use

- Nothing — bugs go through the Bug flow below, flaky tests go through the Flaky flow below. Pick based on symptom (see "Bug vs Flaky" below), don't skip logging either kind.

## Workflow

### On "bug found"

1. Copy `assets/bug-report.md` as `BUG-[YYYYMMDD]-NNN.md` (increment NNN per day, or use the project's existing bug-numbering/ticket convention if one exists) immediately — don't wait until root cause is known. Root Cause/Fix stay unfilled/`TBD` until known; Status starts at `Open`.
2. Triage severity as **P0** (release blocker) / **P1** (important, must pass unless risk explicitly accepted) / **P2** (target pass rate ≥90%) / **P3** (may be deferred with a record) — same scale as `test-strategy.md`'s Priority Rule, not the scenario Critical/High/Medium/Low scale. Assign an Owner, fill Module/Environment/Related TC.

### On "fix landed"

3. If root cause isn't proven yet, run `/ck:debug` first — do not jump straight to a fix on a guess. Update Status to `In Progress`.
4. Run `/ck:fix` (or let the assigned Dev fix it), then fill Root Cause and the Fix field (commit/PR + summary). Update Status to `Fixed`.
5. **Regression (mandatory for P0/P1, per guide §6):** check the Regression Scope boxes that apply (Original TC / Related happy path / Related error-edge cases / Full impacted suite) — for P0/P1 this must go beyond just the Original TC box, since a fix's blast radius is usually wider than the single failing case. Search `tc-matrix.md` for every TC-ID sharing the same module/UC/Flow and list them to the user before running.
6. Fill the Verification table (build/commit, result, verified by, date) with the actual regression run. Update Status to `Verified` then `Closed` only after regression passes; if regression fails or a side-effect appears, move Status back to `In Progress` — don't create a new BUG file for the same underlying issue.

### Bug vs Flaky

If the same TC has now failed intermittently (e.g. 2-3 times across N runs) with **no code change**, this is **not** a bug — do not create a `BUG-*.md`. Instead copy `assets/flaky-report.md` as `FLAKY-[YYYYMMDD]-NNN.md`: fill Test/TC, First observed, Frequency, Environment, Release impact, Symptom, and the Reproduction Evidence table (run/build/result/evidence per occurrence). List Suspected Causes (timing/race, shared data/test pollution, external dependency, selector/animation/network). Trigger `/ck:debug` to investigate. Do not check any Verification box or consider it resolved until root cause is identified or the risk is explicitly accepted and recorded in `decision-log.md` (with reason + deadline). Never silently delete or skip a flaky test to make the suite look green — that hides the failure rather than resolving it.

## Output location

`docs/qa/<feature>/bugs/BUG-[YYYYMMDD]-NNN.md` and `docs/qa/<feature>/bugs/FLAKY-[YYYYMMDD]-NNN.md`, or the project's existing bug-tracker location if one is already used instead of markdown files — check first, don't create a parallel bug log if the org already tracks bugs elsewhere (e.g. Jira/Linear referenced in project memory).

## Next step

Feeds into `ck:qa-report`'s Critical Issues section and `ck:qa-go-no-go`'s blocker check.
