import { DashboardClient } from "../components/dashboard-client";
import { fetchWorkspaceData } from "../lib/server-api";

export default async function Page() {
  const data = await fetchWorkspaceData();
  return <DashboardClient initialTasks={data.tasks} initialOrder={data.order} initialDependencyError={data.dependencyError} />;
}
