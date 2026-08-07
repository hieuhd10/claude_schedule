# Spec Overview — Lifecycle Debug-Approved Gate + Checkpoint Narrowing

> Bản nháp ngắn do Tech Lead tạo trước khi hoàn thiện `spec.md`.

| Item | Detail |
|---|---|
| Ticket / PRD | Không có ticket chính thức. Lấy nguồn từ working-tree diff chưa commit trên branch `docs/report-step-evidence` (file: `src/claude_schedule/lifecycle/{models.py,engine.py}`, `src/claude_schedule/api/routes.py`, `frontend/src/api/types.ts`) cộng với `docs/issue-lifecycle-flow.md` đã được cập nhật sẵn (untracked). Không tìm thấy issue number nào trên GitHub khớp với thay đổi này (đã check issue #3–#18). |
| Owner | TBD — Tech Lead assign |
| Target release | TBD — dự kiến merge vào `feature/test-routine` |
| Status | Draft |

## Goal

Đóng lỗ hổng lifecycle-inference: một Issue có linked Pull Request đang mở (được cross-reference vào) có thể đi tới Review/Test/Ready-to-Merge mà operator chưa từng approve kết quả Debug — và, vì chỉ duy nhất một checkpoint (`DEBUG_APPROVED`) từng có UI trigger, xoá bốn checkpoint value không dùng tới (`PR_READY_FOR_REVIEW`, `REVIEW_CONFIRMED`, `TEST_CONFIRMED`, `PR_MERGED`) cùng logic routing PR-vs-issue/`404 PR_NOT_FOUND` chỉ tồn tại để phục vụ chúng.

## Main Flow

1. Operator (hoặc Claude) debug Issue qua comment — stage chưa đổi.
2. Operator submit checkpoint action "Approve Debug" cho Issue → hệ thống ghi lại approval dưới dạng comment trên thread **Issue** (luôn là issue, không bao giờ là Pull Request).
3. Ở lần check status kế tiếp, việc đánh giá Review/Test/Ready-to-Merge cho một linked Pull Request đang mở chỉ chạy khi đã có Debug approval được ghi nhận trên Issue; nếu chưa, bất kể kết quả review/test trên Pull Request là gì, stage vẫn giữ ở Debug/Fix.
4. Tập approval type mà frontend và backend chấp nhận được rút gọn về đúng một type đó.

## Scope

### In Scope
- Checkpoint contract (frontend + backend) được rút gọn về một approval type duy nhất, "Approve Debug".
- Checkpoint comment luôn post vào Issue; PR-comment target và error case "không có linked PR" bị xoá.
- Một linked Pull Request đang mở chỉ đưa Issue tiến vào Review/Test/Ready-to-Merge khi đã có Debug approval được ghi nhận — đây là precondition mới, nằm trên thứ tự Review-trước-Test-trước-Ready đã có sẵn.
- Regression test được cập nhật để assert cả case bị chặn (gated) và case không bị chặn (ungated) (xem Technical Notes trong spec.md để biết implementation pointer).

### Out of Scope
- Không thêm approval type mới.
- Không có khả năng merge Pull Request trong app (không đổi — vẫn chỉ làm trên GitHub).
- Không đổi cách nhận diện Review/Test result marker, cách đánh giá CI check "green", hay cách parse Claude response.
- Không đổi auth/RBAC, retry, hay idempotency (gap có từ trước, không phải do thay đổi này gây ra).

## Constraints

- Stack/module: backend FastAPI + Pydantic (`src/claude_schedule/lifecycle`, `src/claude_schedule/api`), frontend React 19 + TypeScript (`frontend/src/api/types.ts`). Test: pytest/pytest-asyncio (backend), vitest (frontend).
- Compatibility: **Breaking API contract change.** Caller nào còn post `PR_READY_FOR_REVIEW`/`REVIEW_CONFIRMED`/`TEST_CONFIRMED`/`PR_MERGED` sẽ nhận lỗi `422` schema-validation chung, thay vì được route tới PR (hoặc `404 PR_NOT_FOUND` nếu không có PR liên kết). Đã verify frontend hiện tại không còn reference nào tới các literal đã xoá (`grep` trong `frontend/src`) và `tsc -b` sạch.
- Deadline/dependency: không có.

## Raw Acceptance Criteria

- [ ] Checkpoint API chỉ chấp nhận approval type "Approve Debug"; bốn type đã retired bị reject (422), không route đi đâu cả.
- [ ] Checkpoint comment luôn được post vào Issue, không bao giờ vào Pull Request.
- [ ] Có linked Pull Request đang mở + chưa ghi nhận Debug approval → stage vẫn giữ ở Debug, kể cả khi Pull Request đã có review/test result pass và check xanh.
- [ ] Có linked Pull Request đang mở + đã ghi nhận Debug approval → việc đánh giá Review/Test/Ready-to-Merge chạy đúng như trước khi có thay đổi này.
- [ ] Issue đã closed luôn resolve về Completed, không bị ảnh hưởng bởi thay đổi này (đã verify: điều kiện closure được đánh giá với priority cao hơn approval gate).

## Open Questions

- Có ticket/issue number thật để file thay đổi này vào, phục vụ traceability không? (Không tìm thấy trong `gh issue list`.)
- Có consumer nào ngoài frontend của repo này gọi `POST .../checkpoints` với một trong bốn value đã xoá không? Cần con người/PM confirm — không thể verify chỉ từ repo này.
- Lỗi 422 khi gửi checkpoint đã xoá có cần message rõ nghĩa hơn (ví dụ "checkpoint no longer supported") thay vì lỗi enum-validation chung của FastAPI không? Hiện tại đang là lỗi chung.
