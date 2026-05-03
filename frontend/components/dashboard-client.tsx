"use client";

import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Task, TaskStatus, api } from "../lib/api";
import { filterAndSortTasks, formatSeconds, getNextSuggestion, getTaskMetrics, priorityOptions, statusLabel, statusOptions, type SortKey } from "../lib/tasks";
import { CreateTaskDialog } from "./create-task-dialog";
import { DependencyPanel } from "./dependency-panel";
import { TaskBoard } from "./task-board";
import { TaskDetailView } from "./task-detail-view";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

function buildQuery(searchParams: URLSearchParams, patch: Record<string, string>) {
  const next = new URLSearchParams(searchParams);
  for (const [key, value] of Object.entries(patch)) {
    if (!value || value === "ALL") next.delete(key);
    else next.set(key, value);
  }
  return next.toString();
}

export function DashboardClient({
  initialTasks,
  initialOrder,
  initialDependencyError,
}: {
  initialTasks: Task[];
  initialOrder: Task[];
  initialDependencyError: string | null;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [order, setOrder] = useState(initialOrder);
  const [dependencyError, setDependencyError] = useState(initialDependencyError);
  const [error, setError] = useState<string | null>(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "ALL";
  const priority = searchParams.get("priority") ?? "ALL";
  const sort = (searchParams.get("sort") as SortKey | null) ?? "due-asc";
  const selectedTaskId = searchParams.get("task");
  const deferredQuery = useDeferredValue(q);

  const visibleTasks = useMemo(
    () => filterAndSortTasks(tasks, { q: deferredQuery, status, priority, sort }),
    [deferredQuery, priority, sort, status, tasks],
  );
  const metrics = useMemo(() => getTaskMetrics(tasks), [tasks]);
  const nextSuggestion = useMemo(() => getNextSuggestion(tasks), [tasks]);
  const selectedTask = useMemo(() => tasks.find((task) => task.id === selectedTaskId) ?? null, [selectedTaskId, tasks]);
  const relatedTasks = useMemo(
    () =>
      selectedTask
        ? [...tasks]
            .filter((item) => item.id !== selectedTask.id)
            .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
            .slice(0, 4)
        : [],
    [selectedTask, tasks],
  );

  async function refreshAll() {
    try {
      setError(null);
      let nextDependencyError: string | null = null;
      const [taskList, dependencyOrder] = await Promise.all([
        api.getTasks(),
        api.getDependencyOrder().catch((reason: Error) => {
          nextDependencyError = reason.message;
          return [];
        }),
      ]);
      setTasks(taskList);
      setOrder(dependencyOrder);
      setDependencyError(nextDependencyError);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unknown error");
    }
  }

  async function runMutation(callback: () => Promise<unknown>) {
    try {
      setError(null);
      await callback();
      await refreshAll();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unknown error");
    }
  }

  function updateFilters(patch: Record<string, string>) {
    startTransition(() => {
      const query = buildQuery(new URLSearchParams(searchParams), patch);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  useEffect(() => {
    if (selectedTaskId && !selectedTask) {
      updateFilters({ task: "" });
    }
  }, [pathname, router, searchParams, selectedTask, selectedTaskId]);

  async function handleWhatNext() {
    try {
      const task = await api.getNextTask();
      if ("id" in task) {
        setHighlightedTaskId(task.id);
        window.setTimeout(() => setHighlightedTaskId(null), 5000);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unknown error");
    }
  }

  async function handleExport() {
    try {
      const blob = await api.exportCsv();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "tasks.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unknown error");
    }
  }

  return (
    <main id="main-content" className="workspace-main">
      <div className="flex flex-col gap-10">
        <section className="workspace-intro">
          <div className="flex flex-col gap-5">
            <Badge className="w-fit">Task ops</Badge>
            <div className="flex flex-col gap-4">
              <h2 className="hero-title max-w-5xl noise-cut">Calm queue control for work that needs structure, not clutter.</h2>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">One workspace for task flow, timing, dependencies, and direct action. Open any row to work the detail surface without leaving the list.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => setDialogOpen(true)}>
              New task
            </Button>
            <Button size="lg" variant="outline" onClick={handleWhatNext}>
              Next up
            </Button>
            <Button size="lg" variant="outline" onClick={handleExport}>
              Export
            </Button>
          </div>
        </section>

        <section className="glass-panel p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(160px,0.72fr))]">
            <div className="flex flex-col gap-2">
              <Label htmlFor="dashboard-search">Search</Label>
              <Input
                id="dashboard-search"
                name="query"
                autoComplete="off"
                value={q}
                onChange={(event) => updateFilters({ q: event.target.value })}
                placeholder="Search title, type, or description…"
              />
            </div>
            <FilterSelect
              label="Status"
              value={status}
              onValueChange={(value) => updateFilters({ status: value })}
              placeholder="All statuses"
              items={[
                { value: "ALL", label: "All statuses" },
                ...statusOptions.map((option) => ({ value: option, label: statusLabel[option] })),
              ]}
            />
            <FilterSelect
              label="Priority"
              value={priority}
              onValueChange={(value) => updateFilters({ priority: value })}
              placeholder="All priorities"
              items={[
                { value: "ALL", label: "All priorities" },
                ...priorityOptions.map((option) => ({ value: option, label: option })),
              ]}
            />
            <FilterSelect
              label="Sort"
              value={sort}
              onValueChange={(value) => updateFilters({ sort: value })}
              placeholder="Due soonest"
              items={[
                { value: "due-asc", label: "Due soonest" },
                { value: "priority-desc", label: "Priority" },
                { value: "created-desc", label: "Newest" },
                { value: "time-desc", label: "Tracked time" },
              ]}
            />
          </div>
        </section>

        <section className="summary-strip">
          <MetricLine label="Completion" value={`${metrics.completionRate}%`} detail={`${metrics.done} of ${metrics.total} complete`} />
          <MetricLine label="Focus time" value={formatSeconds(metrics.trackedSeconds)} detail={`${metrics.activeTimers} active timer${metrics.activeTimers === 1 ? "" : "s"}`} />
          <MetricLine label="Overdue" value={String(metrics.overdue)} detail="Needs action" />
          <MetricLine label="Blocked" value={String(metrics.blocked)} detail="Dependency locked" />
        </section>

        {error ? (
          <div role="alert" className="glass-alert">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.62fr)]">
          <TaskBoard
            tasks={visibleTasks}
            highlightedTaskId={highlightedTaskId}
            selectedTaskId={selectedTaskId}
            onOpenTask={(taskId) => updateFilters({ task: taskId })}
            onDelete={async (task) => {
              await runMutation(() => api.deleteTask(task.id));
              if (selectedTaskId === task.id) {
                updateFilters({ task: "" });
              }
            }}
            onStatusChange={(task, nextStatus: TaskStatus) => runMutation(() => api.updateTask(task.id, { status: nextStatus }))}
            onToggleTimer={(task) => runMutation(() => (task.isTimerRunning ? api.stopTask(task.id) : api.startTask(task.id)))}
          />

          <div className="flex flex-col gap-6">
            <section className="glass-panel p-6">
              <div className="mb-5 flex flex-col gap-2">
                <p className="eyebrow">Next up</p>
                <h3 className="section-title">Suggested focus</h3>
              </div>
              {nextSuggestion ? (
                <button type="button" className="task-mini-row w-full text-left" onClick={() => updateFilters({ task: nextSuggestion.id })}>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold tracking-[-0.03em] text-foreground">{nextSuggestion.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{nextSuggestion.description || "No description."}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{nextSuggestion.priority}</Badge>
                    <Badge variant="outline">{statusLabel[nextSuggestion.status]}</Badge>
                  </div>
                </button>
              ) : (
                <div className="list-muted">Queue empty.</div>
              )}
            </section>

            <DependencyPanel tasks={order} error={dependencyError} />

            <section className="glass-panel p-6">
              <div className="mb-5 flex flex-col gap-2">
                <p className="eyebrow">History</p>
                <h3 className="section-title">Undo lane</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => runMutation(() => api.undo())}>
                  Undo
                </Button>
                <Button variant="outline" onClick={() => runMutation(() => api.redo())}>
                  Redo
                </Button>
              </div>
            </section>
          </div>
        </section>

        <div className="command-float">
          <div className="glass-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => runMutation(() => api.undo())}>
                Undo
              </Button>
              <Button variant="outline" size="sm" onClick={() => runMutation(() => api.redo())}>
                Redo
              </Button>
            </div>
            <Badge variant="subtle">{isPending ? "Updating" : "Synced"}</Badge>
          </div>
        </div>

        {selectedTask ? (
          <div className="detail-layer">
            <button type="button" className="detail-backdrop" aria-label="Close task detail" onClick={() => updateFilters({ task: "" })} />
            <aside className="detail-sheet" aria-label="Task detail panel">
              <TaskDetailView
                task={selectedTask}
                relatedTasks={relatedTasks}
                order={order}
                dependencyError={dependencyError}
                error={error}
                mode="panel"
                onStatusChange={(nextStatus) => runMutation(() => api.updateTask(selectedTask.id, { status: nextStatus }))}
                onToggleTimer={() => runMutation(() => (selectedTask.isTimerRunning ? api.stopTask(selectedTask.id) : api.startTask(selectedTask.id)))}
                onDelete={async () => {
                  await runMutation(() => api.deleteTask(selectedTask.id));
                  updateFilters({ task: "" });
                }}
                onUndo={() => runMutation(() => api.undo())}
                onRedo={() => runMutation(() => api.redo())}
                onOpenTask={(taskId) => updateFilters({ task: taskId })}
                onClose={() => updateFilters({ task: "" })}
              />
            </aside>
          </div>
        ) : null}
      </div>

      <CreateTaskDialog
        open={dialogOpen}
        tasks={tasks}
        onClose={() => setDialogOpen(false)}
        onSubmit={async (payload) => {
          await runMutation(async () => {
            await api.createTask(payload);
            setDialogOpen(false);
          });
        }}
      />
    </main>
  );
}

function FilterSelect({
  label,
  value,
  onValueChange,
  placeholder,
  items,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  items: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger aria-label={label}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function MetricLine({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="metric-strip">
      <p className="eyebrow">{label}</p>
      <p className="metric-value">{value}</p>
      <p className="text-sm leading-6 text-muted-foreground">{detail}</p>
    </div>
  );
}
