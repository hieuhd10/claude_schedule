# Spec: Lifecycle Debug-Approved Gate + Checkpoint Narrowing

## 1. General Information

| Item | Value |
|---|---|
| Project | claude_schedule |
| Ticket / Epic | Không có — lấy nguồn từ working-tree diff chưa commit (xem spec-overview.md) |
| Tech Lead | TBD |
| QA | TBD |
| PM | TBD |
| Date | 2026-08-04 |
| Target release | TBD — merge tiếp vào `feature/test-routine` |
| Status | Draft |

## 2. Goal

Ngăn lifecycle engine cho phép một linked Pull Request đang mở đưa Issue vượt qua Debug/Fix (sang Review/Test/Ready-to-Merge) trừ khi operator đã post checkpoint `DEBUG_APPROVED` một cách rõ ràng, và rút gọn `Checkpoint` contract về đúng value đó vì bốn checkpoint còn lại không có UI trigger và không ảnh hưởng gì tới engine.

## 3. User Stories

- **US-01:** Là operator đang review một Issue, tôi muốn lifecycle giữ ở Debug/Fix cho đến khi tôi explicitly approve kết quả debug, để một PR bị cross-reference tình cờ (hoặc được mở trước khi tôi review xong root cause) không thể lặng lẽ bỏ qua gate Review/Test.
- **US-02:** Là người maintain checkpoint API, tôi muốn `Checkpoint` contract chỉ giới hạn ở value mà UI thực sự gửi, để code routing PR chết và error path `404` của nó không bị ship hay test một cách vô nghĩa.

## 4. Scope

### In Scope
- Checkpoint action để approve kết quả Debug được rút gọn về một approval type duy nhất được hỗ trợ ("Approve Debug"); bốn approval type không có UI trigger (Ready for Review / Review Confirmed / Test Confirmed / PR Merged) bị retired khỏi API contract.
- Checkpoint comment luôn được post vào thread Issue — không bao giờ vào linked Pull Request — và việc post không còn phụ thuộc vào việc có Pull Request hay không.
- Một Issue có linked Pull Request đang mở chỉ tiến vào Review, Test, và Ready-to-Merge khi đã có Debug approval được ghi nhận trên Issue; nếu chưa, Issue vẫn giữ ở Debug/Fix bất kể review/test result nào đã tồn tại trên Pull Request.
- Regression test được cập nhật để cover cả case bị chặn (gated) và case không bị chặn (ungated) (xem Technical Notes để biết implementation pointer).

### Out of Scope
- Không thêm approval type mới.
- Không có khả năng merge Pull Request trong app — merge vẫn chỉ diễn ra trên GitHub.
- Không đổi cách nhận diện Review/Test result marker trong comment, cách đánh giá CI check "green", hay cách parse response của Claude.
- Không đổi auth/RBAC/rate-limit/idempotency (gap có từ trước — xem checklist).

## 5. Main Flow

1. Operator (hoặc Claude) post ghi chú điều tra debug lên Issue — stage vẫn giữ ở Debug.
2. Operator submit checkpoint action "Approve Debug" cho Issue.
3. Hệ thống ghi lại approval dưới dạng comment trên thread **Issue** (không bao giờ trên Pull Request).
4. Ở lần check status kế tiếp:
   - Nếu Issue đã closed → stage là Completed.
   - Nếu không, và có Pull Request được linked, vẫn đang mở, **và** đã có Debug approval được ghi nhận → hệ thống đánh giá Review, rồi Test, rồi Ready-to-Merge, theo đúng thứ tự đó (không đổi so với trước, khi gate đã được thoả).
   - Nếu không, và đã có Debug approval được ghi nhận (chưa có linked PR đang mở) → stage là Fix.
   - Nếu không → stage giữ ở Debug, dựa vào việc đã có response điều tra hay request nào chưa.

### Alternate / Error Flows

| ID | Condition | Expected Behavior |
|---|---|---|
| AF-01 | Có linked PR đang mở, đã Debug approved, review đã pass, chưa có test result | Stage Test, next action là chạy test trên Pull Request (không đổi so với trước, khi gate đã được thoả) |
| AF-02 | Có linked PR đang mở, đã Debug approved, PR sau đó chuyển sang closed | Rơi về flow Fix/Debug (hành vi có từ trước, không bị ảnh hưởng bởi thay đổi này) |
| EF-01 | Checkpoint request được submit với approval type nằm ngoài tập được hỗ trợ | Bị reject với lỗi validation 422 |
| EF-02 (retired) | Trước đây: checkpoint type "Review Confirmed" được submit khi chưa có linked Pull Request | Trước đây trả về 404 Pull Request Not Found; request path và approval type này không còn tồn tại — xem AC-02/AC-03 |

## 6. Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Checkpoint feature CHỈ được hỗ trợ đúng một approval type, "Approve Debug". Bốn approval type trước đây phải bị retired. | P0 (tentative — PM confirm) |
| FR-02 | Mọi checkpoint comment PHẢI được post vào thread Issue; việc post KHÔNG được phụ thuộc vào, hay route tới, linked Pull Request. | P0 (tentative) |
| FR-03 | Một Issue có linked Pull Request đang mở CHỈ được đánh giá Review/Test/Ready-to-Merge khi đã có Debug approval được ghi nhận trên Issue. | P0 (tentative) |
| FR-04 | Khi chưa có Debug approval được ghi nhận, một Issue có linked Pull Request đang mở PHẢI giữ ở Debug/Fix, kể cả khi Pull Request đã có review/test result pass và check xanh. | P0 (tentative) |
| FR-05 | Tập approval type mà API chấp nhận PHẢI giống nhau giữa frontend và backend. | P1 (tentative) |
| FR-06 | Một Issue đã closed PHẢI luôn resolve về Completed, bất kể trạng thái Debug-approval. | P1 (tentative) |

## 7. Business and Validation Rules

| ID | Rule | Example / Error Message |
|---|---|---|
| BR-01 | Một Issue được coi là "Debug approved" khi có ít nhất một Debug-approval comment tồn tại trên đó; người post comment không bị giới hạn hay verify. | Bất kỳ commenter nào, kể cả người không phải operator trên repo public, đều có thể trigger approval (hành vi có từ trước, không đổi). |
| VR-01 | Value approval-type của checkpoint request phải là một trong các type được hỗ trợ. | Value không hợp lệ → bị reject với lỗi validation 422. |

## 8. Technical Notes

| Item | Detail |
|---|---|
| Auth model | GitHub PAT qua env var `GITHUB_TOKEN` ở server (`settings.py`); không có session/JWT/OAuth cho end-user. Không liên quan tới thay đổi này. |
| Role/RBAC | Không có — tool chỉ dùng cho một operator. Access control duy nhất là repository allow-list (`RESTRICT_TO_CONFIGURED_REPOSITORY`), không liên quan tới checkpoint. |
| API/Module | `src/claude_schedule/lifecycle/models.py`, `src/claude_schedule/lifecycle/engine.py`, `src/claude_schedule/api/routes.py` (`post_checkpoint`), `frontend/src/api/types.ts` |
| Data change | Không có — không có database; lifecycle state được derive lại mỗi request từ GitHub. |
| External dependency | GitHub REST API (đã có từ trước, không đổi). |
| Timeout/retry | Không đổi — chỉ thử 1 lần, `settings.github_api_timeout_seconds` (default 15s), không retry khi fail (`github/client.py`). |
| Backward compatibility | Breaking: 4 checkpoint value bị xoá khỏi contract. Đã verify bằng `grep` là frontend hiện tại không còn reference nào tới các literal đã xoá, và `tsc -b --noEmit` sạch. |

### Implementation Notes (informational — not business scope; for engineers/QA automation only)

- Approval-type enum: `Checkpoint` trong `src/claude_schedule/lifecycle/models.py`; comment builder `build_checkpoint_comment()` (cùng file) không còn lookup bảng description/target theo từng type nữa.
- Route: `post_checkpoint` trong `src/claude_schedule/api/routes.py` giờ luôn gọi `service.post_issue_comment`; path `PullRequestNotFoundError` → 404 chỉ dùng cho các type đã retired bị xoá.
- Stage logic: `infer_stage()` trong `src/claude_schedule/lifecycle/engine.py:103` — branch open-linked-PR giờ yêu cầu derived flag `debug_approved` (true khi có issue comment match `[LIFECYCLE:DEBUG_APPROVED]`) phải true trước khi đánh giá `review_marker`/`test_marker`.
- Frontend type: union `Checkpoint` trong `frontend/src/api/types.ts`.
- Tests: `tests/lifecycle/test_engine.py` (fixture mới `_debug_approved_comment()` được thread qua mọi case Review/Test/Ready-to-Merge, cộng thêm case mới chứng minh open PR chưa gated vẫn giữ ở Debug); `tests/api/test_routes.py` (bỏ test "Review Confirmed without PR → 404" giờ đã không còn khả thi).

## 9. Non-Functional Requirements

| Category | Target |
|---|---|
| Performance | N/A — không có I/O path mới; chỉ là logic gate in-memory cộng enum hẹp hơn. |
| Security | N/A — không có attack surface mới; hiệu ứng chính là xoá một code path (routing PR-comment + error branch của nó). |
| Accessibility | N/A — không có UI markup mới; checkpoint UI trước đây đã chỉ expose `DEBUG_APPROVED` (theo `docs/issue-lifecycle-flow.md` §8), nên đây là dọn dẹp ở type-level, không phải thay đổi UI. |
| Compatibility | Chỉ ở API-contract (xem Backward compatibility ở trên); không đổi browser/device targeting. |

## 10. Acceptance Criteria

| AC-ID | Priority | Given | When | Then |
|---|---|---|---|---|
| AC-01 | P0 | Checkpoint request với approval type "Approve Debug" | Được submit cho một Issue | Được accept và comment tạo ra chứa marker `[LIFECYCLE:DEBUG_APPROVED]` |
| AC-02 | P0 | Checkpoint request với một trong các approval type đã retired (Ready for Review / Review Confirmed / Test Confirmed / PR Merged) | Được submit | Request bị reject với lỗi validation 422 — không route tới Pull Request và không phải 404 |
| AC-03 | P0 | Debug-approval checkpoint request cho một Issue, có hoặc không có linked Pull Request | Được submit | Comment tạo ra xuất hiện trên thread Issue, không bao giờ trên Pull Request |
| AC-04 | P0 | Issue có linked Pull Request đang mở và chưa ghi nhận Debug approval, trong khi Pull Request đã có review result pass, test result pass, và mọi check xanh | Lifecycle stage được tính lại | Stage vẫn giữ ở Debug (không nhảy thẳng sang Review/Test/Ready-to-Merge) |
| AC-05 | P0 | Issue có linked Pull Request đang mở, đã ghi nhận Debug approval, review result pass, test result pass, và mọi check xanh | Lifecycle stage được tính lại | Stage là Ready-to-Merge (hành vi cũ được giữ nguyên khi gate đã được thoả) |
| AC-06 | P1 | Issue đã closed, bất kể trạng thái Debug-approval hay lịch sử checkpoint | Lifecycle stage được tính lại | Stage là Completed (priority branch không bị ảnh hưởng bởi thay đổi này) |
| AC-07 | P1 | Frontend code vẫn còn reference một approval-type value đã retired | Project được build/type-check | Build fail (regression guard cho contract-consistency) |

## 11. Test Data and Environment

| Item | Detail |
|---|---|
| Required accounts/roles | Không có — backend test dùng fakes/mocks cho `GitHubService` (fixture `fake_service` trong `tests/api/test_routes.py`); không có call GitHub thật. |
| Required data | Comment fixture có/không có `[LIFECYCLE:DEBUG_APPROVED]` (`_debug_approved_comment()`), PR/check fixture (`_pull_request`, `CheckRun`) theo helper đã có trong `tests/lifecycle/test_engine.py`. |
| Environment | Local — `pytest` (backend) và `vitest` (frontend); không cần environment ngoài vì `GitHubService` được fake. |
| Seed/cleanup | N/A — không có persistent state; mỗi test tự dựng fixture in-memory. |
| Test credentials | N/A — không cần GitHub token thật cho các test này. |

## 12. Dependencies and Risks

| Type | Item | Owner | Mitigation / Due Date |
|---|---|---|---|
| Dependency | `docs/issue-lifecycle-flow.md` (hiện đang untracked) phải được commit cùng với code change để giữ đồng bộ — file này đã mô tả sẵn gate mới và tập checkpoint đã rút gọn. | TBD | Commit doc + code cùng lúc. |
| Risk | Breaking API contract: consumer bên ngoài nào còn post một trong 4 checkpoint value đã xoá sẽ nhận `422` thay vì được route đi. Frontend của repo này đã verify không còn reference nào. | TBD (Tech Lead/PM confirm không còn consumer khác) | Ghi rõ là breaking change trong PR description/changelog. |
| Risk | `POST .../checkpoints` không có idempotency guard (có từ trước, không phải do thay đổi này) — double-click sẽ post hai comment `DEBUG_APPROVED` giống nhau. | TBD | Xem confirm-clear-checklist.md item 7 — accepted vì impact thấp, trừ khi PM đánh giá khác. |

## 13. Rollback Plan

1. Revert commit(s) chứa thay đổi này, khôi phục lại 5 approval type cũ, routing comment tới Pull Request, và việc advance open-PR không điều kiện như trước.
2. Không có data/migration cần rollback — lifecycle state là stateless, derive từ GitHub mỗi request.
3. Chạy lại automated test suite của backend và frontend để confirm hành vi cũ đã pass trước đây được khôi phục.
4. Thông báo cho bất kỳ ai có thể đã bắt đầu phụ thuộc vào contract hẹp hơn này.

## 14. Open Questions

| Question | Owner | Status / Answer |
|---|---|---|
| Có ticket/issue number thật để file thay đổi này vào không? | TBD | Open — không tìm thấy trong `gh issue list` |
| Có consumer nào ngoài frontend của repo này gọi `.../checkpoints` với một value đã xoá không? | TBD (PM/Tech Lead) | Open — không thể verify chỉ từ repo này |
| Lỗi `422` khi gửi checkpoint đã xoá có cần message rõ nghĩa hơn lỗi enum chung của FastAPI không? | TBD | Open |

## 15. Approval

| Role | Name | Status | Date |
|---|---|---|---|
| Tech Lead | TBD | Pending | |
| QA | TBD | Pending | |
| PM | | Pending | |
