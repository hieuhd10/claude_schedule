# Runbook: xử lý một Issue từ tạo đến đóng

Quy trình thao tác trên workspace, viết lại từ một lần chạy thật đầu-cuối trên Issue #26 (2026-08-09).

Ba tài liệu, ba mục đích khác nhau:

| Tài liệu | Trả lời câu hỏi |
| --- | --- |
| `docs/issue-lifecycle-flow.md` | Engine suy luận stage như thế nào |
| `docs/issue-lifecycle-runbook.md` (file này) | Operator phải làm gì, theo thứ tự nào |
| `plans/reports/e2e-lifecycle-run-260809-1629-*.md` | Lần chạy ngày 09/08 diễn ra ra sao, bằng chứng đâu |

## Chuẩn bị

```bash
.venv/bin/uvicorn claude_schedule.main:app --port 8000
cd frontend && npm run dev
```

`.env` cần `GITHUB_OWNER`, `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `OPERATOR_GITHUB_USERNAME`. Nếu Vite nhảy sang cổng khác (5173/5174 bận), thêm cổng đó vào `CORS_ORIGINS` — truyền qua biến môi trường khi chạy uvicorn là đủ, không cần sửa `.env`.

Muốn Claude trả lời được thì repo phải có `.github/workflows/claude.yml` và secret `CLAUDE_CODE_OAUTH_TOKEN`.

## Tổng quan 6 bước

| Step | Thao tác trên màn hình | Điều kiện để đi tiếp |
| --- | --- | --- |
| Debug | Comment tay và/hoặc Ask Claude, rồi **Approve Debug And Start Fix** | Có root cause + checkpoint approval |
| Fix | Ask Claude implement, hoặc **Create Pull Request** / **Link** PR có sẵn | PR được link vào Issue |
| Review | Comment tay và/hoặc Ask Claude trên PR | `REVIEW PASSED` đứng riêng một dòng |
| Test | Comment tay và/hoặc Ask Claude trên PR | `TEST PASSED` riêng một dòng **và** mọi check green |
| Ready to Merge | **Merge Pull Request** → Confirm | PR merged |
| Completed | **Close Issue** → Confirm | Issue closed |

Stage không lưu trong database. Mỗi lần load, backend dựng lại từ Issue state, linked PR, comments và check-runs. Bỏ dở giữa chừng rồi quay lại sau vẫn đúng stage.

## Step 1 — Tạo Issue

**Report a new Issue (QA)** → điền form.

- `Base branch` là nhánh fix sẽ nhắm tới. Điền đúng nhánh đang chứa code lỗi, không mặc định là nhánh default của repo. Giá trị này thành label `base:<branch>` và là thứ quyết định PR merge vào đâu.
- `Steps to Reproduce` / `Expected Result` / `Actual Result` là bắt buộc và là phần Claude đọc để tìm root cause. Reproduce được trước khi tạo issue thì phần Debug nhanh hơn nhiều.

Tạo xong, workspace vào **Debug — Step 1 of 6**.

> **Bẫy:** nếu body issue chứa chuỗi `@claude` (kể cả khi chỉ trích dẫn), workflow Claude sẽ chạy ngay lúc tạo issue.

## Step 2 — Debug

Hai lựa chọn, dùng được cả hai và dùng bao nhiêu lần cũng được:

- **Manual comment** — ghi điều tra của mình. Không đổi stage.
- **Ask Claude** — prompt `@claude` soạn sẵn, **sửa được trước khi gửi**. Sau khi gửi, UI vào trạng thái chờ và poll GitHub.

Sửa prompt là việc nên làm, không phải tuỳ chọn: prompt mặc định không nói cho Claude biết nó phải đọc nhánh nào.

Có kết quả rồi thì bấm **Approve Debug And Start Fix**. Nút này post checkpoint `[LIFECYCLE:DEBUG_APPROVED]` lên Issue.

> **Bẫy:** engine tìm marker `[LIFECYCLE:DEBUG_APPROVED]` ở **bất kỳ vị trí nào** trong body comment. Viết nguyên văn chuỗi đó trong một comment mô tả sẽ bị tính là phê duyệt thật và flow nhảy sang Fix. Nếu lỡ, xoá comment đó trên GitHub rồi load lại issue.

## Step 3 — Fix

Ba đường, chọn theo tình huống:

1. **Ask Claude** implement → Claude tự mở PR. Prompt phải nêu rõ nhánh base, phạm vi sửa và test cần thêm.
2. **Create Pull Request** — chọn fix branch trong ô có gợi ý, base lấy từ label `base:` của issue. Dùng khi tự code hoặc khi Claude chỉ push nhánh mà không mở PR.
3. **Link** — nhập số PR đã mở sẵn ngoài flow.

PR do form này tạo mang `Closes #<issue>`, nên merge sẽ tự đóng issue. PR chỉ *link* bằng comment thì không, phải bấm Close Issue riêng.

Có PR đang open → stage **Review**.

## Step 4 — Review

Post trên PR (không phải trên Issue). Kết quả được ghi nhận khi có dòng riêng:

```text
REVIEW PASSED
```

hoặc `REVIEW FAILED`. Marker nằm giữa câu không tính — nhờ vậy prompt "hãy trả lời REVIEW PASSED hoặc REVIEW FAILED" không bị nhầm thành kết quả.

`REVIEW FAILED` giữ nguyên stage Review; sửa xong thì post command review mới.

## Step 5 — Test

Tương tự, marker `TEST PASSED` / `TEST FAILED` trên PR.

Ready to Merge cần **cả hai**: marker `TEST PASSED` và mọi check-run của PR có conclusion `success`, `neutral` hoặc `skipped`. Không có check nào → không đủ, vẫn ở Test.

> **Bẫy:** hiện repo không có workflow nào chạy `pytest`/`ruff`/`mypy`. Check duy nhất trên PR là job AI review. Điều kiện "CI checks green" xanh **không** chứng minh test đã chạy. Marker `TEST PASSED` do người post sau khi chạy tay là bằng chứng test duy nhất trong flow.

## Step 6 — Ready to Merge và Completed

**Merge Pull Request** → chọn merge method → **Confirm Merge**.

- Merge method mặc định là squash. Chọn "Create a merge commit" nếu muốn giữ lại từng commit — hữu ích khi commit của AI và commit sửa tay cần phân biệt được trong history.
- GitHub từ chối merge (conflict, branch protection) → `409 MERGE_NOT_ALLOWED`, stage không đổi, xử lý rồi thử lại.

Merge xong mà issue chưa đóng → vẫn ở Ready to Merge, chỉ còn **Close Issue** → **Confirm Close**.

Issue closed → **Completed**, 6/6 step. Tab **QA Report** tổng hợp bug description, root cause, fix record và test verification.

## Giao việc cho Claude: kiểm lại những gì

Từ lần chạy #26. Claude tìm root cause chính xác ngay lần đầu và tự từ chối post marker nó không kiểm chứng được — nhưng ba loại lỗi sau đều phát biểu bằng giọng chắc chắn, không kèm dấu hiệu ngờ vực:

| Kiểm gì | Vì sao |
| --- | --- |
| **Nhánh nó thực sự đọc** | Workflow checkout `fetch-depth: 1` trên nhánh default. Claude khẳng định đã đọc nhánh được chỉ định, nhưng trích dẫn số dòng của nhánh default; nó còn suy ra nhánh base "đã bị xoá" từ lịch sử shallow. Đối chiếu 1-2 trích dẫn với file thật là đủ phát hiện. |
| **PR có thật sự tồn tại** | Nó tick "Open Pull Request" là done trong khi chỉ push nhánh và để lại link compare. Kiểm bằng `gh pr list` hoặc nhìn ô PULL REQUEST trên màn hình. |
| **Kết quả test là chạy thật hay suy luận** | Trong sandbox của Action, mọi lệnh interpreter đều bị chặn. Mọi thứ Claude nói về test là trace bằng tay trừ khi có log thật. |
| **Lý lẽ của fix, không chỉ kết quả** | Fix của nó có thể đúng cho case trong issue mà sai cho case đối xứng. Ở #26, luật phân loại của nó dựa trên giả định "test command không có lý do gì nhắc tới review" — giả định đó vỡ ngay trong chính comment thread của PR nó tạo. |

Prompt được sửa trước khi gửi, nên nói thẳng những ràng buộc này trong prompt rẻ hơn là sửa hậu quả: nhánh nào, sửa ở tầng nào, test nào phải thêm, và "nếu không chạy được test thì nói thẳng, đừng post marker".

## Ví dụ đã chạy

Issue [#26](https://github.com/hieuhd10/claude_schedule/issues/26) → PR [#27](https://github.com/hieuhd10/claude_schedule/pull/27), 51 phút, đầy đủ ảnh từng bước trong `plans/reports/e2e-lifecycle-run-260809-1629-issue-26-review-command-invalidation-report.md`.
