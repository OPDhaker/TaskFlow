"use client";

import { Task, TaskStatus } from "../lib/api";
import { cn } from "../lib/utils";
import { formatDate, priorityLabel, priorityTone, statusLabel, typeLabel } from "../lib/tasks";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const groups: { status: TaskStatus; title: string }[] = [
  { status: "TODO", title: "To do" },
  { status: "IN_PROGRESS", title: "In progress" },
  { status: "DONE", title: "Done" },
];

export function TaskBoard({
  tasks,
  highlightedTaskId,
  selectedTaskId,
  onOpenTask,
  onDelete,
  onStatusChange,
  onToggleTimer,
  getTrackedLabel,
}: {
  tasks: Task[];
  highlightedTaskId: string | null;
  selectedTaskId: string | null;
  onOpenTask: (taskId: string) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onToggleTimer: (task: Task) => void;
  getTrackedLabel: (task: Task) => string;
}) {
  return (
    <section className="glass-panel overflow-hidden">
      <div className="border-b border-white/12 px-6 py-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Workspace</p>
            <h2 className="section-title">All tasks</h2>
          </div>
          <p className="text-sm text-muted-foreground">{tasks.length} visible items</p>
        </div>
      </div>

      <div className="divide-y divide-white/10">
        {groups.map((group) => {
          const sectionTasks = tasks.filter((task) => task.status === group.status);

          return (
            <section key={group.status} className="px-6 py-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold tracking-[-0.03em] text-foreground">{group.title}</h3>
                  <Badge variant="subtle">{sectionTasks.length}</Badge>
                </div>
              </div>

              {sectionTasks.length === 0 ? (
                <div className="py-4 text-sm text-muted-foreground">No tasks.</div>
              ) : (
                <div className="overflow-hidden rounded-[1.4rem] border border-white/12 bg-white/6">
                  {sectionTasks.map((task, index) => (
                    <article
                      key={task.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpenTask(task.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onOpenTask(task.id);
                        }
                      }}
                      className={cn(
                        "grid cursor-pointer gap-4 px-4 py-4 transition-[background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 md:grid-cols-[minmax(0,1.45fr)_minmax(210px,0.7fr)_minmax(240px,0.85fr)] md:items-center",
                        index > 0 ? "border-t border-white/10" : "",
                        highlightedTaskId === task.id || selectedTaskId === task.id
                          ? "bg-primary/10 shadow-[inset_0_0_0_1px_hsl(var(--ring)/0.2)]"
                          : "bg-white/0 hover:bg-white/8",
                      )}
                      style={{ viewTransitionName: `task-card-${task.id}` }}
                    >
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge variant="subtle">{typeLabel[task.type]}</Badge>
                          <span
                            className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-[0.01em]", priorityTone[task.priority])}
                            style={{ viewTransitionName: `task-priority-${task.id}` }}
                          >
                            {priorityLabel[task.priority]}
                          </span>
                        </div>
                        <h4 className="truncate text-base font-semibold tracking-[-0.03em]" style={{ viewTransitionName: `task-title-${task.id}` }}>
                          {task.title}
                        </h4>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{task.description || "No description."}</p>
                      </div>

                      <div className="grid gap-2 text-sm text-muted-foreground">
                        <MetaLine label="Due" value={formatDate(task.dueDate)} />
                        <MetaLine label="Tracked" value={getTrackedLabel(task)} viewName={`task-timer-${task.id}`} />
                        {task.nextOccurrence ? <MetaLine label="Next" value={formatDate(task.nextOccurrence)} /> : null}
                        {task.dependsOn?.length ? <MetaLine label="Depends" value={`${task.dependsOn.length} task${task.dependsOn.length > 1 ? "s" : ""}`} /> : null}
                      </div>

                      <div className="flex flex-col gap-3 md:items-end" onClick={(event) => event.stopPropagation()}>
                        <div className="w-full md:max-w-[180px]">
                          <Select value={task.status} onValueChange={(value) => onStatusChange(task, value as TaskStatus)}>
                            <SelectTrigger aria-label={`Status for ${task.title}`}>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {groups.map((option) => (
                                  <SelectItem key={option.status} value={option.status}>
                                    {statusLabel[option.status]}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-wrap gap-2 md:justify-end">
                          <Button variant="outline" size="sm" onClick={() => onToggleTimer(task)}>
                            {task.isTimerRunning ? "Stop" : "Start"}
                          </Button>
                          <Button size="sm" onClick={() => onOpenTask(task.id)}>
                            Open
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onDelete(task)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}

function MetaLine({ label, value, viewName }: { label: string; value: string; viewName?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] uppercase tracking-[0.12em]">{label}</span>
      <span className="text-foreground" style={viewName ? { viewTransitionName: viewName } : undefined}>
        {value}
      </span>
    </div>
  );
}
