export type TaskType = "basic" | "urgent" | "recurring" | "dependent";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type Task = {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  timeSpentSeconds: number;
  isTimerRunning: boolean;
  deadlineHours?: number;
  intervalDays?: number;
  nextOccurrence?: string;
  dependsOn?: string[];
};

export type UndoRedoResponse = {
  action: string;
  taskCount: number;
  tasks: Task[];
};

const BASE_URL = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const hasBody = options?.body !== undefined;
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: hasBody ? { "Content-Type": "application/json", ...(options?.headers ?? {}) } : options?.headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  getTasks: () => request<Task[]>("/tasks"),
  createTask: (payload: Partial<Task> & { type: TaskType; title: string; dueDate: string }) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(payload) }),
  updateTask: (id: string, payload: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteTask: (id: string) => request<void>(`/tasks/${id}`, { method: "DELETE" }),
  startTask: (id: string) => request<Task>(`/tasks/${id}/start`, { method: "POST" }),
  stopTask: (id: string) => request<Task>(`/tasks/${id}/stop`, { method: "POST" }),
  undo: () => request<UndoRedoResponse>("/undo", { method: "POST" }),
  redo: () => request<UndoRedoResponse>("/redo", { method: "POST" }),
  getNextTask: () => request<Task | Record<string, never>>("/tasks/next"),
  getDependencyOrder: () => request<Task[]>("/tasks/order"),
  exportCsv: async () => {
    const response = await fetch(`${BASE_URL}/export`, { cache: "no-store" });
    if (!response.ok) throw new Error("Export failed");
    return response.blob();
  },
};
