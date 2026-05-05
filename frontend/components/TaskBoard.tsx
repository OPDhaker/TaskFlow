"use client";

import { Task, TaskStatus } from "../lib/api";
import { priorityLabel, priorityTone } from "../lib/tasks";
import { cn } from "../lib/utils";

const columns: { status: TaskStatus; label: string }[] = [
  { status: "TODO", label: "To Do" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "DONE", label: "Done" },
];

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}m ${remaining}s`;
}

export function TaskBoard({
  tasks,
  highlightedTaskId,
  onStatusChange,
  onDelete,
  onToggleTimer,
}: {
  tasks: Task[];
  highlightedTaskId: string | null;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onDelete: (task: Task) => void;
  onToggleTimer: (task: Task) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {columns.map((column) => (
        <section key={column.status} className="rounded-3xl border border-line bg-panel/80 p-4 backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl">{column.label}</h2>
            <span className="rounded-full border border-line px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">
              {tasks.filter((task) => task.status === column.status).length}
            </span>
          </div>
          <div className="space-y-3">
            {tasks
              .filter((task) => task.status === column.status)
              .map((task) => (
                <article
                  key={task.id}
                  className={`rounded-2xl border p-4 transition ${highlightedTaskId === task.id ? "border-glow bg-glow/10 shadow-glow" : "border-line bg-panelSoft/70"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{task.title}</h3>
                      <p className="mt-1 text-sm text-slate-300">{task.description || "No description"}</p>
                    </div>
                    <button className="text-sm text-rose hover:text-white" onClick={() => onDelete(task)}>
                      Delete
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-slate-200">
                    <span className="rounded-full bg-cyan/15 px-2 py-1">{task.type}</span>
                    <span className={cn("rounded-full px-2 py-1 normal-case tracking-normal", priorityTone[task.priority])}>{priorityLabel[task.priority]}</span>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-slate-300">
                    <span>Due {new Date(task.dueDate).toLocaleString()}</span>
                    <span>Tracked {formatSeconds(task.timeSpentSeconds)}</span>
                    {task.nextOccurrence ? <span>Next {new Date(task.nextOccurrence).toLocaleString()}</span> : null}
                    {task.dependsOn?.length ? <span>Depends on {task.dependsOn.join(", ")}</span> : null}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {columns.map((option) => (
                      <button
                        key={option.status}
                        className={`rounded-full px-3 py-1 text-xs ${task.status === option.status ? "bg-white text-ink" : "border border-line text-slate-200"}`}
                        onClick={() => onStatusChange(task, option.status)}
                      >
                        {option.label}
                      </button>
                    ))}
                    <button className="rounded-full border border-line px-3 py-1 text-xs text-slate-200" onClick={() => onToggleTimer(task)}>
                      {task.isTimerRunning ? "Stop Timer" : "Start Timer"}
                    </button>
                  </div>
                </article>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
