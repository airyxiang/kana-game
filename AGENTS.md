# Repository Guidelines

## Project Structure & Module Organization

This repository is currently a minimal scaffold (no source tree committed yet). When adding code, prefer a conventional layout so tooling and contributors can find things quickly:

- Source code: `src/` (or `app/` for an application-style package)
- Tests: `tests/` (mirror package structure where possible)
- Docs: `docs/` (architecture notes, ADRs, runbooks)
- Scripts: `scripts/` (one-off maintenance tasks)
- Assets/data: `assets/`, `data/` (avoid committing large/generated files)

Keep modules small and cohesive. If you introduce multiple domains, group them by feature (e.g., `src/<feature>/...`) rather than by technical layer alone.

## Build, Test, and Development Commands

No build/test commands are configured yet. If you add Python code, a typical local workflow is:

- Create venv: `python -m venv venv && source venv/bin/activate`
- Install deps: `pip install -r requirements.txt` (or `pip install -e .` if packaging is set up)
- Run tests: `pytest -q`

If you add a different stack (Node/Go/Rust), document the canonical commands in `README.md` and keep them stable.

## Coding Style & Naming Conventions

- Indentation: 4 spaces (Python) / 2 spaces (JS/TS), no tabs.
- Naming: `snake_case` for Python functions/vars, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants.
- Formatting/linting: if you introduce Python, prefer an auto-formatter (e.g., `ruff format` or `black`) plus a linter (e.g., `ruff`) and run it in CI.

## Testing Guidelines

- Prefer fast, deterministic unit tests; isolate network and external services behind fakes/mocks.
- Naming: `tests/test_*.py` and `test_*` functions; keep fixtures in `tests/conftest.py`.

## Commit & Pull Request Guidelines

There is no Git history to infer conventions from. Use clear, scoped commit messages (Conventional Commits recommended), e.g.:

- `feat: add kana drill CLI`
- `fix: handle empty input in parser`

PRs should include: a short summary, how to test, and screenshots for UI changes (if any). Avoid deleting files without explicit discussion/approval.
