# GitHub Issue Lifecycle Demo — Implementation Plan

## Context

The user wants a real (no-mock) demo screen that manages a GitHub Issue through the lifecycle `Debug → Fix → Review → Test → Ready to Merge → Completed`, driven entirely by real GitHub data (Issue/PR/comments/checks) and by posting real `@claude` comments that trigger the already-installed Claude GitHub Action. The current repo (`claude_schedule`) is an empty Python scaffold — `pyproject.toml` with no dependencies, stub `src/claude_schedule/__init__.py`, stub `tests/__init__.py`, empty `docs/`, no `.gitignore`, no `.env`. This is a from-scratch build, not an extension of existing app code.

Confirmed with the user: Python backend (FastAPI) + React frontend; GitHub auth via a fine-grained PAT the user already has, supplied through a local untracked `.env`; testing will use a **new demo Issue created in `hieuhd10/claude_schedule`** (the real repo behind this project, confirmed remote `origin`), where the Claude GitHub Action is already installed. No production issue will be touched. Token must never reach the frontend, never be logged, never committed.

## Architecture

Backend code lives inside `src/claude_schedule/` (the existing declared package — no reason to add a competing root). Frontend is a new sibling `frontend/` (separate Vite/npm toolchain, must not be swept into Python packaging).

```
src/claude_schedule/
  settings.py            # pydantic-settings: GITHUB_OWNER, GITHUB_REPOSITORY, GITHUB_TOKEN,
                          # CLAUDE_BOT_LOGIN, OPERATOR_GITHUB_USERNAME, CORS_ORIGINS, GITHUB_API_TIMEOUT_SECONDS
  main.py                # FastAPI app factory, CORS (explicit Vite origin only), exception handlers, router mount
  github/
    errors.py             # GitHubError hierarchy (RepoNotFound, IssueNotFound, PrNotFound, TokenInvalid,
                           # PrivateOrNoScope, RateLimited, CommentRejected, GitHubTimeout)
    url_parser.py         # parse_issue_url(url) -> (owner, repo, issue_number)
    models.py              # pydantic domain models: Issue, Comment, PullRequest, TimelineEvent, CheckRun, Commit
    client.py              # async httpx wrapper: auth header, timeout, raw-HTTP -> GitHubError translation
    service.py             # GitHubService: get_issue, get_issue_comments, get_issue_timeline,
                            # find_linked_pull_request, get_pull_request, get_pull_request_comments,
                            # get_pull_request_commits, get_pull_request_checks,
                            # post_issue_comment, post_pull_request_comment
  lifecycle/
    models.py              # Stage enum, LifecycleResult, ParsedClaudeResponse/UnstructuredResponse,
                            # CHECKPOINT_TEMPLATES + CHECKPOINT_TARGET (single source of truth for marker strings)
    engine.py               # infer_stage(...) — pure, ordered rules, zero I/O
    timeline.py              # merge_and_categorize(...) + parse_claude_response(...) — pure
  api/
    deps.py                # Depends() providing GitHubService from Settings
    errors.py               # maps GitHubError -> structured JSON envelope + HTTP status (one place, DRY)
    schemas.py               # IssueDetailResponse composition shape
    routes.py                 # all endpoints (single file — 6 endpoints doesn't justify splitting yet)
tests/
  github/  (test_url_parser.py, test_client.py, test_service.py — respx-mocked, no live network)
  lifecycle/ (test_engine.py, test_timeline.py — plain fixtures)
  api/ (test_routes.py — FastAPI TestClient, GitHubService mocked via dependency override)

frontend/
  src/
    api/ (client.ts, types.ts)
    components/ (issue-url-form, issue-header, lifecycle-stepper, activity-timeline, timeline-item,
                  command-composer, stage-detail-panel, status-banner)
    hooks/ (use-issue-detail.ts — fetch + manual refresh + interval polling + stop conditions, use-post-comment.ts)
    lib/ (quick-actions.ts — static @claude prompt templates)
    pages/ (issue-detail-page.tsx)
```

### Key design decisions

- **Linked PR discovery**: no direct GitHub endpoint exists for this. Use `get_issue_timeline`, scan `cross-referenced` events for `source.issue.pull_request` (Claude's PR body containing `Fixes #N`/`Closes #N` auto-generates this), take the most recent match.
- **PR comments (read + post)**: both use `/repos/{owner}/{repo}/issues/{pr_number}/comments` (PR conversation shares the issue-comments endpoint) — implemented once, reused for issue and PR paths.
- **PR checks**: `get_pull_request` first for head SHA, then `GET /repos/{owner}/{repo}/commits/{sha}/check-runs`.
- **Lifecycle rules** (ordered, first match wins, evaluated over the time-sorted merged comment/timeline stream so the *latest* marker wins over stale ones):
  1. `COMPLETED` — issue closed AND linked PR merged.
  2. `READY_TO_MERGE` — PR open, latest marker is `TEST PASSED`/`[LIFECYCLE:TEST_CONFIRMED]`, checks green.
  3. `TEST` — PR exists, review-passed marker seen; `TEST FAILED` keeps stage TEST with `next_recommended_action="Fix test failure"`.
  4. `REVIEW` — PR exists, no review-passed marker yet; `REVIEW FAILED` keeps stage REVIEW with findings + `next_recommended_action="Fix review findings"`.
  5. `FIX` — `[LIFECYCLE:DEBUG_APPROVED]` marker present, no PR yet.
  6. `DEBUG` — fallback (issue open, no PR, no approval marker).
- **Unstructured response handling**: `parse_claude_response` tries to extract root-cause/finding/test-result fields from a Claude comment; on failure returns `UnstructuredResponse(raw_body=...)`, which the API passes through and the frontend renders as the raw body plus an "Unstructured response" badge — never invented.
- **Human checkpoints**: posted as real GitHub comments (`[LIFECYCLE:DEBUG_APPROVED]` etc., via a new `POST /api/issues/{o}/{r}/{n}/checkpoints` endpoint reusing the existing comment-posting methods) so GitHub stays the single source of truth across devices/sessions.
- **"Waiting for Claude" tracking**: no backend job/queue — purely client-side polling. After a successful post, `use-issue-detail` re-fetches on an interval (~15s) until (a) a new comment from `CLAUDE_BOT_LOGIN` appears after `postedAt`, (b) a linked PR newly appears, or (c) a max-attempt timeout is hit (then polling stops, manual "Refresh from GitHub" remains). `CLAUDE_BOT_LOGIN` starts as a placeholder (`claude[bot]`) and gets corrected once the real bot identity is observed during the live test.
- **Error handling**: all GitHub-call failures raise typed `GitHubError` subclasses, translated centrally in `api/errors.py` into `{ "error": { "code", "message", "retry_after"? } }` — frontend branches on `code`. Private-repo-without-scope and not-found are both surfaced as GitHub's ambiguous 404 — documented as a known limitation rather than pretending false certainty.
- **Secrets**: token read only inside `github/client.py`'s auth-header construction, never in any response model or log line. Root `.gitignore` added (`.env`, `__pycache__/`, `.venv/`, `frontend/node_modules/`, `frontend/dist/`). Root `.env.example` (names only). Frontend `.env` holds only non-secret `VITE_API_BASE_URL`. CORS restricted to the explicit Vite dev origin, not `*`.
- **Dependency reconciliation**: add runtime/dev deps to `pyproject.toml` (`[project.dependencies]`, `[project.optional-dependencies].dev`); update the currently-empty `requirements.txt` to `-e .[dev]` so the README's existing `pip install -r requirements.txt` instruction keeps working.

## API contract (prefix `/api`)

```
POST /api/issues/parse-url                                  { url } -> { owner, repo, issue_number }
GET  /api/issues/{owner}/{repo}/{issue_number}               -> IssueDetailResponse (issue, comments, timeline,
                                                                 linked_pull_request|null, pr_comments, pr_commits,
                                                                 pr_checks, lifecycle{stage,reasoning,last_command,
                                                                 last_claude_response,next_recommended_action,
                                                                 review_findings?,test_result?})
POST /api/issues/{owner}/{repo}/{issue_number}/comments      { body } -> { comment }
POST /api/pull-requests/{owner}/{repo}/{pr_number}/comments  { body } -> { comment }
POST /api/issues/{owner}/{repo}/{issue_number}/checkpoints   { checkpoint } -> { comment }
```
Errors: 404 REPO_NOT_FOUND/ISSUE_NOT_FOUND/PR_NOT_FOUND, 401 TOKEN_INVALID, 403 PRIVATE_OR_NO_SCOPE, 422 COMMENT_REJECTED, 429 RATE_LIMITED, 504 GITHUB_TIMEOUT.

## Build order

1. Backend foundations: pyproject deps (`fastapi`, `uvicorn[standard]`, `httpx`, `pydantic`, `pydantic-settings`; dev: `pytest`, `pytest-asyncio`, `respx`, `ruff`, `mypy`), root `.gitignore`, root `.env.example`, `settings.py`, `main.py` skeleton + health route + CORS.
2. GitHub service layer (`github/`) with `respx`-mocked unit tests — no live network yet.
3. Lifecycle engine (`lifecycle/`) with plain-fixture unit tests, zero I/O.
4. API layer (`api/`) wired into `main.py`, `TestClient` tests with `GitHubService` mocked via dependency override.
5. Frontend scaffold: `npm create vite@latest frontend -- --template react-ts`, base structure, typed API client, `.env`.
6. Frontend screens, bottom-up: url-form → header → stepper → timeline(+item) → stage-detail-panel → command-composer → status-banner (loading/error/empty/permission-denied/waiting-for-claude) → page composition.
7. Wiring: hooks to backend, polling stop-conditions, checkpoint buttons, confirm-before-post dialog, PR-gated Review/Test actions.
8. **Manual live verification**: create a clearly-labeled demo Issue in `hieuhd10/claude_schedule` (e.g. "[DEMO] Lifecycle test issue"), run backend (`uvicorn`) + frontend (`vite dev`) locally, post a plain non-`@claude` test comment first and confirm it appears on GitHub, then post an `@claude` Debug comment, poll for the real Action response, and drive as much of the Debug→Fix→Review→Test→Ready-to-Merge flow as time allows through the real UI. Correct `CLAUDE_BOT_LOGIN` once the real bot identity is observed.
9. Lint/type/test/build: `ruff check`, `mypy`, `pytest` (backend); `eslint`, `tsc --noEmit`, `vite build` (frontend).

## Verification

- Unit tests pass at each backend phase (`pytest`) before moving to the next layer.
- `GET /api/issues/hieuhd10/claude_schedule/<demo_issue_number>` returns real issue data end-to-end (manual curl/browser check) before wiring the frontend.
- Live test per step 8 above — real comment URLs and PR (if Claude creates one) reported back to the user; no fabricated data at any point.
- Final `ruff check`, `mypy`, `pytest`, `eslint`, `tsc --noEmit`, `vite build` all green.
- Confirm no secret ever appears in git (`git status`/`git diff` reviewed before any commit) and never printed to terminal/log output.

## Notes / low-stakes decisions made without re-asking

- `OPERATOR_GITHUB_USERNAME` is a static env var (single-operator demo, no auth/login flow) — simplest option matching YAGNI.
- Private-repo-without-scope vs. not-found ambiguity accepted as one error code (GitHub itself doesn't distinguish via 404) rather than adding a probing call to disambiguate.
