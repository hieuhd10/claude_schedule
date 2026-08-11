# FLAKY-[YYYYMMDD]-001 — [Test Name]

| Item | Value |
|---|---|
| Test/TC | [Name or TC-ID] |
| Owner | [Name] |
| First observed | YYYY-MM-DD |
| Frequency | [e.g. 2/10 runs] |
| Environment | [CI/local/browser] |
| Release impact | Blocker / Non-blocker |

## Symptom

[Failure message and observable behavior]

## Reproduction Evidence

| Run | Build | Result | Evidence |
|---:|---|---|---|
| 1 | [SHA] | Pass/Fail | [Link] |
| 2 | [SHA] | Pass/Fail | [Link] |

## Suspected Causes

- [Timing/race condition]
- [Shared data/test pollution]
- [External dependency/environment]
- [Selector/animation/network]

## Root Cause and Fix

[Do not close until root cause is identified or risk is explicitly accepted.]

## Verification

- [ ] Repeated runs pass
- [ ] Parallel run pass
- [ ] Related tests pass
- [ ] Retry is not hiding the failure
