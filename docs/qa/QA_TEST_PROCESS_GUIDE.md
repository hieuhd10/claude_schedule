# QA Test Process Guide

> **Owner & Maintenance:** Tech Lead sở hữu tài liệu này. Thay đổi field/step (thêm/bớt/sửa) phải được Tech Lead duyệt trước khi áp dụng — không tự chế rồi âm thầm làm khác (xem mục 7 bên dưới). Log thay đổi lớn (thêm/bớt phase, đổi threshold mặc định) vào cuối file này, mục **Changelog**.

Quy trình test chuẩn cho toàn bộ organization, dựng trên framework **ClaudeKit Engineer v2.19.2-beta.31**. Tài liệu này tự đủ — không cần đọc thêm docs của ClaudeKit để áp dụng.

Apply được cho bất kỳ project nào (Python/Django, JS/TS, mobile...). Copy tài liệu này vào `docs/qa-test-process-guide.md` của project, **và bắt buộc copy kèm 5 thư mục skill** `.claude/skills/qa-spec/`, `.claude/skills/qa-test-design/`, `.claude/skills/qa-bug/`, `.claude/skills/qa-report/`, `.claude/skills/qa-go-no-go/` (org skill, không thuộc ClaudeKit gốc) — thiếu skill thì mọi lệnh `/ck:qa-*` trong guide sẽ fail ngay bước đầu. Rồi tạo các file output theo từng phase.

### Ví dụ end-to-end thật (tham khảo khi mới bắt đầu)

Feature `MPF_023_GBP_Report` trong chính repo này đã chạy trọn Phase 1→4 + bug track, dùng làm mẫu tham khảo khi chưa hình dung được toàn cảnh:
- Phase 1: `docs/MPF_023_GBP_Report/spec/` (spec-overview, spec, confirm-clear-checklist, test-strategy)
- Phase 2: `docs/MPF_023_GBP_Report/test-design/` (scenario, tc-matrix, entry-criteria-checklist, postman-collection/environment)
- Phase 3: `docs/MPF_023_GBP_Report/execution/REPORT-2026-07-29-MPF_023_GBP_Report.md`
- Bug track: `docs/MPF_023_GBP_Report/execution/bugs/BUG-20260729-00{1..7}.md`
- Phase 4: `docs/MPF_023_GBP_Report/execution/QA_REPORT_FINAL_2026-07-29.md`, `decision-log.md`, `go-no-go-checklist.md`

## How to use this guide (dành cho QA mới)

1. Đọc **Section 1 — Quick Start** để nắm toàn bộ flow trong 5 phút.
2. Khi bắt đầu 1 feature/task mới → vào **Phase 1 (Spec)**, làm tuần tự qua Phase 2 → 3 → 4.
3. Khi cần điền 1 file cụ thể (vd `spec.md`) → nhảy thẳng tới **Section 7 — Appendix Templates**, copy template + xem example, điền theo project thật.
4. Khi phát hiện bug bất kỳ lúc nào (không chỉ ở Phase 3) → rẽ sang **Section 6 — Bug Track**, không chờ hết phase.
5. Không biết lệnh nào chạy việc gì → tra **Section 8 — Tool Mapping** và **Section 9 — Command Reference**.
6. Không hiểu thuật ngữ (TC, UC, flaky, P0...) → tra **Section 10 — Glossary**.
7. Nguyên tắc chung: **không tự chế thêm field/step ngoài guide này**. Nếu project cần thêm, bổ sung vào guide trước, đừng làm khác đi rồi không ai theo kịp.

---

## 0. Prerequisites (check trước khi vào Phase 1)

- [ ] 5 org skill `qa-spec`/`qa-test-design`/`qa-bug`/`qa-report`/`qa-go-no-go` đã có trong `.claude/skills/` của project (xem note copy ở trên).
- [ ] CLI test tool đã cài theo stack project: Newman (`npm i -g newman`), Playwright (`npx playwright install`), k6 (nếu có perf/load), coverage tool (`pytest-cov` hoặc `--coverage` tuỳ stack) — xem lệnh cụ thể ở §9.
- [ ] Có quyền truy cập môi trường test/staging (base URL, DB test riêng để chạy Gate 2-3 và cleanup).
- [ ] Ticket/PRD gốc đã có trên Jira/Linear (input cho Phase 1).

Thiếu mục nào thì báo Tech Lead trước khi bắt đầu — đừng chạy `/ck:qa-spec` rồi mới phát hiện thiếu tool.

---

## 1. Quick Start

### Flowchart chính — 4 phase tuần tự

```
┌───────────┐     ┌────────────────┐     ┌────────────────┐     ┌──────────────────────┐
│  PHASE 1  │ ──▶ │    PHASE 2     │ ──▶ │    PHASE 3     │ ──▶ │       PHASE 4         │
│   Spec    │     │  Test Design   │     │   Execution    │     │  Review / Go-No-Go    │
└───────────┘     └────────────────┘     └────────────────┘     └───────────────────────┘
Tech Lead viết      QA sinh scenario/TC     QA chạy Gate 0-3      Tech Lead/PM/QA quyết
spec + checklist    + chuẩn bị data/API     + thu metrics          định Go/No-Go/Rework
```

### Track riêng — Bug (chạy song song, không phải bước tuần tự)

```
Bug Found ──▶ Log (BUG-{id}.md) ──▶ Triage (severity+owner) ──▶ Fix ──▶ Regression (TC liên quan) ──▶ Review (close/reopen)
```

Bug track có thể bắt đầu từ bất kỳ phase nào (kể cả Phase 3/4 phát hiện lại quay về Fix rồi mới quay lại Execution).

### Role matrix — ai làm gì mỗi phase

| Phase | QA | Dev | PM | Tech Lead | Code Reviewer |
|---|---|---|---|---|---|
| 1. Spec | Xác nhận scope + corner case (1.3) | Tham vấn kỹ thuật nếu được hỏi | Phê duyệt priority P0-P3 (1.5) | Điền spec.md + checklist (1.1, 1.2), chốt test strategy (1.4) | — |
| 2. Test Design | Chủ trì toàn bộ (2.1-2.6) | Review test data/API contract nếu cần | — | Review scenario Critical/High | — |
| 3. Execution | Chủ trì toàn bộ (3.1-3.7) | Fix bug phát sinh, hỗ trợ debug | Theo dõi nếu block release | Hỗ trợ nếu cần escalate | — |
| 4. Review/Go-No-Go | Gửi QA Report (4.1), input quyết định (4.4) | Fix nếu No-Go/Rework | Kiểm tra blocker (4.3), quyết định cuối | Quyết định cuối (4.4) | Review diff+coverage (4.2) |
| Bug Track | Log, verify fix, chạy regression | Fix | Track SLA nếu P0/P1 (xem bảng SLA ở §6) | Triage severity nếu tranh cãi | — |

**Code Reviewer** (4.2) mặc định là Tech Lead hoặc senior dev không tham gia implement feature đó (tách người viết code và người review) — chạy `/ck:code-review`, có thể dùng agent `code-reviewer`. Nếu team nhỏ không tách được người, Tech Lead tự đóng vai này nhưng phải ghi rõ trong `decision-log.md`.

### Template index — toàn bộ file cần tạo

| # | File | Tạo ở Phase | Template ở | Sinh bằng skill |
|---|---|---|---|---|
| 0 | `spec-overview.md` | 1 | §7.A0 | `/ck:qa-spec` |
| 1 | `spec.md` | 1 | §7.A | `/ck:qa-spec` |
| 2 | `confirm-clear-checklist.md` | 1 | §7.B | `/ck:qa-spec` |
| 3 | `test-strategy.md` | 1 | §7.C | `/ck:qa-spec` |
| 4 | `scenario-{feature}-{date}.md` | 2 | §7.D | `/ck:qa-test-design` (gọi `/ck:scenario` bên trong, sau đó distill sang format §7.D) |
| 5 | `tc-matrix.md` | 2 | §7.E | `/ck:qa-test-design` |
| 6 | `tests/fixtures/factories/*`, `seed.*`, `auth.*` | 2 | — (code, không phải markdown; xem §2 Process 2.4) | `/ck:qa-test-design` |
| 7 | `postman-collection.json` + `postman-environment.json` | 2 | §7.G | `/ck:qa-test-design` |
| 8 | `entry-criteria-checklist.md` | 2 | §7.F | `/ck:qa-test-design` |
| 9 | `REPORT-{date}-{scope}.md` | 3 | §7.I | `/ck:qa-report` (sau khi `/ck:test`/`/ck:web-testing` chạy xong) |
| 10 | `BUG-{id}.md` | Bug Track | §7.H | `/ck:qa-bug` |
| 10b | `FLAKY-{id}.md` | Bug Track | §7.H2 | `/ck:qa-bug` |
| 11 | `QA_REPORT_FINAL_{date}.md` | 4 | §7.I2 | `/ck:qa-go-no-go` |
| 12 | `decision-log.md` | 4 | §7.J | `/ck:qa-go-no-go` |
| 13 | `go-no-go-checklist.md` | 4 | §7.K | `/ck:qa-go-no-go` |
| 14 | `tests/docs/runbook.md` | Một lần/project, tham chiếu xuyên suốt | §7.L | — (viết tay 1 lần, không phải skill output) |

Đặt toàn bộ file markdown ở `docs/qa/<feature>/` hoặc `plans/<feature>/` tùy convention project; file test-data/Postman đặt trong `tests/` của source code.

---

## 2. Phase 1 — Spec

**Goal:** Chốt phạm vi, ràng buộc kỹ thuật, và chiến lược test trước khi viết bất kỳ dòng code/test nào — tránh việc phải test lại vì hiểu sai scope.

### Input
- Product spec gốc (ticket Jira/Linear hoặc PRD) + acceptance criteria từ PM/BA.
- Template `spec-overview.md` (§7.A0), `spec.md` (§7.A) và `confirm-clear-checklist.md` (§7.B) — rỗng, Tech Lead điền.

### Process
> Có thể chạy skill `/ck:qa-spec "<feature>"` để tự động hóa bước 1.0-1.4 (sinh 4 file spec-overview/spec/checklist/test-strategy) — vẫn cần người xác nhận step 1.3 và 1.5.

0. **1.0 — Tech Lead điền `spec-overview.md`**: bản nháp ngắn (§7.A0) — Goal, Main Flow, Scope, Constraints, Raw Acceptance Criteria, Open Questions — trước khi mở rộng thành `spec.md` đầy đủ.
1. **1.1 — Tech Lead điền `spec.md`**: copy template §7.A (15 mục: General Info, Goal, User Stories, Scope, Main Flow, Requirements, Business/Validation Rules, Technical Notes, NFR, Acceptance Criteria, Test Data/Environment, Dependencies/Risks, Rollback Plan, Open Questions, Approval). Không để trống mục nào — mục không áp dụng thì ghi rõ "N/A — lý do" hoặc `TBD` kèm owner.
2. **1.2 — Tech Lead điền Confirm/Clear checklist**: 10 mục kỹ thuật (§7.B) — auth model, RBAC, rate limit, retry policy, test seed/cleanup, base URL/env, idempotency, endpoint/job timeout, webhook sync/async, frontend router/render type. Mỗi mục phải có Evidence/Decision (link code/doc/Slack), không được để Status "Confirmed" mà không có Evidence. Mục nào còn `Open` thì điền thêm cột **AI Suggestion** (gợi ý tham khảo, không phải Evidence — Tech Lead vẫn phải chấp nhận/bác bỏ, không tự động chuyển Status). Chốt Result: `Ready for Test Strategy` hoặc `Blocked`.
3. **1.3 — QA xác nhận scope + corner case**: đọc spec.md + checklist, hỏi lại Tech Lead nếu thấy mơ hồ. Chạy `/ck:scenario "<feature>"` (one-shot, hoặc `--saturation` nếu feature rủi ro cao/phức tạp) để sinh corner case sớm — kết quả này sẽ nuôi Phase 2, chưa cần đầy đủ ở bước này.
4. **1.4 — Chốt Test Strategy**: chọn model (Pyramid/Trophy/Honeycomb — xem tiêu chí chọn ở §7.C), chốt coverage threshold, tool per layer, Entry/Exit Criteria (đã gộp trực tiếp vào `test-strategy.md` mục 6-7, không tách file riêng). Ghi vào `test-strategy.md` (§7.C).
5. **1.5 — PM phê duyệt priority**: PM gán P0-P3 cho từng FR/AC dựa trên spec.md đã điền, ký ở bảng Approval (mục 15). P0/P1 bắt buộc coverage cao hơn P2/P3 (xem ngưỡng ở test-strategy.md).

### Output (bắt buộc)
- `spec-overview.md` — bản nháp đã điền, không để trống mục nào không giải thích.
- `spec.md` — đã điền đủ 15 mục, không còn mục trống không giải thích.
- `confirm-clear-checklist.md` — 10/10 mục Confirmed/Open-với-owner, Result đã chốt.
- `test-strategy.md` — có model, ratio, coverage targets, tool, Entry/Exit Criteria.
- `/ck:scenario` one-shot report (nếu chạy ở bước 1.3) — không bắt buộc phải đầy đủ, sẽ hoàn thiện ở Phase 2.

### Checklist (Exit Phase 1)
- [ ] spec.md đủ 15 mục, acceptance criteria dạng đo được (không mơ hồ kiểu "hoạt động tốt")
- [ ] Confirm/Clear checklist Result = `Ready for Test Strategy` (không phải `Blocked`)
- [ ] Test strategy đã chọn model + coverage threshold, không để `__%` chưa điền
- [ ] Bảng Approval trong spec.md có PM ký (không bị bỏ trống âm thầm)
- [ ] QA đã đọc và không còn câu hỏi mở về scope

### Common Pitfalls
- Bỏ qua Confirm/Clear checklist vì "chắc không cần" → thường lộ ra ở Phase 3 dưới dạng bug môi trường (sai base URL, quên rate limit) tốn thời gian hơn nhiều so với hỏi trước.
- Acceptance criteria viết mơ hồ ("UX mượt", "nhanh") → không map được sang TC đo được ở Phase 2. Luôn viết dạng Given-When-Then hoặc số liệu cụ thể.
- Chốt Test Strategy sau khi đã bắt đầu viết test → phải làm lại ratio/tool stack, lãng phí.

---

## 3. Phase 2 — Test Design

**Goal:** Biến acceptance criteria + scenario thành test case cụ thể, có ID, có data, sẵn sàng để chạy — không còn phải suy nghĩ "test cái gì" khi vào Execution.

### Input
- `spec.md` + `test-strategy.md` (từ Phase 1) + scenario report (one-shot hoặc saturation).

### Process
> Có thể chạy skill `/ck:qa-test-design "<feature>" [--iterations N | --saturation]` để tự động hóa toàn bộ bước 2.1-2.6 (gọi `/ck:scenario` bên trong).

1. **2.1 — Sinh UC/flow/edge case/severity**: chạy `/ck:scenario "<feature>"` đầy đủ (one-shot cho feature nhỏ/P2-P3, `--saturation` cho feature lớn/P0-P1 hoặc rủi ro cao). Lưu kết quả vào `scenario-{feature}-{date}.md` (§7.D).
2. **2.2 — Map scenario → TC-ID**: mỗi row Critical/High/Medium bắt buộc có ít nhất 1 TC; Low tùy priority P0-P3 mà quyết định có cần TC riêng hay gộp. Điền `tc-matrix.md` (§7.E).
3. **2.3 — Phân loại test type**: mỗi TC gán 1 type — Unit / Integration / E2E / API / A11y / Perf — theo ratio đã chốt ở test-strategy.md.
4. **2.4 — Chuẩn bị test data**: factories (tạo entity hợp lệ tối thiểu), seed script (data nền cho integration/E2E), auth helper (login/token cho các role trong RBAC matrix). Đặt tại `tests/fixtures/factories/`, `tests/fixtures/seed.*`, `tests/fixtures/auth.*` — quy ước đặt tên/ngôn ngữ theo stack project (xem §9).
5. **2.5 — Khởi tạo Postman collection v2.1**: theo cấu trúc §7.G — 4 folder Auth/Happy Path/Edge Cases/Error Cases, pre-request script auto-set token, `pm.test` cho mỗi request, export `postman-collection.json` + `postman-environment.json`.
6. **2.6 — Entry criteria checklist**: điền `entry-criteria-checklist.md` (§7.F) trước khi cho phép bắt đầu Phase 3 — mục nào không đạt ghi vào bảng Exceptions (reason/risk/approver), chốt Decision `Ready for Execution` hoặc `Blocked`.

### Output (bắt buộc)
- `scenario-{feature}-{date}.md`
- `tc-matrix.md`
- `tests/fixtures/factories/*`, `tests/fixtures/seed.*`, `tests/fixtures/auth.*`
- `postman-collection.json` + `postman-environment.json`
- `entry-criteria-checklist.md`

### Checklist (Exit Phase 2)
- [ ] 100% scenario Critical/High có TC map, không có TC "mồ côi" (không trace được về scenario/UC nào)
- [ ] tc-matrix.md không có ô Type/Priority/Precondition bỏ trống
- [ ] Factories/seed/auth chạy được độc lập (không phụ thuộc thứ tự chạy ngẫu nhiên)
- [ ] Postman collection import được, `pm.test` không đỏ khi chạy thử với happy path
- [ ] entry-criteria-checklist.md Decision = `Ready for Execution`

### Common Pitfalls
- Viết TC trực tiếp từ trí nhớ, bỏ qua scenario report → mất coverage với case Critical đã tìm được ở `/ck:scenario`.
- Test data hard-code giá trị cụ thể (email, id) → conflict khi chạy song song hoặc chạy lại. Luôn dùng factory sinh giá trị unique.
- Postman collection không có `pm.test` — chỉ có request mà không có assertion thì Newman ở Phase 3 chỉ báo "200 OK" chứ không xác nhận đúng field/logic.

---

## 4. Phase 3 — Test Execution

**Goal:** Chạy toàn bộ test đã thiết kế, thu metrics khách quan, và tạo report làm căn cứ cho quyết định Go/No-Go.

### Input
- `tc-matrix.md` + `entry-criteria-checklist.md` đã pass 100%.

### Process
> Bước 3.1-3.5 chạy bằng `/ck:test`/`/ck:web-testing` (không phải skill mới). Sau khi có kết quả thô, chạy skill `/ck:qa-report "<feature>" "<scope>"` để tự động hóa bước 3.6-3.7 (parse kết quả → REPORT + cleanup log) — skill này không tự chạy test.

1. **3.1 — Pre-flight checks**: lint, typecheck, build — fail bất kỳ bước nào thì dừng lại, không chạy test suite phía sau (xem lệnh cụ thể ở §9).
2. **3.2 — Chạy suite theo Gate 0→1→2→3**: Gate 0 = Static (lint/typecheck) → Gate 1 = Unit → Gate 2 = Integration → Gate 3 = E2E. Gate sau chỉ chạy khi gate trước pass — không chạy song song bỏ qua thứ tự, vì E2E fail do lỗi unit-level sẽ lãng phí thời gian debug.
3. **3.3 — Chạy API test qua Newman**: `newman run postman-collection.json -e postman-environment.json`. Lưu report (`--reporters cli,json`).
4. **3.4 — Thu metrics**: coverage (line/branch/function), a11y (nếu có UI), perf/load (nếu P0/P1 hoặc feature chịu tải cao), security (nếu feature đụng auth/payment/PII — chạy `/ck:security`, xem §8).
5. **3.5 — Phân tích kết quả**: phân loại failed / flaky (fail không ổn định khi chạy lại) / slow (vượt ngưỡng thời gian) / skipped. Flaky đưa vào flaky track riêng (§6), không được lờ đi hay xóa test.
6. **3.6 — Xuất QA Report**: điền `REPORT-{date}-{scope}.md` (§7.I).
7. **3.7 — Cleanup test data**: xóa data đã seed/tạo trong quá trình test (đặc biệt trên môi trường shared/staging), ghi cleanup log vào cuối REPORT.

### Output (bắt buộc)
- Pass/fail result + coverage report (raw, đính kèm hoặc link CI artifact)
- `REPORT-{date}-{scope}.md`
- Screenshot/trace cho từng E2E failure
- Newman run evidence (JSON/HTML report)
- Cleanup log

### Checklist (Exit Phase 3)
- [ ] Gate 0-3 chạy đúng thứ tự, không skip gate nào mà không ghi lý do
- [ ] Không có failed test chưa phân loại nguyên nhân (bug thật vs flaky vs môi trường)
- [ ] Coverage đạt threshold đã chốt ở test-strategy.md, hoặc có lý do + owner nếu chưa đạt
- [ ] Mọi P0/P1 bug phát hiện đã có `BUG-{id}.md` tương ứng (§6)
- [ ] Test data đã cleanup, không để rác trên môi trường chung

### Common Pitfalls
- Chạy song song tất cả gate để "tiết kiệm thời gian" → khi E2E fail phải mò lại xem có phải do lỗi unit-level không, mất thời gian hơn chạy tuần tự.
- Đánh dấu flaky test là "pass" sau khi rerun mà không log lại → flaky tích lũy âm thầm, cuối cùng không ai tin suite nữa.
- Quên cleanup test data trên staging → data rác làm lệch báo cáo/analytics hoặc block test lần sau (unique constraint conflict).

---

## 5. Phase 4 — Review & Go/No-Go

**Goal:** Ra quyết định release có căn cứ (không phải cảm tính), và ghi lại quyết định + lý do để truy vết sau này.

### Input
- QA Report (`REPORT-{date}-{scope}.md`) + coverage + CI status.

### Process
> Có thể chạy skill `/ck:qa-go-no-go "<feature>" <report path>` để tự động hóa bước 4.1, 4.3, 4.4 (điền go-no-go-checklist.md, decision-log.md, QA_REPORT_FINAL) — bước 4.2 vẫn cần `/ck:code-review` và người quyết định thật nếu còn P0/P1 mở (skill không tự ý Go khi còn blocker).

1. **4.1 — Tester gửi QA Report** cho Tech Lead + PM (kèm link CI, coverage, bug list nếu có).
2. **4.2 — Code Reviewer kiểm tra diff + coverage**: chạy `/ck:code-review` trên diff liên quan, đối chiếu coverage report — không duyệt nếu coverage giảm so với threshold mà không có lý do.
3. **4.3 — PM kiểm tra blocker**: đối chiếu bug list với priority — còn P0/P1 bug mở là blocker mặc định.
4. **4.4 — Quyết định Go / No-Go / Rework**: dùng `go-no-go-checklist.md` (§7.K) làm căn cứ, không quyết định ngoài checklist. Ghi vào `decision-log.md` (§7.J).
5. **4.5 — Cập nhật docs** nếu có breaking change (API contract, DB schema, config) — theo quy tắc "chỉ update doc khi ảnh hưởng hành vi/setup/architecture/public contract", không thêm changelog noise cho thay đổi nội bộ thuần túy.

### Output (bắt buộc)
- `QA_REPORT_FINAL_{date}.md` — bản REPORT có thêm section signature (Tech Lead/PM/QA ký tên + ngày).
- `decision-log.md` — Go/No-Go/Rework + reason.
- Nếu Go: merge commit + deployment note.
- Nếu No-Go: bug list + owner + SLA cho từng bug.

### Checklist (Exit Phase 4)
- [ ] go-no-go-checklist.md đã điền đủ, không có mục "chưa rõ"
- [ ] decision-log.md có chữ ký/tên người quyết định + ngày
- [ ] Nếu No-Go/Rework: mỗi bug blocker có owner + deadline rõ ràng
- [ ] Docs đã update nếu có breaking change; nếu không có breaking change, ghi rõ "không cần update" thay vì im lặng bỏ qua

### Common Pitfalls
- Go/No-Go quyết định miệng qua chat, không ghi decision-log → không truy vết được lý do khi có sự cố sau release.
- Duyệt Go khi còn P0 mở với lý do "sẽ fix hotfix sau" mà không ghi rõ risk accepted + ai chịu trách nhiệm.
- Bỏ qua 4.5 (update docs) khi đổi API contract → team khác dùng doc cũ, lỗi tích hợp về sau.

---

## 6. Bug Track (song song)

Bug có thể phát hiện ở **bất kỳ phase nào** (kể cả lúc Dev tự test hoặc QA đang ở Phase 1). Track này chạy song song với 4 phase chính, không chờ đến Phase 3 mới log.

> Skill `/ck:qa-bug found "<mô tả>"` (log + triage) và `/ck:qa-bug fixed <BUG-id>` (chạy regression bắt buộc từ tc-matrix.md) tự động hóa toàn bộ track này — tự phân biệt Bug thật vs Flaky, không tạo `BUG-*.md` cho flaky.

### Bug lifecycle

```
Found ──▶ Log (BUG-{id}.md) ──▶ Triage (severity + owner) ──▶ Fix ──▶ Regression (chạy lại TC liên quan) ──▶ Review (Close / Reopen)
```

- **Found**: bất kỳ ai (QA/Dev/PM) phát hiện.
- **Log**: tạo `BUG-[YYYYMMDD]-NNN.md` (§7.H) ngay, kể cả khi chưa rõ root cause — Status bắt đầu `Open`, Root Cause/Fix điền sau.
- **Triage**: Tech Lead/QA gán severity theo thang **P0-P3** (P0 = release blocker; P1 = quan trọng, phải pass trừ khi accept risk; P2 = target pass rate ≥90%; P3 = có thể defer có ghi nhận — cùng thang với `test-strategy.md` Priority Rule, **không phải** thang Critical/High/Medium/Low của scenario) + owner.

**SLA mặc định theo severity** (giờ làm việc, không tính cuối tuần — điều chỉnh theo project trong `test-strategy.md` nếu cần, ghi rõ lý do nếu khác mặc định):

| Severity | Ack (Triage xong) | Fix xong | Ghi chú |
|---|---|---|---|
| P0 | ≤ 2h | ≤ 24h | Release blocker — escalate PM/Tech Lead ngay nếu quá hạn |
| P1 | ≤ 4h | ≤ 3 ngày | Trừ khi accept risk có ghi decision-log |
| P2 | ≤ 1 ngày | ≤ 1 sprint | — |
| P3 | Best-effort | Backlog, có ghi nhận | Có thể defer |
- **Fix**: Dev fix, có thể dùng `/ck:debug` (root cause trước) rồi `/ck:fix`. Status chuyển `In Progress` → `Fixed`.
- **Regression**: check các ô Regression Scope phù hợp (Original TC / Related happy path / Related error-edge / Full impacted suite) — P0/P1 bắt buộc vượt quá "Original TC". Chạy lại **toàn bộ TC liên quan** trong `tc-matrix.md` (không chỉ TC đã fail) — vì fix có thể phá case khác.
- **Review**: QA verify → điền Verification table → Status `Verified` rồi `Closed` nếu pass; nếu vẫn còn/phát sinh side-effect, lùi Status về `In Progress` (không tạo BUG file mới cho cùng vấn đề).

### Rule bắt buộc

> **P0/P1 bug sau khi fix → bắt buộc chạy lại nhóm TC liên quan** (không được chỉ chạy lại đúng 1 TC đã fail, tức không được chỉ tick "Original TC"). Lý do: fix ở mức code thường ảnh hưởng nhiều hơn phạm vi 1 test case.

### Flaky test track (file riêng, không lẫn với bug)

Flaky ≠ bug — là test không ổn định (khi pass khi fail với cùng code). Log thành file riêng `FLAKY-[YYYYMMDD]-NNN.md` (§7.H2), không log chung vào REPORT hay tạo `BUG-*.md`:

| Số lần flaky quan sát được | Hành động |
|---|---|
| 1-2 lần | Ghi nhận vào Reproduction Evidence, chạy tiếp, không block |
| 3 lần trở lên | Bắt buộc `/ck:debug` điều tra root cause (thường là race condition/thứ tự test/test data leak) — điền Suspected Causes |
| Không fix được sau điều tra | Chưa được tick bất kỳ ô Verification nào; risk accepted phải ghi vào `decision-log.md` kèm reason + deadline |

Không bao giờ xóa hẳn hoặc skip âm thầm flaky test để "làm suite xanh" — đó là che giấu lỗi, vi phạm nguyên tắc không được giấu test/lint/build fail.

---

## 7. Appendix — Templates đầy đủ

Mỗi mục dưới đây trỏ tới **file template thật** (canonical, blank) mà skill tương ứng đọc/copy từ đó — không phải sinh ra từ skill. Copy file đó vào project, điền theo project thật. Phần "Example filled" ở đây chỉ để minh họa cách điền, không phải bản để copy.

Nguồn kit: `docs/template/QA_TEST_TEMPLATE_KIT/` (copy toàn bộ thư mục vào project khác nếu cần dùng độc lập, không qua skill).

### A0. `spec-overview.md`

Template: `.claude/skills/qa-spec/assets/spec-overview.md` (skill: `/ck:qa-spec`) — bản nháp ngắn trước khi mở rộng thành `spec.md` đầy đủ. Gồm Goal, Main Flow, Scope, Constraints, Raw Acceptance Criteria, Open Questions.

---

### A. `spec.md`

Template: `.claude/skills/qa-spec/assets/spec.md` (skill: `/ck:qa-spec`) — 15 mục: General Information, Goal, User Stories, Scope, Main Flow (+ Alternate/Error Flows), Requirements, Business and Validation Rules, Technical Notes, Non-Functional Requirements, Acceptance Criteria (Given/When/Then), Test Data and Environment, Dependencies and Risks, Rollback Plan, Open Questions, Approval.

---

### B. `confirm-clear-checklist.md`

Template: `.claude/skills/qa-spec/assets/confirm-clear-checklist.md` (skill: `/ck:qa-spec`) — Status dùng `Open` / `Confirmed` / `N/A`, có cột **AI Suggestion** cho item còn `Open` (gợi ý tham khảo dựa trên context feature, không phải Evidence, không tự đổi Status), Blocking Questions, và Result (`Ready for Test Strategy` / `Blocked`).

---

### C. `test-strategy.md`

Template: `.claude/skills/qa-spec/assets/test-strategy.md` (skill: `/ck:qa-spec`) — đã có sẵn tiêu chí chọn Pyramid/Trophy/Honeycomb, Priority Rule (P0-P3), và Entry/Exit Criteria gộp trực tiếp trong file (mục 6-7) — không cần file entry-criteria riêng ở Phase 1.

---

### D. `scenario-{feature}-{date}.md`

Template: `.claude/skills/qa-test-design/assets/scenario-template.md` (skill: `/ck:qa-test-design`) — bản QA-facing rút gọn (Scope, Scenarios table, Coverage Summary theo flow-type, Top Risks, Open Questions), **khác** với raw report của `/ck:scenario` (vốn có Progress Summary/Composite Score cho saturation mode). `/ck:qa-test-design` chạy `/ck:scenario` trước rồi distill kết quả sang format này.

Muốn xem raw report gốc của `/ck:scenario` (đầy đủ Coverage Matrix + Composite Score) tham khảo `plans/reports/ck-scenario-*-report.md` trong project này.

---

### E. `tc-matrix.md`

Template: `.claude/skills/qa-test-design/assets/tc-matrix.md` (skill: `/ck:qa-test-design`) — có thêm bảng Summary theo Priority (P0-P3 × Total/Passed/Failed/Blocked-Skipped) ở cuối. Status values: `Not Run` / `Passed` / `Failed` / `Blocked` / `Skipped`.

---

### F. `entry-criteria-checklist.md`

Template: `.claude/skills/qa-test-design/assets/entry-criteria-checklist.md` (skill: `/ck:qa-test-design`) — có bảng Exceptions (item/reason/risk/approved by) và Decision (`Ready for Execution` / `Blocked`).

---

### G. `postman-collection.json` / `postman-environment.json`

Template (JSON thật, import thẳng vào Postman): `.claude/skills/qa-test-design/assets/postman-collection.template.json` + `postman-environment.template.json` (skill: `/ck:qa-test-design`) — đã có sẵn bearer auth trỏ `{{access_token}}`, biến `base_url`, và 1 request mẫu thật (`Sample health check` với `pm.test` assertion) trong `Happy Path/`. 4 folder: `Auth/`, `Happy Path/`, `Edge Cases/`, `Error Cases/`.

---

### H. `BUG-{id}.md`

Template: `.claude/skills/qa-bug/assets/bug-report.md` (skill: `/ck:qa-bug`) — ID dạng `BUG-[YYYYMMDD]-NNN`. Severity dùng thang **P0-P3** (giống `test-strategy.md`, khác thang Critical/High/Medium/Low của scenario). Status: `Open` / `In Progress` / `Fixed` / `Verified` / `Closed`. Có Regression Scope (checklist) và Verification table.

---

### H2. `FLAKY-{id}.md`

Template: `.claude/skills/qa-bug/assets/flaky-report.md` (skill: `/ck:qa-bug`) — ID dạng `FLAKY-[YYYYMMDD]-NNN`, tách riêng khỏi BUG (flaky ≠ bug). Có Reproduction Evidence table, Suspected Causes, Verification checklist (không tick cho tới khi có root cause hoặc risk accepted).

---

### I. `REPORT-{date}-{scope}.md`

Template: `.claude/skills/qa-report/assets/report.md` (skill: `/ck:qa-report`) — Executive Summary, Test Results, Coverage, Gate Results (per-gate Pass/Fail/N/A + evidence), Failed or Blocked Items (severity P0-P3), Key Metrics (kể cả Cleanup Pass/Fail), Recommendation checkbox, Open Questions/Risks.

---

### I2. `QA_REPORT_FINAL_{date}.md`

Template: `.claude/skills/qa-go-no-go/assets/qa-report-final.md` (skill: `/ck:qa-go-no-go`) — file **độc lập**, không phải REPORT nối thêm section — có Final Status (GO/NO-GO/REWORK checkbox), Summary, Accepted Risks, Required Next Actions, Sign-off table (QA/Tech Lead/PM).

---

### J. `decision-log.md`

Template: `.claude/skills/qa-go-no-go/assets/decision-log.md` (skill: `/ck:qa-go-no-go`)

**Example:**

```markdown
| 2026-07-28 | Go | GBP Review Sync v1 | Coverage 82% > threshold 80%, 0 P0/P1 mở | Không có | HieuHD | - |
| 2026-07-15 | No-Go | Keyword Trend v2 | Coverage 60% < 80%, 2 bug P1 chưa fix | - | HieuHD | Fix trước 2026-07-22 |
```

---

### K. `go-no-go-checklist.md`

Template: `.claude/skills/qa-go-no-go/assets/go-no-go-checklist.md` (skill: `/ck:qa-go-no-go`) — có bảng Exceptions/Accepted Risks và Decision (Go/No-Go/Rework + Reason) ngay trong file.

---

### L. `tests/docs/runbook.md`

Không có skill sở hữu (viết tay 1 lần/project). Bản đầy đủ với lệnh thật (setup, Gate 0-3, coverage, Newman, optional a11y/perf/load, cleanup, common failures) nằm tại `docs/template/QA_TEST_TEMPLATE_KIT/tests/docs/runbook.md` — copy file đó vào `tests/docs/runbook.md` của project rồi thay lệnh mẫu bằng lệnh thật của repo.

---

## 8. Appendix — Tool Mapping

### Org QA Skills (mới, riêng cho quy trình này — không thuộc ClaudeKit gốc)

Nguồn: `.claude/skills/qa-*`. Mỗi skill sinh đúng output file của phase tương ứng (§7), không chạy trùng việc với skill ClaudeKit gốc.

| Phase | Command | Purpose |
|---|---|---|
| Spec | `/ck:qa-spec "<feature>"` | Sinh `spec-overview.md` + `spec.md` + `confirm-clear-checklist.md` + `test-strategy.md` |
| Test Design | `/ck:qa-test-design "<feature>" [--iterations N \| --saturation]` | Sinh `tc-matrix.md`, fixture stub, Postman skeleton, `entry-criteria-checklist.md`, `scenario-{feature}-{date}.md` (gọi `/ck:scenario` bên trong rồi distill) |
| Execution report | `/ck:qa-report "<feature>" "<scope>"` | Parse kết quả `/ck:test`/`/ck:web-testing`/Newman → `REPORT-{date}-{scope}.md` |
| Review/Go-No-Go | `/ck:qa-go-no-go "<feature>" <report path>` | Sinh `go-no-go-checklist.md`, `decision-log.md`, `QA_REPORT_FINAL_{date}.md` |
| Bug Track | `/ck:qa-bug found "<mô tả>"` \| `/ck:qa-bug fixed <BUG-id>` \| `/ck:qa-bug flaky "<test/TC>"` | Log `BUG-{id}.md` hoặc `FLAKY-{id}.md`, triage severity P0-P3, chạy regression bắt buộc cho P0/P1 |

### ClaudeKit Commands (gốc, dùng bên trong hoặc song song với skill trên)

| Phase | Command | Purpose |
|---|---|---|
| Spec | `/ck:plan --tdd` | Tạo plan test-first (viết test trước khi implement) |
| Test Design | `/ck:scenario [--iterations N \| --saturation]` | Sinh scenario/edge case theo 12 dimension — được `/ck:qa-test-design` gọi bên trong |
| Execution | `/ck:test` | Chạy unit/integration/e2e, coverage, build verification — chạy trước `/ck:qa-report` |
| Execution | `/ck:web-testing` | E2E/load/security/visual/a11y (Playwright, Vitest, k6) — chạy trước `/ck:qa-report` |
| Execution | `/ck:security` | STRIDE + OWASP audit — chạy khi feature đụng auth/payment/PII (P0/P1), input cho §7.I Failed/Blocked Items nếu có finding |
| Debug | `/ck:debug` | Root cause analysis trước khi fix — dùng trong `/ck:qa-bug` |
| Fix | `/ck:fix` | Fix bug/error/test failure/CI issue — dùng trong `/ck:qa-bug` |
| Review | `/ck:code-review` | Review diff/PR/commit/codebase — dùng ở bước 4.2 |
| Plan mgmt | `/ck:project-management` | Track progress, blocker, plan status, report |
| Docs | `/ck:docs` | Update docs khi có breaking change — nhắc tới ở bước 4.5 |

### Agents

| Agent | Role |
|---|---|
| `tester` | QA Lead: chạy suite, phân tích coverage, report, regression |
| `project-manager` | EM/PM: track progress, blocker, decision log |
| `docs-manager` | Technical Writer: update docs khi code đổi |
| `debugger` | Root cause phức tạp: log analysis, performance, CI failure |
| `code-reviewer` | Code Reviewer (4.2): review diff/coverage, edge case detection |

---

## 9. Appendix — Command Reference

### Python / Django

```bash
# Lint / Typecheck
ruff check .                      # hoặc flake8 . tùy project
mypy .                            # nếu dùng type hints nghiêm ngặt

# Unit + Integration
pytest tests/unit -v
pytest tests/integration -v

# E2E (nếu dùng Playwright cho backend-served UI)
pytest tests/e2e --browser chromium

# Coverage
pytest --cov=. --cov-report=term-missing --cov-report=html

# API test (Newman)
newman run postman-collection.json -e postman-environment.json --reporters cli,json

# A11y (nếu có UI server-rendered)
pytest tests/a11y  # hoặc axe-core qua Playwright

# Perf/Load
k6 run tests/perf/load-test.js

# Cleanup test data
python manage.py flush --noinput  # CHỈ trên DB test/staging riêng, KHÔNG BAO GIỜ chạy trên prod

# Debug
python manage.py shell            # kiểm tra state trực tiếp
python manage.py test --debug-mode
```

### JS / TS

```bash
# Lint / Typecheck
npm run lint
npm run typecheck   # hoặc: tsc --noEmit

# Unit
npm run test:unit          # vd Jest/Vitest

# Integration
npm run test:integration

# E2E
npx playwright test

# Coverage
npm run test -- --coverage

# API test (Newman)
newman run postman-collection.json -e postman-environment.json --reporters cli,json

# A11y
npx playwright test --grep @a11y   # hoặc axe-core CLI

# Perf/Load
k6 run tests/perf/load-test.js

# Cleanup test data
npm run db:seed:reset   # script riêng của project, KHÔNG chạy trên prod

# Debug
npx playwright test --debug
npx playwright show-trace trace.zip
```

---

## 10. Appendix — Glossary

| Thuật ngữ | Ý nghĩa |
|---|---|
| **UC** | Use Case — mô tả 1 luồng tương tác hoàn chỉnh giữa actor và hệ thống |
| **TC** | Test Case — 1 kịch bản kiểm thử cụ thể, có input/step/expected result |
| **E2E** | End-to-End — test toàn bộ luồng từ UI/API đến DB thật (hoặc gần thật) |
| **Flaky** | Test cho kết quả không ổn định (khi pass khi fail) dù code không đổi |
| **P0-P3** | Mức ưu tiên: P0 = blocker (phải fix trước release), P1 = critical, P2 = important, P3 = nice-to-have |
| **Gate** | Cổng chặn trong pipeline test — chỉ qua gate sau khi gate trước pass |
| **Newman** | CLI runner cho Postman collection, dùng để chạy API test tự động |
| **Coverage** | % code được test chạy qua — line/branch/function |
| **Regression** | Chạy lại test cũ để đảm bảo thay đổi mới không phá tính năng cũ |
| **Go/No-Go** | Quyết định cho phép release (Go) hay không (No-Go) hay cần làm lại (Rework) |
| **Pyramid/Trophy/Honeycomb** | 3 mô hình phân bổ tỷ lệ test theo layer (xem §7.C) |
| **Idempotency key** | Key đảm bảo 1 request gửi nhiều lần chỉ tạo 1 kết quả (chống duplicate) |
| **Quarantine (test)** | Tạm thời skip 1 flaky test có ghi lý do + deadline, không xóa hẳn |

---

## 11. Changelog

Chỉ ghi thay đổi lớn (thêm/bớt phase, đổi field bắt buộc, đổi threshold/SLA mặc định) — không ghi sửa lỗi chính tả/format.

| Ngày | Thay đổi | Người duyệt |
|---|---|---|
| 2026-08-03 | Thêm §0 Prerequisites, note portability (copy kèm skill), SLA mặc định P0-P3 (§6), role Code Reviewer (role matrix + §8), `/ck:security` vào Phase 3.4 + §8, link ví dụ end-to-end thật (`MPF_023_GBP_Report`), mục Owner & Maintenance | HieuHD |
