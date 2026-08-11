# Spec: [Feature Name]

## 1. General Information

| Item | Value |
|---|---|
| Project | [Project name] |
| Ticket / Epic | [ID hoặc link] |
| Tech Lead | [Name] |
| QA | [Name] |
| PM | [Name] |
| Date | YYYY-MM-DD |
| Target release | [Sprint/version/date] |
| Status | Draft / In Review / Approved |

## 2. Goal

[1–2 câu mô tả vấn đề cần giải quyết và kết quả mong muốn.]

## 3. User Stories

- **US-01:** As a [user], I want [action], so that [benefit].
- **US-02:** As a [user], I want [action], so that [benefit].

## 4. Scope

### In Scope
- [Function/API/screen/business rule]
- [Supported platform/environment]

### Out of Scope
- [Không triển khai trong phase này]
- [Known limitation được chấp nhận]

## 5. Main Flow

1. [Actor thực hiện hành động]
2. [Hệ thống validate/xử lý]
3. [Hệ thống trả kết quả]

### Alternate / Error Flows

| ID | Condition | Expected Behavior |
|---|---|---|
| AF-01 | [Alternate condition] | [Expected result] |
| EF-01 | [Error condition] | [Expected handling/message] |

## 6. Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | [Functional requirement] | P0/P1/P2/P3 |
| FR-02 | [Functional requirement] | P0/P1/P2/P3 |

## 7. Business and Validation Rules

| ID | Rule | Example / Error Message |
|---|---|---|
| BR-01 | [Business rule] | [Example] |
| VR-01 | [Validation rule] | [Error message] |

## 8. Technical Notes

| Item | Detail |
|---|---|
| Auth model | Public / JWT / Session / OAuth / Other |
| Role/RBAC | [Roles và quyền liên quan] |
| API/Module | [Endpoint hoặc source module] |
| Data change | [Table/field/migration hoặc None] |
| External dependency | [Service hoặc None] |
| Timeout/retry | [Rule hoặc N/A] |
| Backward compatibility | [Requirement] |

## 9. Non-Functional Requirements

| Category | Target |
|---|---|
| Performance | [Ví dụ: API p95 ≤ 500 ms hoặc N/A] |
| Security | [Yêu cầu chính hoặc N/A] |
| Accessibility | [WCAG/keyboard/screen reader hoặc N/A] |
| Compatibility | [Browser/device/version] |

## 10. Acceptance Criteria

| AC-ID | Priority | Given | When | Then |
|---|---|---|---|---|
| AC-01 | P0 | [Context] | [Action] | [Observable result] |
| AC-02 | P1 | [Context] | [Action] | [Observable result] |

## 11. Test Data and Environment

| Item | Detail |
|---|---|
| Required accounts/roles | [List] |
| Required data | [Valid/invalid/boundary data] |
| Environment | [Local/dev/staging] |
| Seed/cleanup | [Method] |
| Test credentials | [Secret manager/reference; không ghi secret thật] |

## 12. Dependencies and Risks

| Type | Item | Owner | Mitigation / Due Date |
|---|---|---|---|
| Dependency | [Item] | [Name] | [Plan/date] |
| Risk | [Item] | [Name] | [Mitigation] |

## 13. Rollback Plan

1. [Disable feature flag hoặc revert deployment]
2. [Rollback migration nếu cần]
3. [Verify critical path cũ]
4. [Notify stakeholders]

## 14. Open Questions

| Question | Owner | Status / Answer |
|---|---|---|
| [Question] | [Name] | Open / [Answer] |

## 15. Approval

| Role | Name | Status | Date |
|---|---|---|---|
| Tech Lead | [Name] | Approved / Rejected | |
| QA | [Name] | Approved / Rejected | |
| PM | [Name] | Approved / Rejected | |
