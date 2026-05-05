# Task Manager SaaS

College OOP demo. Monorepo:

- `backend/` = C++17 + Crow + SQLite + CMake
- `frontend/` = Next.js App Router + TypeScript + Tailwind

Frontend talks to `http://localhost:8080`.

## Features

- Task class hierarchy: `Task`, `BasicTask`, `UrgentTask`, `RecurringTask`, `DependentTask`
- OOP concepts: inheritance, polymorphism, `vector`, `priority_queue`
- Realtime timer: live frontend ticking + backend periodic rollup/persist while running
- Dependency ordering via Kahn topological sort
- CSV export
- Single-page kanban UI

## Prereqs

Need local tools:

- CMake `>= 3.20`
- C++17 compiler
- `sqlite3` system library
- Git access during first backend configure
- Node.js `>= 20`
- npm or pnpm

## Project Layout

```text
backend/
  src/
    manager/
    models/
    persistence/
    routes/
    utils/
  tests/
frontend/
  app/
  components/
  lib/
```

## First-Time Setup

### 1. Install frontend deps

```bash
cd frontend
npm install
```

or

```bash
cd frontend
pnpm install
```

### 2. Configure backend

Crow, standalone `asio`, `nlohmann/json` fetched by CMake with `FetchContent`.

```bash
cd backend
cmake -S . -B build
```

If first run fails with network error, fix internet / GitHub access, then rerun same cmd.

### 3. Build backend

```bash
cd backend
cmake --build build
```

## Start Project

Need 2 terminals.

### Terminal 1: backend

```bash
cd backend
./build/task_server
```

Server runs on `http://localhost:8080`.

SQLite file:

- `backend/tasks.db` if run from `backend/`
- `tasks.db` in current working dir if run elsewhere

Best: start server from `backend/`.

### Terminal 2: frontend

```bash
cd frontend
npm run dev
```

or

```bash
cd frontend
pnpm dev
```

Open `http://localhost:3000`.

If you see repeated `/_next/static/... 404` chunk errors, run:

```bash
cd frontend
npm run dev:reset
```

## Backend Test

### Unit-style C++ tests

```bash
cd backend
ctest --test-dir build --output-on-failure
```

or direct:

```bash
cd backend
./build/task_manager_tests
```

### HTTP smoke script

Start backend first, then:

```bash
cd backend
./smoke.sh
```

## Frontend Build Check

After deps installed:

```bash
cd frontend
npm run build
```

## API Summary

- `GET /tasks`
- `POST /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`
- `POST /tasks/:id/start`
- `POST /tasks/:id/stop`
- `GET /tasks/next`
- `GET /tasks/order`
- `GET /export`

## Task Payload Notes

Common fields:

- `id`
- `type`
- `title`
- `description`
- `dueDate`
- `priority`
- `status`
- `createdAt`
- `timeSpentSeconds`
- `isTimerRunning`

Subtype fields:

- urgent: `deadlineHours`
- recurring: `intervalDays`, `nextOccurrence`
- dependent: `dependsOn`

Dates use ISO 8601 UTC, example:

```text
2026-05-02T10:00:00Z
```

## Common Problems

### Backend configure fails cloning Crow/json/asio

Cause: no network / GitHub DNS / firewall.

Fix:

- verify GitHub reachable
- rerun `cmake -S . -B build`

### Frontend TypeScript errors like `Cannot find module 'next'`

Cause: frontend deps not installed.

Fix:

```bash
cd frontend
npm install
```

### Frontend loads but API calls fail

Check:

- backend server running on `localhost:8080`
- frontend running on `localhost:3000`
- browser console for failed req

### Repeating `/_next/static` 404 chunks

Cause: dev and prod builds can conflict if you switch modes often.

Fix:

- this repo now isolates artifacts into `.next-dev` (dev) and `.next-prod` (build/start)
- use reset scripts if an old process/cache is stuck:

```bash
cd frontend
npm run dev:reset
```

## Dev Rule

If startup process changes, `README.md` must change in same edit set.

Current startup source of truth:

1. Install frontend deps
2. Configure backend with CMake
3. Build backend
4. Run backend from `backend/`
5. Run frontend from `frontend/`
