import { notFound } from "next/navigation";

import { TaskDetailClient } from "../../../components/task-detail-client";
import { fetchWorkspaceData } from "../../../lib/server-api";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await fetchWorkspaceData();
  const task = data.tasks.find((item) => item.id === id);

  if (!task) {
    notFound();
  }

  return (
    <TaskDetailClient
      initialTask={task}
      initialTasks={data.tasks}
      initialOrder={data.order}
      initialDependencyError={data.dependencyError}
    />
  );
}
