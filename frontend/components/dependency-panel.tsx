import { Task } from "../lib/api";
import { formatDate, typeLabel } from "../lib/tasks";
import { Badge } from "./ui/badge";

export function DependencyPanel({ tasks, error }: { tasks: Task[]; error: string | null }) {
  return (
    <section className="glass-panel p-6">
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="subtle">Graph</Badge>
        </div>
        <div>
          <h3 className="section-title">Dependency order</h3>
          <p className="text-sm text-muted-foreground">Topological path.</p>
        </div>
      </div>

      {error ? (
        <div role="alert" className="glass-alert">
          {error}
        </div>
      ) : null}

      {tasks.length === 0 ? <div className="text-sm text-muted-foreground">No dependency path.</div> : null}

      <div className="flex flex-col gap-2">
        {tasks.map((task, index) => (
          <div key={task.id} className="task-mini-row">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">{index + 1}</span>
                <p className="truncate text-sm font-medium">{task.title}</p>
              </div>
              <p className="text-xs text-muted-foreground">{formatDate(task.dueDate)}</p>
            </div>
            <Badge variant="outline">{typeLabel[task.type]}</Badge>
          </div>
        ))}
      </div>
    </section>
  );
}
