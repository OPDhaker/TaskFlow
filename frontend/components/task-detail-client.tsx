"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Task, api } from "../lib/api";
import { formatTrackedDuration, getEffectiveTrackedMs } from "../lib/tasks";
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
  const [nowMs, setNowMs] = useState(() => Date.now());
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
      toast.error(reason instanceof Error ? reason.message : "Unknown error");
    }
  }

  async function runMutation(callback: () => Promise<unknown>) {
    try {
      await callback();
      await refreshAll();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Unknown error");
    }
  }

  useEffect(() => {
    const interval = window.setInterval(() => setNowMs(Date.now()), 100);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!tasks.some((item) => item.isTimerRunning)) return;
    const interval = window.setInterval(() => {
      void refreshAll();
    }, 1000);
    return () => window.clearInterval(interval);
  }, [tasks]);

  return (
    <main id="main-content" className="workspace-main">
      <TaskDetailView
        task={task}
        relatedTasks={relatedTasks}
        order={order}
        dependencyError={dependencyError}
        mode="page"
        trackedLabel={formatTrackedDuration(getEffectiveTrackedMs(task, nowMs), task.isTimerRunning)}
        onStatusChange={(status) => runMutation(() => api.updateTask(task.id, { status }))}
        onToggleTimer={() => runMutation(() => (task.isTimerRunning ? api.stopTask(task.id) : api.startTask(task.id)))}
        onDelete={async () => {
          await runMutation(() => api.deleteTask(task.id));
          setNavDirection("back");
          router.push("/");
        }}
      />
    </main>
  );
}
