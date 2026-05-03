import { Task } from "./api";

const BASE_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8080";

async function serverRequest<T>(path: string) {
  const response = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export async function fetchWorkspaceData(): Promise<{
  tasks: Task[];
  order: Task[];
  dependencyError: string | null;
}> {
  let dependencyError: string | null = null;
  const [tasks, order] = await Promise.all([
    serverRequest<Task[]>("/tasks"),
    serverRequest<Task[]>("/tasks/order").catch(async (error: Error) => {
      dependencyError = error.message;
      return [];
    }),
  ]);

  return { tasks, order, dependencyError };
}
