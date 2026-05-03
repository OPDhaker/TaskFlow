import type { Task, TaskPriority, TaskStatus } from "./api";

export type SortKey = "due-asc" | "priority-desc" | "created-desc" | "time-desc";

export const statusOptions: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
export const priorityOptions: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export const statusLabel: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export const priorityTone: Record<TaskPriority, string> = {
  LOW: "border border-slate-300/90 bg-slate-100 text-slate-700 dark:border-white/14 dark:bg-white/8 dark:text-slate-200",
  MEDIUM: "border border-cyan-300/70 bg-cyan-100 text-cyan-900 dark:border-cyan-400/24 dark:bg-cyan-500/14 dark:text-cyan-100",
  HIGH: "border border-slate-400/30 bg-slate-200/95 text-slate-900 dark:border-slate-400/24 dark:bg-slate-700/40 dark:text-slate-100",
  URGENT: "border border-rose-300/80 bg-rose-100 text-rose-900 dark:border-rose-400/24 dark:bg-rose-500/14 dark:text-rose-100",
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

export function isOverdue(task: Task) {
  return task.status !== "DONE" && new Date(task.dueDate).getTime() < Date.now();
}

export function getTaskMetrics(tasks: Task[]) {
  const total = tasks.length;
  const done = tasks.filter((task) => task.status === "DONE").length;
  const activeTimers = tasks.filter((task) => task.isTimerRunning).length;
  const overdue = tasks.filter(isOverdue).length;
  const blocked = tasks.filter((task) => task.type === "dependent" && (task.dependsOn?.length ?? 0) > 0).length;
  const trackedSeconds = tasks.reduce((sum, task) => sum + task.timeSpentSeconds, 0);

  return {
    total,
    done,
    activeTimers,
    overdue,
    blocked,
    trackedSeconds,
    completionRate: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}

export function filterAndSortTasks(tasks: Task[], filters: { q: string; status: string; priority: string; sort: SortKey }) {
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
        return right.timeSpentSeconds - left.timeSpentSeconds;
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
