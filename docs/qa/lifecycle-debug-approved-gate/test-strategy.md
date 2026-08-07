# Test Strategy — Lifecycle Debug-Approved Gate + Checkpoint Narrowing

## 1. Scope and Risk

- Scope: `src/claude_schedule/lifecycle/{models.py,engine.py}`, `src/claude_schedule/api/routes.py` (`post_checkpoint`), `frontend/src/api/types.ts` (`Checkpoint`), cộng với các test đang exercise chúng.
- Main risk: regression ở functional/business-logic — vô tình mở lại đúng bug mà diff này fix (linked PR advance qua Debug mà không có approval rõ ràng), hoặc checkpoint-contract bị break cho một external caller chưa biết. Không thuộc nhóm risk data-loss/security/payment (app stateless, không có DB).
- Selected model: **Pyramid**
- Reason: test composition thực tế của repo đã unit-heavy sẵn — 18 case pure-function trong `tests/lifecycle/test_engine.py` (backend logic chiếm đa số), 11 case integration FastAPI `TestClient` mỏng trong `tests/api/test_routes.py`, và 4 test component/hook nhỏ dưới `frontend/src` (vitest + testing-library). Không có Playwright/Cypress, không có k6, không có axe/Lighthouse được install trong `pyproject.toml` hay `frontend/package.json`. Pyramid khớp với hình dạng này: unit coverage rẻ, exhaustive cho branch logic của `infer_stage()` chính là nơi risk thật nằm ở đó, chỉ cần một lớp integration mỏng để chứng minh wiring đúng.

## 2. Test Layer Plan

| Layer | Target Ratio | Main Scope | Tool |
|---|---:|---|---|
| Unit | 65% | Branch logic của `infer_stage()` (gate debug_approved, các path parse marker không đổi), `build_checkpoint_comment()`, validation enum `Checkpoint` | pytest (backend), vitest (frontend component/type-level) |
| Integration | 30% | Wiring route `POST .../checkpoints` (chỉ post vào issue, 422 khi enum không hợp lệ), `GET .../issue_number` end-to-end qua `infer_stage()` với `GitHubService` được fake | pytest + FastAPI `TestClient` (fixture `fake_service`) |
| E2E | 0% | Không áp dụng — không có browser E2E framework nào được install; không được thêm cho thay đổi này | N/A (không có dependency Playwright/Cypress) |
| API | 5% | Validation schema của checkpoint request (hình dạng 422 cho value đã xoá) | pytest + FastAPI `TestClient` — repo này không có Postman/Newman collection riêng |
| A11y | N/A | Không có UI markup mới (chỉ rút gọn ở type-level); không có axe/Lighthouse install | N/A |
| Perf/Load | N/A | Không có endpoint hay hot path mới; không có k6 install | N/A |

## 3. Coverage Targets

> Repo này hiện chưa gắn tool đo coverage (không có `pytest-cov` trong dev dependency của `pyproject.toml`, không có config coverage của `vitest` trong `frontend/package.json`). Target dưới đây là mục tiêu để review thủ công cho các file bị touch, không phải số bị enforce bởi CI, cho tới khi tool được thêm vào.

| Metric | Target |
|---|---:|
| Line | ≥ 85% (file bị touch: `engine.py`, `models.py`, `routes.py`) |
| Branch | ≥ 80% (cả path gated và ungated của `debug_approved` đều phải có test pass) |
| Function | ≥ 90% |
| Critical path | 100% — AC-04 (gate đóng) và AC-05 (gate mở, path Ready-to-Merge cũ) đều phải được test trực tiếp |

## 4. Priority Rule

- **P0:** Release blocker; phải pass.
- **P1:** Quan trọng; phải pass trừ khi risk được accept rõ ràng.
- **P2:** Target pass rate ≥ 90%.
- **P3:** Có thể defer, cần ghi lại.

## 5. CI Order

1. Lint/typecheck/build — `ruff`, `mypy` (backend); `tsc -b`, `oxlint` (frontend) — hiện tại đều sạch trên diff này (`npx tsc -b --noEmit` đã verify sạch)
2. Unit — `pytest tests/lifecycle/`, `npx vitest run` (test component/hook)
3. Integration — `pytest tests/api/test_routes.py`
4. E2E — skip (N/A, không có tooling)
5. API — được cover trong bước 3 (không có suite Postman/Newman riêng)
6. A11y — skip (N/A, không có tooling, không có markup mới)
7. Perf/load — skip (N/A, không có tooling, không có hot path mới)

Baseline check đã thực hiện cho spec này: full backend suite (`uv run pytest -q`) → 65 passed; frontend `npx vitest run` → 4 passed; `npx tsc -b --noEmit` → sạch. Tất cả green trên working tree hiện tại tính đến 2026-08-04.

## 6. Entry Criteria

- [ ] Spec và acceptance criteria đã được approve (hiện đang Draft — row PM trong `spec.md` chưa ký)
- [x] Environment sẵn sàng (pytest/vitest local, không cần environment ngoài — `GitHubService` được fake)
- [ ] API/data contract đã ổn định (spec này đang định nghĩa contract mới; chưa được review/merge)
- [x] Fixture/seed/cleanup sẵn sàng (`_debug_approved_comment()` và helper có sẵn trong `tests/lifecycle/test_engine.py` đã cover gate mới)
- [x] Baseline CI green (đã verify 2026-08-04: 65 test backend + 4 test frontend pass, `tsc -b` sạch)

## 7. Exit Criteria

- [ ] Toàn bộ P0/P1 pass
- [ ] P2 pass rate ≥ 90%
- [ ] Đạt coverage target (review thủ công, theo caveat ở §3 — chưa có automated gate)
- [ ] Không còn critical bug chưa resolve
- [ ] Không còn flaky test ảnh hưởng release chưa resolve

Approved by: QA [Name] / Tech Lead [Name] / PM [Name]
