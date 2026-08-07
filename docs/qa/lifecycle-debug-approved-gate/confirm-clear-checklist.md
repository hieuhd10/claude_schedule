# Confirm/Clear Checklist — Lifecycle Debug-Approved Gate + Checkpoint Narrowing

> Tất cả item liên quan phải là **Confirmed** hoặc ghi rõ `N/A`. Cột **AI Suggestion** chỉ là gợi ý tham khảo cho item chưa `Confirmed` — không phải Evidence, không tự động đổi Status, luôn cần người (Tech Lead/Dev) xác nhận hoặc bác bỏ trước khi item được coi là chốt.

| # | Item | Status | Evidence / Decision | AI Suggestion (nếu chưa Confirmed) | Owner |
|---:|---|---|---|---|---|
| 1 | Auth model | Confirmed (N/A với diff này) | GitHub PAT qua `GITHUB_TOKEN` ở server (`src/claude_schedule/settings.py:9`); app không có session/JWT/OAuth cho end-user. Không đổi bởi diff này. | — | — |
| 2 | Role/RBAC matrix | Confirmed (N/A với diff này) | Tool chỉ dùng cho một operator, không có role theo user. Gate duy nhất là repository allow-list (`settings.py: repository_is_allowed`, `api/deps.py: ensure_repository_allowed`), không liên quan tới checkpoint. | — | — |
| 3 | Rate limit | Confirmed (N/A với diff này) | App không tự áp rate limit lên endpoint của mình; lỗi 429 của GitHub được pass through nguyên bản (`github/client.py:118`). Diff này không thêm call ra ngoài hay traffic pattern mới. | — | — |
| 4 | Retry policy | Confirmed (N/A với diff này) | Chỉ thử 1 lần, không retry khi fail; timeout qua `settings.github_api_timeout_seconds` (default 15s, `github/client.py`). Không đổi bởi diff này. | — | — |
| 5 | Test seed và cleanup | Confirmed (N/A) | Test dùng fake in-memory (`fake_service` trong `tests/api/test_routes.py`; fixture pure-function trong `tests/lifecycle/test_engine.py`). Không có DB, không cần seed/cleanup. | — | — |
| 6 | Base URL/environments | Confirmed (N/A) | Route test chạy in-process qua FastAPI `TestClient` (`tests/api/test_routes.py`); không có base URL riêng theo environment cho feature này. | — | — |
| 7 | Idempotency | **Open** | `post_checkpoint` (`api/routes.py:150-162`) không có idempotency key/dedupe check — double-click sẽ post hai comment `[LIFECYCLE:DEBUG_APPROVED]` giống nhau. Hành vi có từ trước, không phải do diff này gây ra. | Vì đây là một click thủ công, không có bước confirm/cancel (theo `docs/issue-lifecycle-flow.md` §8.6), và comment duplicate chỉ tốn kém ở mức cosmetic, đề xuất **accept as-is** (YAGNI) trừ khi có report thật về duplicate-click; nếu sau này cần fix, guard rẻ nhất là disable button ngay sau click đầu ở client-side, không cần dedupe ở server. | PM / Tech Lead |
| 8 | Endpoint/job timeout | Confirmed (N/A với diff này) | `github_api_timeout_seconds` default 15s áp dụng đồng nhất cho mọi call GitHub (`settings.py`); không đổi bởi diff này. | — | — |
| 9 | Webhook sync/async | Confirmed (N/A) | App không có webhook nào; frontend poll `GET .../issue_number` một cách synchronous (`docs/issue-lifecycle-flow.md` §9). | — | — |
| 10 | Frontend router/render type | Confirmed (N/A) | Thay đổi `Checkpoint` chỉ là rút gọn TS union, không ảnh hưởng routing/render-mode. Không có router library trong dependency của `frontend/package.json` — chỉ là React SPA thuần. | — | — |

## Blocking Questions

- Có consumer nào ngoài frontend của repo này gọi `POST .../checkpoints` với một trong bốn value đã xoá (`PR_READY_FOR_REVIEW`/`REVIEW_CONFIRMED`/`TEST_CONFIRMED`/`PR_MERGED`) không? Không thể verify chỉ từ repo này — cần Tech Lead/PM confirm trước khi coi breaking contract change này là an toàn để ship.
- Có ticket/ID thật để gắn vào thay đổi này cho traceability không? Không tìm thấy trong `gh issue list`.

## Result

- [x] Ready for Test Strategy
- [ ] Blocked

Không có item Open nào ở trên block việc test design — item 7 là risk đã biết, được accept, không block, đang chờ quyết định của PM/Tech Lead, không phải fact còn thiếu.

Reviewed by: [Tech Lead] / [QA]
Date: 2026-08-04
