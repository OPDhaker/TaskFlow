"use client";

import { Task } from "../lib/api";

export function DependencyView({ tasks, error }: { tasks: Task[]; error: string | null }) {
  return (
    <section className="rounded-3xl border border-line bg-panel/80 p-5">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Dependency Order</p>
        <h2 className="font-display text-2xl">Execution graph</h2>
      </div>
      {error ? <div className="mb-4 rounded-2xl border border-rose/50 bg-rose/10 p-3 text-sm text-rose-200">{error}</div> : null}
      <ol className="space-y-3">
        {tasks.map((task, index) => (
          <li key={task.id} className="rounded-2xl border border-line bg-panelSoft/70 p-3">
            <span className="mr-3 text-slate-400">{index + 1}.</span>
            <span>{task.title}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
