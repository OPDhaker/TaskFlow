"use client";

import { FormEvent, useState } from "react";

import { Task, TaskPriority, TaskType } from "../lib/api";

const priorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

function toBackendUtc(value: string) {
  return `${value}:00Z`;
}

export function AddTaskModal({
  open,
  tasks,
  onClose,
  onSubmit,
}: {
  open: boolean;
  tasks: Task[];
  onClose: () => void;
  onSubmit: (payload: {
    type: TaskType;
    title: string;
    description: string;
    dueDate: string;
    priority: TaskPriority;
    deadlineHours?: number;
    intervalDays?: number;
    dependsOn?: string[];
  }) => Promise<void>;
}) {
  const [type, setType] = useState<TaskType>("basic");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [deadlineHours, setDeadlineHours] = useState(4);
  const [intervalDays, setIntervalDays] = useState(7);
  const [dependsOn, setDependsOn] = useState<string[]>([]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      type,
      title,
      description,
      dueDate: toBackendUtc(dueDate),
      priority,
      deadlineHours: type === "urgent" ? deadlineHours : undefined,
      intervalDays: type === "recurring" ? intervalDays : undefined,
      dependsOn: type === "dependent" ? dependsOn : undefined,
    });
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("MEDIUM");
    setDependsOn([]);
  }

  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-black/60 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-[2rem] border border-line bg-panel p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Create Task</p>
            <h2 className="font-display text-3xl">New work item</h2>
          </div>
          <button type="button" className="text-slate-400" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            Type
            <select className="rounded-2xl border border-line bg-panelSoft px-4 py-3" value={type} onChange={(event) => setType(event.target.value as TaskType)}>
              <option value="basic">Basic</option>
              <option value="urgent">Urgent</option>
              <option value="recurring">Recurring</option>
              <option value="dependent">Dependent</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            Priority
            <select className="rounded-2xl border border-line bg-panelSoft px-4 py-3" value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
              {priorities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm md:col-span-2">
            Title
            <input className="rounded-2xl border border-line bg-panelSoft px-4 py-3" value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>
          <label className="grid gap-2 text-sm md:col-span-2">
            Description
            <textarea className="min-h-28 rounded-2xl border border-line bg-panelSoft px-4 py-3" value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label className="grid gap-2 text-sm">
            Due Date
            <input className="rounded-2xl border border-line bg-panelSoft px-4 py-3" type="datetime-local" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required />
          </label>
          {type === "urgent" ? (
            <label className="grid gap-2 text-sm">
              Deadline Hours
              <input className="rounded-2xl border border-line bg-panelSoft px-4 py-3" type="number" min={1} value={deadlineHours} onChange={(event) => setDeadlineHours(Number(event.target.value))} />
            </label>
          ) : null}
          {type === "recurring" ? (
            <label className="grid gap-2 text-sm">
              Interval Days
              <input className="rounded-2xl border border-line bg-panelSoft px-4 py-3" type="number" min={1} value={intervalDays} onChange={(event) => setIntervalDays(Number(event.target.value))} />
            </label>
          ) : null}
          {type === "dependent" ? (
            <fieldset className="grid gap-2 text-sm md:col-span-2">
              <legend>Dependencies</legend>
              <div className="grid gap-2 rounded-2xl border border-line bg-panelSoft p-4">
                {tasks.length === 0 ? <span className="text-slate-400">Create tasks first.</span> : null}
                {tasks.map((task) => (
                  <label key={task.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={dependsOn.includes(task.id)}
                      onChange={(event) =>
                        setDependsOn((current) =>
                          event.target.checked ? [...current, task.id] : current.filter((id) => id !== task.id),
                        )
                      }
                    />
                    <span>{task.title}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="rounded-full border border-line px-4 py-2" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="rounded-full bg-glow px-5 py-2 text-ink">
            Create Task
          </button>
        </div>
      </form>
    </div>
  );
}
