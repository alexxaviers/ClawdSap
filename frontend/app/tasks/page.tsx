"use client"

import React from "react"

import { useState } from "react"
import DashboardShell from "@/components/dashboard-shell"
import {
  CheckCircle2,
  Clock,
  Circle,
  Plus,
  Search,
  Filter,
  Calendar,
  Tag,
  ArrowUpDown,
  Trash2,
  RotateCcw,
  ChevronDown,
} from "lucide-react"

type TaskStatus = "pending" | "running" | "done" | "failed"
type TaskPriority = "low" | "medium" | "high"

interface Task {
  id: number
  title: string
  status: TaskStatus
  priority: TaskPriority
  source: string
  scheduledFor: string
  createdAt: string
  tags: string[]
}

const INITIAL_TASKS: Task[] = [
  { id: 1, title: "Call the bank about mortgage", status: "pending", priority: "high", source: "WhatsApp", scheduledFor: "Today, 5:00 PM", createdAt: "2 hours ago", tags: ["finance"] },
  { id: 2, title: "Send weekly report to team", status: "running", priority: "medium", source: "Workflow", scheduledFor: "Today, 6:00 PM", createdAt: "3 hours ago", tags: ["work"] },
  { id: 3, title: "Book dentist appointment", status: "done", priority: "medium", source: "WhatsApp", scheduledFor: "Today, 2:00 PM", createdAt: "5 hours ago", tags: ["health"] },
  { id: 4, title: "Prepare meeting notes for Sam", status: "done", priority: "high", source: "WhatsApp", scheduledFor: "Today, 11:30 AM", createdAt: "6 hours ago", tags: ["work"] },
  { id: 5, title: "Order groceries for the week", status: "pending", priority: "low", source: "WhatsApp", scheduledFor: "Tomorrow, 9:00 AM", createdAt: "1 day ago", tags: ["personal"] },
  { id: 6, title: "Review and sign lease agreement", status: "pending", priority: "high", source: "WhatsApp", scheduledFor: "Tomorrow, 3:00 PM", createdAt: "1 day ago", tags: ["finance", "legal"] },
  { id: 7, title: "Cancel old streaming subscription", status: "failed", priority: "low", source: "WhatsApp", scheduledFor: "Yesterday", createdAt: "2 days ago", tags: ["personal"] },
  { id: 8, title: "Send birthday gift to Mom", status: "done", priority: "high", source: "WhatsApp", scheduledFor: "Yesterday, 10:00 AM", createdAt: "2 days ago", tags: ["personal"] },
  { id: 9, title: "Research flight tickets to Tokyo", status: "pending", priority: "medium", source: "WhatsApp", scheduledFor: "This week", createdAt: "3 days ago", tags: ["travel"] },
  { id: 10, title: "Backup phone photos to cloud", status: "done", priority: "low", source: "Workflow", scheduledFor: "Yesterday", createdAt: "3 days ago", tags: ["tech"] },
]

const ALL_TAGS = ["work", "personal", "finance", "health", "travel", "tech", "legal"]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [filter, setFilter] = useState<"all" | TaskStatus>("all")
  const [search, setSearch] = useState("")
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [showNewTask, setShowNewTask] = useState(false)
  const [sortBy, setSortBy] = useState<"newest" | "priority">("newest")

  const filtered = tasks
    .filter((t) => filter === "all" || t.status === filter)
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "priority") {
        const order: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 }
        return order[a.priority] - order[b.priority]
      }
      return b.id - a.id
    })

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      status: "pending",
      priority: "medium",
      source: "Manual",
      scheduledFor: "Unscheduled",
      createdAt: "Just now",
      tags: [],
    }
    setTasks((prev) => [newTask, ...prev])
    setNewTaskTitle("")
    setShowNewTask(false)
  }

  const toggleTaskDone = (id: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === "done" ? "pending" : "done" } : t,
      ),
    )
  }

  const retryTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "pending" } : t)),
    )
  }

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const statusIcon = (status: TaskStatus) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="w-4 h-4 text-accent" />
      case "running":
        return <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      case "failed":
        return <Circle className="w-4 h-4 text-destructive" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const priorityBadge = (priority: TaskPriority) => {
    const colors: Record<TaskPriority, string> = {
      high: "text-red-400 bg-red-400/10",
      medium: "text-yellow-400 bg-yellow-400/10",
      low: "text-muted-foreground bg-secondary",
    }
    return (
      <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${colors[priority]}`}>
        {priority}
      </span>
    )
  }

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    running: tasks.filter((t) => t.status === "running").length,
    done: tasks.filter((t) => t.status === "done").length,
    failed: tasks.filter((t) => t.status === "failed").length,
  }

  return (
    <DashboardShell activeItem="Tasks" title="Tasks" subtitle="Everything you've asked ClodsApp to handle.">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg w-fit">
          {(["all", "pending", "running", "done", "failed"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                filter === f
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
              <span className="ml-1.5 text-muted-foreground">{counts[f]}</span>
            </button>
          ))}
        </div>

        {/* Search + actions */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/30 focus:ring-2 focus:ring-accent/10 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => setSortBy(sortBy === "newest" ? "priority" : "newest")}
            className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortBy === "newest" ? "Newest" : "Priority"}
          </button>

          <button
            type="button"
            onClick={() => setShowNewTask(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>
        </div>
      </div>

      {/* New task form */}
      {showNewTask && (
        <form onSubmit={handleAddTask} className="mb-6 p-4 border border-accent/20 rounded-xl bg-accent/5">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to get done?"
              className="flex-1 px-3 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/30 transition-all"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-accent text-accent-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => { setShowNewTask(false); setNewTaskTitle("") }}
              className="px-3 py-2.5 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Task list */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-muted-foreground text-sm">No tasks found.</div>
            <p className="text-xs text-muted-foreground mt-1">Send a WhatsApp message to create one.</p>
          </div>
        ) : (
          filtered.map((task, i) => (
            <div
              key={task.id}
              className={`flex items-start gap-4 px-5 py-4 ${
                i < filtered.length - 1 ? "border-b border-border" : ""
              } hover:bg-secondary/30 transition-colors group`}
            >
              <button
                type="button"
                onClick={() => toggleTaskDone(task.id)}
                className="mt-0.5 flex-shrink-0"
                aria-label={task.status === "done" ? "Mark as pending" : "Mark as done"}
              >
                {statusIcon(task.status)}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      task.status === "done"
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </span>
                  {priorityBadge(task.priority)}
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {task.scheduledFor}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    via {task.source}
                  </span>
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {task.status === "failed" && (
                  <button
                    type="button"
                    onClick={() => retryTask(task.id)}
                    className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                    aria-label="Retry task"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary bar */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>{filtered.length} task{filtered.length !== 1 ? "s" : ""} shown</span>
        <span>{counts.done} completed this session</span>
      </div>
    </DashboardShell>
  )
}
