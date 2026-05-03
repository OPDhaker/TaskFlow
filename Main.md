Build a C++ + Next.js Task Manager SaaS. This is a college project that needs to demonstrate OOP concepts (inheritance, polymorphism, vectors, stacks, queues) while looking like a real product. Complete the entire thing end-to-end.

## Project Structure
/backend   → C++ Crow HTTP server
/frontend  → Next.js app (use existing setup or init new)

## Backend (C++)

### Class Hierarchy
- `Task` (abstract base): id (uuid), title, description, dueDate, priority (enum: LOW/MEDIUM/HIGH/URGENT), status (enum: TODO/IN_PROGRESS/DONE), createdAt, timeSpentSeconds. Pure virtual `execute()` and `getType()`. Override `<<` operator for serialization. Friend function `toJSON()`.
- `UrgentTask` extends Task: has `deadlineHours` field. `execute()` auto-sets priority to URGENT.
- `RecurringTask` extends Task: has `intervalDays` field and `nextOccurrence`. `execute()` computes next occurrence date.
- `DependentTask` extends Task: has `vector<string> dependsOn` (task IDs). `execute()` checks if all deps are DONE before allowing status change.
- `TaskManager` class: holds `vector<Task*> tasks`, `stack<pair<string,Task*>> undoStack`, `stack<pair<string,Task*>> redoStack`, `priority_queue` with custom comparator. Methods: addTask, removeTask, updateTask, undoLast, redoLast, getNextPriority, getTopologicalOrder.

### DAG + Topological Sort
Implement Kahn's algorithm on DependentTask dependencies. `GET /tasks/order` returns tasks in valid execution order. Throw 400 if cycle detected.

### HTTP Server (Crow)
Use Crow (header-only, fetch from github). Use nlohmann/json for serialization. Use SQLite (sqlite3.h) for persistence with a `tasks` table that has a `type` column to reconstruct the right subclass on load.

Routes:
- `GET    /tasks`           → all tasks as JSON array
- `POST   /tasks`           → create task, body includes `type` field (urgent/recurring/dependent/basic)
- `PATCH  /tasks/:id`       → update fields
- `DELETE /tasks/:id`       → delete
- `POST   /tasks/:id/start` → start time tracking
- `POST   /tasks/:id/stop`  → stop time tracking, persist elapsed
- `POST   /undo`            → pop undo stack, reverse last mutation
- `POST   /redo`            → pop redo stack
- `GET    /tasks/next`      → return highest priority task from PQ
- `GET    /tasks/order`     → topological sort of dependent tasks
- `GET    /export`          → stream all tasks as CSV using << operator

Add CORS middleware allowing all origins. Server runs on port 8080.

### Build
Use CMakeLists.txt. Fetch Crow and nlohmann/json via FetchContent. Link sqlite3 system library.

---

## Frontend (Next.js)

Use Tailwind CSS. Keep it clean, minimal, dark-mode friendly.

Pages/components needed:
- `TaskBoard` — kanban-style columns: TODO / IN_PROGRESS / DONE. Each card shows title, type badge (color-coded), priority badge, time spent, due date.
- `AddTaskModal` — form to create any task type. Show relevant extra fields based on type selection (e.g. intervalDays for recurring, dependsOn multi-select for dependent).
- `WhatNextButton` — calls `GET /tasks/next`, highlights that task on the board with a glow effect.
- `UndoRedoBar` — floating bottom bar with undo/redo buttons.
- `DependencyView` — simple list showing `GET /tasks/order` result as a numbered execution order.
- `ExportButton` — calls `GET /export`, triggers CSV download.

API client at `lib/api.ts` — typed wrapper around all backend routes using fetch. All calls go to `http://localhost:8080`.

---

## Execution Order
1. Set up CMakeLists.txt and fetch dependencies
2. Implement Task class hierarchy in `backend/src/models/`
3. Implement TaskManager with all data structures
4. Set up SQLite schema and persistence layer
5. Wire all Crow routes
6. Test all routes work via a quick curl/main test
7. Init or update Next.js frontend
8. Build all components
9. Wire api.ts and connect components to backend
10. Verify full flow: create task → view on board → undo → what's next → export