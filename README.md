# Claude Schedule

Web workspace for tracking a GitHub Issue from creation through investigation, implementation,
review, testing, merge, and closure. GitHub remains the source of truth: every action in the UI is
posted as a real Issue or Pull Request comment.

At every lifecycle stage the operator can either:

- write and post a manual comment; or
- edit and post a stage-specific `@claude` prompt for Claude on GitHub.

## Lifecycle

1. **Debug** — investigate manually or ask Claude for a root cause. Approve the debug checkpoint
   to start implementation.
2. **Fix** — track implementation manually or ask Claude to implement and open a linked Pull
   Request.
3. **Review** — add findings manually or ask Claude to review. Put `REVIEW PASSED` or
   `REVIEW FAILED` on its own line to record the result.
4. **Test** — add test evidence manually or ask Claude to test. Put `TEST PASSED` or `TEST FAILED`
   on its own line to record the result.
5. **Ready to merge** — reached when tests pass and all reported GitHub checks are successful,
   neutral, or skipped.
6. **Completed** — reached when the GitHub Issue is closed.

## Setup

```bash
python -m venv .venv
.venv/bin/pip install -e '.[dev]'
cp .env.example .env
```

Configure `GITHUB_OWNER`, `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, and the operator username in
`.env`. By default, API access is restricted to the configured repository. Set
`RESTRICT_TO_CONFIGURED_REPOSITORY=false` only for a trusted multi-repository environment.

Run the API:

```bash
.venv/bin/uvicorn claude_schedule.main:app --reload
```

Run the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

## Quality checks

```bash
.venv/bin/pytest -q
.venv/bin/ruff check src tests
.venv/bin/mypy src
cd frontend && npm run build && npm run lint
```
