# Repository Guidelines

## Project Structure & Module Organization

This repository is a two-part monorepo:

- `backend/`: C++17 API server built with Crow, SQLite, and CMake.
- `frontend/`: Next.js App Router app with TypeScript and Tailwind CSS.
- `backend/src/models/`: task hierarchy (`Task`, `BasicTask`, `UrgentTask`, `RecurringTask`, `DependentTask`).
- `backend/src/manager/`: task orchestration, undo/redo, priority queue, dependency ordering.
- `backend/src/persistence/`: SQLite load/save logic.
- `backend/tests/`: C++ logic tests.
- `frontend/components/`: UI building blocks.
- `frontend/lib/`: typed API client for `http://localhost:8080`.

## Build, Test, and Development Commands

Backend:

- `cd backend && cmake -S . -B build`: configure project and fetch Crow/json.
- `cd backend && cmake --build build`: compile server and tests.
- `cd backend && ./build/task_server`: start backend on port `8080`.
- `cd backend && ctest --test-dir build --output-on-failure`: run C++ tests.
- `cd backend && ./smoke.sh`: run HTTP smoke flow against running server.

Frontend:

- `cd frontend && npm install`: install Next.js dependencies.
- `cd frontend && npm run dev`: start local UI on port `3000`.
- `cd frontend && npm run build`: production build check.

## Coding Style & Naming Conventions

Use ASCII unless file already needs Unicode. Prefer short, direct code comments only where logic is non-obvious.

- C++: 2-space or 4-space consistency per file, `PascalCase` for classes, `camelCase` for methods, trailing `_` for private fields.
- TypeScript/React: `PascalCase` for components, `camelCase` for functions and props, colocate UI in `frontend/components/`.
- Keep route contracts and startup instructions aligned with `README.md`.

## Testing Guidelines

Backend tests use plain C++ assertions in `backend/tests/task_manager_tests.cpp`. Add coverage for task subtype behavior, undo/redo, timers, persistence, and dependency ordering when changing backend logic.

Name new tests by behavior group inside the existing test executable. Run `ctest` before submitting backend changes.

## Commit & Pull Request Guidelines

Git history is not available in this workspace, so use a simple imperative style such as:

- `feat: add recurring task next occurrence`
- `fix: prevent dependent task status change before deps complete`

PRs should include:

- clear summary of behavior changes
- test evidence (`ctest`, `npm run build`, smoke script)
- screenshots for frontend UI changes
- README updates if build or startup flow changed

## Configuration & Agent Notes

Start backend from `backend/` so `tasks.db` lands in a predictable location. If startup process changes, update `README.md` in the same change set.
