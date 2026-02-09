"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/dashboard-shell"
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Calendar,
  Repeat,
  Zap,
  ArrowRight,
  MoreHorizontal,
  Trash2,
  Copy,
  Edit3,
} from "lucide-react"
import { apiFetch } from "@/lib/api"

interface WorkflowStep {
  label: string
  type: "trigger" | "action" | "condition"
}

interface WorkflowItem {
  id: number
  name: string
  description: string
  schedule: string
  lastRun: string
  nextRun: string
  active: boolean
  totalRuns: number
  successRate: number
  steps: WorkflowStep[]
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([])
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null)

  const toggleActive = async (id: number) => {
    const current = workflows.find((wf) => wf.id === id)
    if (!current) return
    try {
      const data = await apiFetch<{ workflow: WorkflowItem }>(`/api/workflows/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ active: !current.active }),
      })
      setWorkflows((prev) => prev.map((wf) => (wf.id === id ? data.workflow : wf)))
    } catch (err) {
      // ignore
    }
  }

  const deleteWorkflow = async (id: number) => {
    try {
      await apiFetch(`/api/workflows/${id}`, { method: "DELETE" })
      setWorkflows((prev) => prev.filter((wf) => wf.id !== id))
      setMenuOpenId(null)
    } catch (err) {
      // ignore
    }
  }

  const activeCount = workflows.filter((w) => w.active).length
  const totalRuns = workflows.reduce((sum, w) => sum + w.totalRuns, 0)
  const avgSuccess = workflows.length
    ? Math.round(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length)
    : 0

  const stepColor = (type: WorkflowStep["type"]) => {
    switch (type) {
      case "trigger":
        return "border-accent/40 bg-accent/5 text-accent"
      case "condition":
        return "border-yellow-400/40 bg-yellow-400/5 text-yellow-400"
      default:
        return "border-border bg-secondary text-foreground"
    }
  }

  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const data = await apiFetch<{ workflows: WorkflowItem[] }>("/api/workflows")
        setWorkflows(data.workflows)
      } catch (err) {
        // Keep empty state on failure
      }
    }

    loadWorkflows()
  }, [])

  return (
    <DashboardShell activeItem="Workflows" title="Workflows" subtitle="Automations that run while you sleep.">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Active workflows", value: activeCount.toString() },
          { label: "Total executions", value: totalRuns.toString() },
          { label: "Avg. success rate", value: `${avgSuccess}%` },
        ].map((stat, i) => (
          <div key={i} className="p-5 border border-border rounded-xl bg-card">
            <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
            <div className="text-2xl font-display font-black text-foreground">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-foreground">All Workflows</h2>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          New Workflow
        </button>
      </div>

      {/* Workflow cards */}
      <div className="space-y-4">
        {workflows.map((wf) => {
          const isExpanded = expandedId === wf.id
          return (
            <div
              key={wf.id}
              className={`border rounded-xl bg-card overflow-hidden transition-all ${
                wf.active ? "border-border" : "border-border/50 opacity-70"
              }`}
            >
              {/* Header row */}
              <div className="flex items-center gap-4 px-5 py-4">
                <button
                  type="button"
                  onClick={() => toggleActive(wf.id)}
                  className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${
                    wf.active ? "bg-accent" : "bg-muted"
                  }`}
                  aria-label={wf.active ? "Pause workflow" : "Activate workflow"}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${
                      wf.active ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : wf.id)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{wf.name}</span>
                      {wf.active && (
                        <span className="flex items-center gap-1 text-[10px] text-accent font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
                          Live
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Repeat className="w-3 h-3" />
                        {wf.schedule}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {wf.totalRuns} runs
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {wf.successRate}% success
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-muted-foreground transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpenId(menuOpenId === wf.id ? null : wf.id)}
                    className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                    aria-label="Workflow options"
                  >
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {menuOpenId === wf.id && (
                    <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                      <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors">
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </button>
                      <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors">
                        <Copy className="w-3 h-3" />
                        Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteWorkflow(wf.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-4">{wf.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <div className="text-xs text-muted-foreground mb-1">Last run</div>
                      <div className="text-sm text-foreground font-medium">{wf.lastRun}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <div className="text-xs text-muted-foreground mb-1">Next run</div>
                      <div className="text-sm text-foreground font-medium">{wf.nextRun}</div>
                    </div>
                  </div>

                  {/* Steps visualization */}
                  <div className="text-xs font-medium text-muted-foreground mb-3">Steps</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {wf.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className={`px-3 py-1.5 border rounded-lg text-xs font-medium ${stepColor(step.type)}`}
                        >
                          {step.label}
                        </div>
                        {i < wf.steps.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 py-1.5 bg-accent text-accent-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
                    >
                      <Play className="w-3 h-3" />
                      Run Now
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                    >
                      <Clock className="w-3 h-3" />
                      View History
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Hint */}
      <div className="mt-8 p-5 border border-border/50 rounded-xl bg-secondary/30 text-center">
        <p className="text-sm text-muted-foreground">
          You can create workflows by texting ClodsApp:{" "}
          <span className="font-mono text-foreground">{'"every Monday at 9am, send me a summary of my week"'}</span>
        </p>
      </div>
    </DashboardShell>
  )
}
