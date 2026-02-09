"use client"

import React from "react"
import { useEffect, useState } from "react"
import DashboardShell from "@/components/dashboard-shell"
import {
  CheckCircle2,
  Clock,
  Circle,
  Play,
  Send,
  MoreHorizontal,
} from "lucide-react"
import { apiFetch } from "@/lib/api"

interface DashboardTask {
  id: number
  title: string
  status: string
  scheduledFor: string
  source: string
}

interface DashboardWorkflow {
  id: number
  name: string
  schedule: string
  lastRun: string | null
  active: boolean
}

interface DashboardMessage {
  id: number
  text: string
  timestamp: string
  status?: string
}

export default function DashboardPage() {
  const [command, setCommand] = useState("")
  const [stats, setStats] = useState({
    tasksToday: 0,
    executionsThisWeek: 0,
    activeWorkflows: 0,
    messagesProcessed: 0,
  })
  const [tasks, setTasks] = useState<DashboardTask[]>([])
  const [workflows, setWorkflows] = useState<DashboardWorkflow[]>([])
  const [messages, setMessages] = useState<DashboardMessage[]>([])

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim()) return
    const text = command.trim()
    setCommand("")
    try {
      await apiFetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({ text }),
      })
    } catch (err) {
      // ignore
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="w-4 h-4 text-accent" />
      case "running":
        return <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      case "pending":
        return <Clock className="w-4 h-4 text-muted-foreground" />
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />
    }
  }

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await apiFetch<{
          stats: typeof stats
          tasks: DashboardTask[]
          workflows: DashboardWorkflow[]
          messages: DashboardMessage[]
        }>("/api/dashboard")
        setStats(data.stats)
        setTasks(data.tasks)
        setWorkflows(data.workflows)
        setMessages(data.messages)
      } catch (err) {
        // Keep empty state on failure
      }
    }

    loadDashboard()
  }, [])

  return (
    <DashboardShell activeItem="Command Center" title="Command Center" subtitle="Your life, running quietly in the background.">
      {/* Quick command */}
      <div className="mb-8">
        <form onSubmit={handleCommand} className="relative">
          <div className="flex items-center border border-border rounded-xl bg-card overflow-hidden focus-within:border-accent/30 focus-within:ring-2 focus-within:ring-accent/10 transition-all">
            <div className="pl-4">
              <Send className="w-4 h-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Type a task, question, or command..."
              className="flex-1 px-3 py-4 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2 m-2 bg-accent text-accent-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
            >
              Run
            </button>
          </div>
        </form>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Tasks today", value: stats.tasksToday.toString(), sub: "Pending from messages" },
          { label: "Executions this week", value: stats.executionsThisWeek.toString(), sub: "Mocked for now" },
          { label: "Active workflows", value: stats.activeWorkflows.toString(), sub: "Running on schedule" },
          { label: "Messages processed", value: stats.messagesProcessed.toString(), sub: "This month" },
        ].map((stat, i) => (
          <div key={i} className="p-5 border border-border rounded-xl bg-card">
            <div className="text-xs text-muted-foreground mb-2">{stat.label}</div>
            <div className="text-2xl font-display font-black text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-foreground">Upcoming Tasks</h2>
            <a href="/tasks" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all
            </a>
          </div>
          <div className="border border-border rounded-xl bg-card overflow-hidden">
            {tasks.map((task, i) => (
              <div
                key={task.id}
                className={`flex items-center gap-4 px-5 py-4 ${
                  i < tasks.length - 1 ? "border-b border-border" : ""
                } hover:bg-secondary/30 transition-colors`}
              >
                {statusIcon(task.status)}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${task.status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {task.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {task.scheduledFor}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-md bg-secondary">
                    {task.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Workflows */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-foreground">Workflows</h2>
              <a href="/workflows" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                View all
              </a>
            </div>
            <div className="space-y-3">
              {workflows.map((wf) => (
                <div key={wf.id} className="p-4 border border-border rounded-xl bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-foreground">{wf.name}</div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        wf.active ? "bg-accent" : "bg-muted"
                      }`}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">{wf.schedule}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Last run: {wf.lastRun || "N/A"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent WhatsApp */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-foreground">Recent Messages</h2>
              <a href="/messages" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                View all
              </a>
            </div>
            <div className="space-y-2">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card">
                  <Play className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground font-mono truncate">
                      {msg.text}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                      {msg.timestamp}
                      {msg.status === "executed" && (
                        <span className="text-accent">Executed</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
