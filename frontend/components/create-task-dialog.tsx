"use client";

import { FormEvent, useState } from "react";

import { Task, TaskPriority, TaskType } from "../lib/api";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

const priorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

function toBackendUtc(value: string) {
  return `${value}:00Z`;
}

export function CreateTaskDialog({
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
  const [deadlineHours, setDeadlineHours] = useState(6);
  const [intervalDays, setIntervalDays] = useState(7);
  const [dependsOn, setDependsOn] = useState<string[]>([]);

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
    resetForm();
  }

  function resetForm() {
    setType("basic");
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("MEDIUM");
    setDeadlineHours(6);
    setIntervalDays(7);
    setDependsOn([]);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-3xl p-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-0">
          <DialogHeader className="border-b border-slate-200/90 px-6 py-6 dark:border-white/12 sm:px-8">
            <DialogTitle className="section-title">Create Task</DialogTitle>
            <DialogDescription>Same backend contract. Arctic workspace shell.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 px-6 py-6 sm:px-8 md:grid-cols-2">
            <SelectField
              label="Task type"
              value={type}
              onValueChange={(value) => setType(value as TaskType)}
              items={[
                { value: "basic", label: "Basic" },
                { value: "urgent", label: "Urgent" },
                { value: "recurring", label: "Recurring" },
                { value: "dependent", label: "Dependent" },
              ]}
            />

            <SelectField
              label="Priority"
              value={priority}
              onValueChange={(value) => setPriority(value as TaskPriority)}
              items={priorities.map((item) => ({ value: item, label: item }))}
            />

            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                name="title"
                autoComplete="off"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Launch review deck…"
                required
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                name="description"
                autoComplete="off"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Context, expected output, blockers…"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="task-due-date">Due date</Label>
              <Input id="task-due-date" name="dueDate" type="datetime-local" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required />
            </div>

            {type === "urgent" ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="task-deadline-hours">Deadline hours</Label>
                <Input id="task-deadline-hours" name="deadlineHours" type="number" min={1} value={deadlineHours} onChange={(event) => setDeadlineHours(Number(event.target.value))} />
              </div>
            ) : null}

            {type === "recurring" ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="task-interval-days">Interval days</Label>
                <Input id="task-interval-days" name="intervalDays" type="number" min={1} value={intervalDays} onChange={(event) => setIntervalDays(Number(event.target.value))} />
              </div>
            ) : null}

            {type === "dependent" ? (
              <div className="flex flex-col gap-3 md:col-span-2">
                <Label>Dependencies</Label>
                <div className="grid gap-3 rounded-[1.4rem] border border-slate-200/90 bg-slate-50/88 p-4 dark:border-white/12 dark:bg-white/6 sm:grid-cols-2">
                  {tasks.length === 0 ? <p className="text-sm text-muted-foreground">Create tasks first.</p> : null}
                  {tasks.map((task) => (
                    <label
                      key={task.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-[1rem] border px-3 py-3 text-sm transition-colors",
                        dependsOn.includes(task.id)
                          ? "border-primary/30 bg-primary/10"
                          : "border-slate-200/90 bg-white/88 dark:border-white/12 dark:bg-white/6",
                      )}
                    >
                      <Checkbox
                        checked={dependsOn.includes(task.id)}
                        onCheckedChange={(checked) => {
                          setDependsOn((current) => (checked ? [...current, task.id] : current.filter((id) => id !== task.id)));
                        }}
                      />
                      <span className="font-medium">{task.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="border-t border-slate-200/90 px-6 py-5 dark:border-white/12 sm:px-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SelectField({
  label,
  value,
  onValueChange,
  items,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger aria-label={label}>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
