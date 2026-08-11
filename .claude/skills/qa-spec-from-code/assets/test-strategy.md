# Test Strategy — [Feature Name]

## 1. Scope and Risk

- Scope: [Feature/module/release]
- Main risk: [Data loss/security/payment/core flow/etc.]
- Selected model: Pyramid / Trophy / Honeycomb
- Reason: [1–2 câu]

## 2. Test Layer Plan

| Layer | Target Ratio | Main Scope | Tool |
|---|---:|---|---|
| Unit | __% | Business/validation logic | [pytest/vitest/etc.] |
| Integration | __% | DB/service/API integration | [tool] |
| E2E | __% | Critical user flows | Playwright/Cypress |
| API | __% | Contract/error/auth | Postman/Newman |
| A11y | __% | Critical screens | axe/Lighthouse |
| Perf/Load | __% | Critical endpoints/flows | k6/Lighthouse |

## 3. Coverage Targets

| Metric | Target |
|---|---:|
| Line | ≥ __% |
| Branch | ≥ __% |
| Function | ≥ __% |
| Critical path | 100% |

## 4. Priority Rule

- **P0:** Release blocker; must pass.
- **P1:** Important; must pass unless risk is explicitly accepted.
- **P2:** Target pass rate ≥ 90%.
- **P3:** May be deferred with a record.

## 5. CI Order

1. Lint/typecheck/build
2. Unit
3. Integration
4. E2E
5. API
6. A11y
7. Perf/load when applicable

## 6. Entry Criteria

- [ ] Spec and acceptance criteria approved
- [ ] Environment available
- [ ] API/data contract stable
- [ ] Fixture/seed/cleanup ready
- [ ] Baseline CI green

## 7. Exit Criteria

- [ ] All P0/P1 pass
- [ ] P2 pass rate ≥ 90%
- [ ] Coverage targets met
- [ ] No unresolved critical bug
- [ ] No unresolved flaky test affecting release

Approved by: QA [Name] / Tech Lead [Name] / PM [Name]
