---
name: ck:qa-report
description: "Parse test/coverage/Newman results into the Phase 3 QA report, classifying failed/flaky/slow/skipped. Use right after /ck:test or /ck:web-testing produced raw results — does not run tests."
user-invocable: true
when_to_use: "Invoke after a test run exists (from /ck:test, /ck:web-testing, or Newman), before ck:qa-go-no-go."
category: utilities
keywords: [qa, report, coverage, flaky, newman, phase3]
argument-hint: "<feature> <scope>"
metadata:
  author: org
  version: "1.0.0"
---

# ck:qa-report — Phase 3: Execution Reporting

Produces `REPORT-{date}-{scope}.md` from results that already exist. Canonical blank template: `assets/report.md`. **Does NOT execute tests** — if no run exists yet, tell the user to run `/ck:test` (Gate 0-3) and/or `/ck:web-testing` first, then Newman for API tests. This skill's job is to gather, classify, and format — not to run the suite.

## When NOT to use

- No test run has happened yet — run `/ck:test`/`/ck:web-testing` first.
- You only need a quick pass/fail glance, not a formal report — reading raw CI output directly is faster.

## Workflow

1. Confirm Gate 0→3 ran in order (per guide §4 step 3.2). If gates were skipped or ran out of order, note that as a caveat in the report rather than treating results as fully trustworthy.
2. Locate raw results: coverage report (`coverage.xml`/`htmlcov`/`lcov.info`), test runner output (JUnit XML, pytest/Jest output), Newman JSON report. Search common project paths; if not found, ask the user where they are instead of fabricating numbers.
3. Classify: Total/Passed/Failed/Blocked-Skipped counts and pass rate from raw output. **Flaky** = same TC failed then passed across reruns with no code change (check CI rerun history/logs) — counted separately, not folded into Failed. **Slow** = exceeds the threshold defined in `test-strategy.md`; if no threshold is defined, ask what to use rather than picking an arbitrary number.
4. Cross-reference every Failed/Blocked item against `tc-matrix.md` to identify severity/owner for the Failed or Blocked Items table — don't report a bare stack trace with no traceability.
5. Copy `assets/report.md` as the base and fill in completely: Executive Summary, Test Results, Coverage (target vs actual vs Pass/Fail per metric), Gate Results (Static/Unit/Integration/E2E/API-Newman/A11y-Perf, each Pass/Fail/N/A with evidence link), Failed or Blocked Items (severity now uses P0-P3, matching `BUG-*.md`), Key Metrics (API p95, LCP/CLS/INP, load result, and Cleanup Pass/Fail with evidence), Recommendation checkbox, Open Questions/Risks.
6. For every P0/P1 item surfaced in Failed or Blocked Items, confirm a `BUG-[YYYYMMDD]-NNN.md` exists — if missing, tell the user to log one via `ck:qa-bug` before this report is considered final. Never list a blocking item without a corresponding bug file.
7. Fill the Cleanup line under Key Metrics (guide §4 step 3.7) — confirm test data was actually removed using the project's real cleanup command (`tests/docs/runbook.md` §9 "Cleanup"), don't assume cleanup happened.

## Output location

`docs/qa/<feature>/REPORT-{date}-{scope}.md`.

## Next step

Hand off to `ck:qa-go-no-go` once the report is complete.
