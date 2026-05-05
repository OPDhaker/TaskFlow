"use client";

import { X } from "lucide-react";

import { Task, TaskStatus } from "../lib/api";
import { cn } from "../lib/utils";
import { formatDate, priorityLabel, priorityTone, statusLabel, statusOptions, typeLabel } from "../lib/tasks";
import { DependencyPanel } from "./dependency-panel";
import { NavDirectionLink } from "./nav-direction-link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export function TaskDetailView({
  task,
  relatedTasks,
  order,
  dependencyError,
  mode,
  onStatusChange,
  onToggleTimer,
  onDelete,
  onOpenTask,
  onClose,
  trackedLabel,
}: {
  task: Task;
  relatedTasks: Task[];
  order: Task[];
  dependencyError: string | null;
  mode: "page" | "panel";
  onStatusChange: (status: TaskStatus) => void;
  onToggleTimer: () => void;
  onDelete: () => void;
  onOpenTask?: (id: string) => void;
  onClose?: () => void;
  trackedLabel: string;
}) {
  return (
    <div className={cn("flex flex-col gap-8", mode === "panel" ? "min-h-full" : "")}>
      <section className="glass-panel glass-panel-strong gap-6 p-6 sm:p-8" style={{ viewTransitionName: `task-card-${task.id}` }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="subtle">{typeLabel[task.type]}</Badge>
              <span
                className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-[0.01em]", priorityTone[task.priority])}
                style={{ viewTransitionName: `task-priority-${task.id}` }}
              >
                {priorityLabel[task.priority]}
              </span>
              <Badge variant="outline">{statusLabel[task.status]}</Badge>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className={cn("font-display tracking-[-0.04em] text-foreground", mode === "panel" ? "text-3xl leading-[1.02]" : "text-4xl leading-[0.98] sm:text-5xl")} style={{ viewTransitionName: `task-title-${task.id}` }}>
                {task.title}
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">{task.description || "No description."}</p>
              <div className="flex flex-wrap gap-2">
                {task.intervalDays ? <Badge variant="outline">Recurring {task.intervalDays} days</Badge> : null}
                {task.deadlineHours ? <Badge variant="outline">Urgent {task.deadlineHours}h SLA</Badge> : null}
                {task.nextOccurrence ? <Badge variant="outline">Next {formatDate(task.nextOccurrence)}</Badge> : null}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {mode === "panel" ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <NavDirectionLink href={`/tasks/${task.id}`} direction="forward">
                    Open page
                  </NavDirectionLink>
                </Button>
                <Button type="button" variant="outline" size="icon" aria-label="Close detail panel" onClick={onClose}>
                  <X className="size-4" />
                </Button>
              </>
            ) : (
              <Button asChild variant="outline" size="sm">
                <NavDirectionLink href="/" direction="back">
                  Back to workspace
                </NavDirectionLink>
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="outline">Due {formatDate(task.dueDate)}</Badge>
          <Badge variant="outline">
            Tracked <span style={{ viewTransitionName: `task-timer-${task.id}` }}>{trackedLabel}</span>
          </Badge>
          <Badge variant="outline">Created {formatDate(task.createdAt)}</Badge>
          <Badge variant="outline">Dependencies {String(task.dependsOn?.length ?? 0)}</Badge>
        </div>
      </section>

      <section className={cn("grid gap-6", mode === "panel" ? "xl:grid-cols-1" : "xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.72fr)]")}>
        <div className="flex flex-col gap-6">
          <section className="glass-panel p-6">
            <div className="mb-6 flex flex-col gap-2">
              <p className="eyebrow">Actions</p>
              <h3 className="section-title">Keep work moving</h3>
            </div>
            <div className="grid gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="flex flex-col gap-3">
                <Label>Status</Label>
                <Select value={task.status} onValueChange={(value) => onStatusChange(value as TaskStatus)}>
                  <SelectTrigger aria-label={`Status for ${task.title}`}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {statusOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {statusLabel[option]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <Button onClick={onToggleTimer}>{task.isTimerRunning ? "Stop timer" : "Start timer"}</Button>
                <Button variant="ghost" onClick={onDelete}>
                  Delete task
                </Button>
              </div>
            </div>
          </section>

          <section className="glass-panel p-6">
            <div className="mb-6 flex flex-col gap-2">
              <p className="eyebrow">Related</p>
              <h3 className="section-title">Adjacent tasks</h3>
            </div>
            <div className="flex flex-col gap-3">
              {relatedTasks.length === 0 ? <div className="list-muted">No nearby tasks.</div> : null}
              {relatedTasks.map((item) =>
                onOpenTask ? (
                  <button key={item.id} type="button" className="task-mini-row text-left" onClick={() => onOpenTask(item.id)}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">{formatDate(item.dueDate)}</p>
                    </div>
                    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-[0.01em]", priorityTone[item.priority])}>
                      {priorityLabel[item.priority]}
                    </span>
                  </button>
                ) : (
                  <NavDirectionLink key={item.id} href={`/tasks/${item.id}`} direction="forward" className="task-mini-row">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">{formatDate(item.dueDate)}</p>
                    </div>
                    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-[0.01em]", priorityTone[item.priority])}>
                      {priorityLabel[item.priority]}
                    </span>
                  </NavDirectionLink>
                ),
              )}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <DependencyPanel tasks={order} error={dependencyError} />
        </div>
      </section>
    </div>
  );
}
