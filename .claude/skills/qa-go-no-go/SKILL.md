---
name: ck:qa-go-no-go
description: "Turn a Phase 3 QA report into a Go/No-Go/Rework decision: go-no-go-checklist, decision-log, QA_REPORT_FINAL sign-off. Use once the QA report and CI status are ready, as the final release gate."
user-invocable: true
when_to_use: "Invoke after ck:qa-report produced a report, as the last step before merge/release."
category: utilities
keywords: [qa, go-no-go, decision-log, sign-off, phase4]
argument-hint: "<feature> <report path>"
metadata:
  author: org
  version: "1.0.0"
---

# ck:qa-go-no-go — Phase 4: Review & Go/No-Go

Produces the Phase 4 outputs defined in `docs/qa/QA_TEST_PROCESS_GUIDE.md` (process: §5): `go-no-go-checklist.md`, a `decision-log.md` entry, and `QA_REPORT_FINAL_{date}.md`. Canonical blank templates live in this skill's `assets/`.

**Does NOT** execute tests, merge, or deploy — those remain human/CI actions. **Does NOT** unilaterally override an open P0/P1 bug to force a Go — a blocker requires the user's/Tech Lead's/PM's explicit risk-accepted decision, never a silent downgrade.

## When NOT to use

- `REPORT-{date}-{scope}.md` doesn't exist yet — run `ck:qa-report` first.

## Workflow

1. Read the latest `REPORT-{date}-{scope}.md`, `test-strategy.md` (thresholds), and every open `BUG-*.md`/`FLAKY-*.md` for the feature.
2. Copy `assets/go-no-go-checklist.md` as the base and check items one by one against real numbers from the report — P0/P1 pass status, P2 pass rate, coverage vs threshold, open critical/high blockers, unresolved flaky affecting critical path, build/CI status, migration+rollback verified, docs updated. Never check an item without citing the concrete value it's based on. Unmet items go in the Exceptions/Accepted Risks table (reason/risk/approver), not silently checked.
3. Determine the recommendation: any open P0/P1 blocker or unresolved flaky on the critical path defaults to **No-Go**. If the user wants to override this, surface it explicitly — original decision (No-Go by default), the concern (which bug, why it's blocking), the trade-off, and concrete options (Go-with-risk-accepted / Rework / wait for fix) — then wait for the user's call. Do not resolve this yourself. Record the final call in the checklist's own Decision checkbox (Go/No-Go/Rework) + Reason line.
4. Append one row to `decision-log.md`, using `assets/decision-log.md` as the header/base if the file doesn't exist yet: date, decision, scope, reason, risk accepted (if any), owner, deadline. Fill the Notes section (supporting report link, CI/build link, deployment or rework ticket).
5. Copy `assets/qa-report-final.md` as the base for `QA_REPORT_FINAL_{date}.md` — Final Status checkbox, Summary (pulled from the REPORT and go-no-go-checklist, not re-typed from scratch), Accepted Risks, Required Next Actions, Sign-off table. Leave signer names blank for humans to fill; never fabricate a signature.
6. If Go: remind the user to record the merge commit + deployment note — this skill does not perform the merge/deploy.
7. If No-Go/Rework: compile the bug list with owner + SLA per bug from open `BUG-*.md` files (severity P0-P3). If a bug lacks an owner or SLA, flag it rather than inventing one.
8. If `spec.md`/Constraints flagged a breaking change, remind the user to run `/ck:docs` (guide §5 step 4.5) — scope the doc update to what actually changed, don't touch unrelated docs.

## Output location

`docs/qa/<feature>/go-no-go-checklist.md`, `docs/qa/<feature>/decision-log.md` (append, don't overwrite prior entries), `docs/qa/<feature>/QA_REPORT_FINAL_{date}.md`.

## Next step

None inside the QA process — this is the terminal gate. If No-Go/Rework, the bug list feeds back into `ck:qa-bug` for tracking until fixed.
