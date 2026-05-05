import type { Task, TaskPriority, TaskStatus } from "./api";

export type SortKey = "due-asc" | "priority-desc" | "created-desc" | "time-desc";

export const statusOptions: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
export const priorityOptions: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
export const priorityLabel: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const statusLabel: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export const priorityTone: Record<TaskPriority, string> = {
  LOW: "border border-emerald-300/50 bg-emerald-400/20 text-emerald-100 shadow-[0_0_0_1px_rgba(110,231,183,0.12),0_12px_28px_-16px_rgba(16,185,129,0.85)]",
  MEDIUM: "border border-sky-300/50 bg-sky-400/20 text-sky-100 shadow-[0_0_0_1px_rgba(125,211,252,0.12),0_12px_28px_-16px_rgba(14,165,233,0.85)]",
  HIGH: "border border-amber-300/55 bg-amber-400/24 text-amber-100 shadow-[0_0_0_1px_rgba(252,211,77,0.16),0_12px_30px_-15px_rgba(245,158,11,0.95)]",
  URGENT: "border border-rose-300/60 bg-rose-500/24 text-rose-100 shadow-[0_0_0_1px_rgba(253,164,175,0.18),0_14px_34px_-14px_rgba(244,63,94,0.98)]",
};

export const typeLabel: Record<Task["type"], string> = {
  basic: "Basic",
  urgent: "Urgent",
  recurring: "Recurring",
  dependent: "Dependent",
};

const priorityScore: Record<TaskPriority, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  URGENT: 3,
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function formatSeconds(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds % 60}s`;
}

export function getEffectiveTrackedMs(task: Task, nowMs: number) {
  const baseMs = Math.max(0, task.timeSpentSeconds * 1000);
  if (!task.isTimerRunning || !task.activeStartedAt) return baseMs;
  const startedAtMs = new Date(task.activeStartedAt).getTime();
  if (Number.isNaN(startedAtMs)) return baseMs;
  return Math.max(0, baseMs + (nowMs - startedAtMs));
}

export function formatTrackedDuration(ms: number, withMilliseconds: boolean) {
  const safeMs = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const millis = safeMs % 1000;

  if (!withMilliseconds) {
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds}s`;
  }

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}.${String(millis).padStart(3, "0")}s`;
  return `${minutes}m ${seconds}.${String(millis).padStart(3, "0")}s`;
}

export function isOverdue(task: Task) {
  return task.status !== "DONE" && new Date(task.dueDate).getTime() < Date.now();
}

export function getTaskMetrics(tasks: Task[], nowMs: number) {
  const total = tasks.length;
  const done = tasks.filter((task) => task.status === "DONE").length;
  const activeTimers = tasks.filter((task) => task.isTimerRunning).length;
  const overdue = tasks.filter(isOverdue).length;
  const blocked = tasks.filter((task) => task.type === "dependent" && (task.dependsOn?.length ?? 0) > 0).length;
  const trackedMs = tasks.reduce((sum, task) => sum + getEffectiveTrackedMs(task, nowMs), 0);

  return {
    total,
    done,
    activeTimers,
    overdue,
    blocked,
    trackedMs,
    completionRate: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}

export function filterAndSortTasks(tasks: Task[], filters: { q: string; status: string; priority: string; sort: SortKey }, nowMs: number) {
  const q = filters.q.trim().toLowerCase();
  const filtered = tasks.filter((task) => {
    if (filters.status !== "ALL" && task.status !== filters.status) return false;
    if (filters.priority !== "ALL" && task.priority !== filters.priority) return false;
    if (!q) return true;
    const haystack = `${task.title} ${task.description} ${task.type}`.toLowerCase();
    return haystack.includes(q);
  });

  return [...filtered].sort((left, right) => {
    switch (filters.sort) {
      case "priority-desc":
        return priorityScore[right.priority] - priorityScore[left.priority] || left.dueDate.localeCompare(right.dueDate);
      case "created-desc":
        return right.createdAt.localeCompare(left.createdAt);
      case "time-desc":
        return getEffectiveTrackedMs(right, nowMs) - getEffectiveTrackedMs(left, nowMs);
      case "due-asc":
      default:
        return left.dueDate.localeCompare(right.dueDate);
    }
  });
}

export function getNextSuggestion(tasks: Task[]) {
  return [...tasks]
    .filter((task) => task.status !== "DONE")
    .sort((left, right) => {
      if (priorityScore[right.priority] !== priorityScore[left.priority]) {
        return priorityScore[right.priority] - priorityScore[left.priority];
      }
      return left.dueDate.localeCompare(right.dueDate);
    })[0];
}
