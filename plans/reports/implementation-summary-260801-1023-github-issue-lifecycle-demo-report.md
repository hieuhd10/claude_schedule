# GitHub Issue Lifecycle Demo - Implementation Report

Plan: `plans/260801-0958-github-issue-lifecycle-demo/plan.md`

## Route

- Backend: FastAPI app `src/claude_schedule/main.py`, API mounted at `/api/*`.
- Frontend: single-page app `frontend/src` (Vite+React+TS), one screen (`IssueDetailPage`) reached by pasting a GitHub Issue URL into the form on load.
- Dev URLs: backend `http://localhost:8000`, frontend `http://localhost:5173`.

## GitHub config

- Backend reads `GITHUB_OWNER`, `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `CLAUDE_BOT_LOGIN`, `OPERATOR_GITHUB_USERNAME`, `CORS_ORIGINS`, `GITHUB_API_TIMEOUT_SECONDS` from root `.env` (see `.env.example`). Never sent to frontend; frontend only has `VITE_API_BASE_URL` (non-secret).
- For this session, `.env` was populated using the user's already-authenticated `gh` CLI token (`gh auth token`), piped directly into the file — never printed/logged.
- Token scopes confirmed via `gh auth status`: `gist, read:org, repo, workflow` (broader than the minimal fine-grained scopes originally planned, but it's the user's own token for their own repo, used only server-side).

## Issue used to test

- Created `https://github.com/hieuhd10/claude_schedule/issues/6` ("[DEMO] Lifecycle test issue"), labeled `env:dev`, `base:feature/test-routine`.

## Comments posted (real)

1. Plain test comment (no `@claude`): `https://github.com/hieuhd10/claude_schedule/issues/6#issuecomment-5149591498` - confirmed posting works before touching `@claude`.
2. `@claude` debug command: `https://github.com/hieuhd10/claude_schedule/issues/6#issuecomment-5149592375` - triggered a real Claude GitHub Action run (`https://github.com/hieuhd10/claude_schedule/actions/runs/30682115778`, completed/success in ~40s). Claude replied with a real (unstructured, by design - heading text didn't match our exact parser aliases) debug analysis; UI correctly falls back to raw-body + "Unstructured response" badge rather than fabricating fields.
3. `DEBUG_APPROVED` checkpoint: `https://github.com/hieuhd10/claude_schedule/issues/6#issuecomment-5149599994` - lifecycle correctly transitioned Debug -> Fix ("Waiting for Claude to open a Pull Request").

## PR detected

None yet - no PR was opened for this demo issue (Claude correctly reported no real bug exists in the fake scenario, so it didn't open one). `find_linked_pull_request` returns `None` as expected; Review/Test quick actions and PR-only checkpoints are disabled in the UI when this is the case.

## Workflow/check status

Claude Code GitHub Action fired for both comments (skipped for the plain comment, ran for the `@claude` comment), observed live via `gh run list`/`gh run view`. Confirms polling design in `use-issue-detail.ts` and the backend's real-time GitHub reads both work against live data - not simulated.

## Files changed/added

- Backend: `pyproject.toml`, `requirements.txt`, `.gitignore`, `.env.example`, `src/claude_schedule/{settings,main}.py`, `src/claude_schedule/github/*`, `src/claude_schedule/lifecycle/*`, `src/claude_schedule/api/*`, `tests/{github,lifecycle,api}/*`.
- Frontend: new `frontend/` app (Vite scaffold + `src/api`, `src/components`, `src/hooks`, `src/lib`, `src/pages`, `App.tsx`, `App.css`).
- Plan: `plans/260801-0958-github-issue-lifecycle-demo/plan.md`.

## Lint/test/build results

- Backend: `ruff check` clean, `mypy` clean (18 files), `pytest` 40/40 passed.
- Frontend: `tsc -b` clean, `oxlint` clean, `vite build` succeeds (207KB JS / 65KB gzip).
- UI not visually verified in-browser (no browser tool available this session) - user asked to check `http://localhost:5173` manually against issue #6.

## Unresolved questions

1. Frontend UI has not been visually confirmed by a human or automated browser check yet - please try it against issue #6 and report any rendering/console issues.
2. No PR was created in this test run (correctly, since the demo issue has no real bug), so the Review/Test/Ready-to-Merge/Completed stages and their UI paths remain logically verified via unit tests but not exercised against a real PR. If you want that exercised, we'd need a demo issue with an actual fixable bug so Claude opens a real PR.
3. `.env` currently holds the user's broad-scope `gh` OAuth token rather than a fine-grained PAT scoped to just this repo; fine to leave for this local demo, but tighten before broader use.

## Addendum: QA issue-creation flow

Added a second app mode ("Report a new Issue (QA)") so the lifecycle isn't limited to pre-existing issues.

- Backend: `GitHubService.create_issue`, `POST /api/issues/{owner}/{repository}`, `GET /api/config` (non-secret owner/repo prefill), body/label template builder in `api/issue_template.py`.
- Frontend: `issue-create-form.tsx` (title, environment, base branch, severity, steps to reproduce, expected/actual result, notes, optional assignee) + mode tabs in `App.tsx`. On success, jumps straight into the existing Issue Detail lifecycle view.
- Live-verified: created real issue `https://github.com/hieuhd10/claude_schedule/issues/7`, confirmed independently via `gh issue view`, confirmed it reads back at Debug stage through the API. GitHub auto-created the `severity:high` label since it didn't pre-exist.
- Tests: 9 new backend tests (service, template, routes), all passing (49/49 total). Frontend `tsc`/`oxlint`/`vite build` all clean.
- Frontend dev server port note: 5173 was occupied by another local project; Vite auto-selected 5174 and backend CORS was updated to allow both origins.
