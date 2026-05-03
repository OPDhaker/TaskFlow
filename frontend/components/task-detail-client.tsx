"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Task, api } from "../lib/api";
import { setNavDirection } from "../lib/nav-direction";
import { TaskDetailView } from "./task-detail-view";

export function TaskDetailClient({
  initialTask,
  initialTasks,
  initialOrder,
  initialDependencyError,
}: {
  initialTask: Task;
  initialTasks: Task[];
  initialOrder: Task[];
  initialDependencyError: string | null;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [order, setOrder] = useState(initialOrder);
  const [dependencyError, setDependencyError] = useState(initialDependencyError);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const task = useMemo(() => tasks.find((item) => item.id === initialTask.id) ?? initialTask, [initialTask, tasks]);
  const relatedTasks = useMemo(
    () =>
      [...tasks]
        .filter((item) => item.id !== task.id)
        .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
        .slice(0, 4),
    [task.id, tasks],
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

  return (
    <main id="main-content" className="workspace-main">
      <TaskDetailView
        task={task}
        relatedTasks={relatedTasks}
        order={order}
        dependencyError={dependencyError}
        error={error}
        mode="page"
        onStatusChange={(status) => runMutation(() => api.updateTask(task.id, { status }))}
        onToggleTimer={() => runMutation(() => (task.isTimerRunning ? api.stopTask(task.id) : api.startTask(task.id)))}
        onDelete={async () => {
          await runMutation(() => api.deleteTask(task.id));
          setNavDirection("back");
          router.push("/");
        }}
        onUndo={() => runMutation(() => api.undo())}
        onRedo={() => runMutation(() => api.redo())}
      />
    </main>
  );
}
