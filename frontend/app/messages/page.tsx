"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import DashboardShell from "@/components/dashboard-shell"
import {
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  ArrowDown,
} from "lucide-react"

interface Message {
  id: number
  text: string
  sender: "user" | "clods"
  timestamp: string
  status?: "executed" | "pending" | "failed" | "info"
  taskCreated?: string
}

const INITIAL_MESSAGES: Message[] = [
  { id: 1, text: "remind me to call Sam at 5pm", sender: "user", timestamp: "2:43 PM" },
  { id: 2, text: "Done. Reminder set for 5:00 PM today: \"Call Sam\". I'll text you 5 minutes before.", sender: "clods", timestamp: "2:43 PM", status: "executed", taskCreated: "Call Sam" },
  { id: 3, text: "what's on my schedule tomorrow", sender: "user", timestamp: "2:28 PM" },
  { id: 4, text: "Tomorrow you have:\n- 9:00 AM: Team standup\n- 11:30 AM: 1:1 with Sarah\n- 2:00 PM: Dentist (rescheduled)\n- 4:00 PM: Open slot\n\nWant me to block time for anything?", sender: "clods", timestamp: "2:28 PM", status: "executed" },
  { id: 5, text: "add groceries to my list", sender: "user", timestamp: "1:15 PM" },
  { id: 6, text: "Added to your shopping list. You now have 7 items. Want me to order them through Instacart when you're ready?", sender: "clods", timestamp: "1:15 PM", status: "executed", taskCreated: "Grocery shopping" },
  { id: 7, text: "every friday at 4pm send me a summary of what I did this week", sender: "user", timestamp: "12:30 PM" },
  { id: 8, text: "Workflow created: \"Weekly summary\"\nSchedule: Every Friday at 4:00 PM\nAction: Compile completed tasks and send via WhatsApp\n\nFirst run: This Friday. You can manage it in Workflows.", sender: "clods", timestamp: "12:30 PM", status: "executed" },
  { id: 9, text: "cancel my gym membership", sender: "user", timestamp: "11:45 AM" },
  { id: 10, text: "I tried to process this but I need more info. Which gym? I found two in your messages: FitLife and Gold's Gym.", sender: "clods", timestamp: "11:45 AM", status: "pending" },
  { id: 11, text: "FitLife", sender: "user", timestamp: "11:46 AM" },
  { id: 12, text: "Got it. I'll draft a cancellation email for FitLife and send it for your review before sending. Check your tasks.", sender: "clods", timestamp: "11:46 AM", status: "executed", taskCreated: "Cancel FitLife membership" },
  { id: 13, text: "how many tasks did I complete this week", sender: "user", timestamp: "Yesterday, 6:00 PM" },
  { id: 14, text: "This week you completed 18 tasks. That's up 29% from last week (14). Your most productive day was Wednesday with 6 completions.", sender: "clods", timestamp: "Yesterday, 6:00 PM", status: "executed" },
  { id: 15, text: "book a table for 2 at that italian place for saturday", sender: "user", timestamp: "Yesterday, 3:22 PM" },
  { id: 16, text: "Looking up Italian restaurants from your history... Found \"Trattoria Roma\" which you visited last month. Checking availability for Saturday evening. I'll confirm once booked.", sender: "clods", timestamp: "Yesterday, 3:22 PM", status: "executed", taskCreated: "Restaurant reservation" },
]

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "executed" | "pending" | "failed">("all")
  const [search, setSearch] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg: Message = {
      id: Date.now(),
      text: input.trim(),
      sender: "user",
      timestamp: "Just now",
    }

    const clodsResponse: Message = {
      id: Date.now() + 1,
      text: `Understood. Processing: "${input.trim()}". I'll handle this and update you when it's done.`,
      sender: "clods",
      timestamp: "Just now",
      status: "pending",
    }

    setMessages((prev) => [...prev, userMsg, clodsResponse])
    setInput("")

    setTimeout(scrollToBottom, 100)
  }

  const filtered = messages.filter((m) => {
    if (search && !m.text.toLowerCase().includes(search.toLowerCase())) return false
    if (filterStatus === "all") return true
    if (m.sender === "user") return true
    return m.status === filterStatus
  })

  const statusBadge = (status?: string) => {
    switch (status) {
      case "executed":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-accent">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Executed
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-yellow-400">
            <Clock className="w-2.5 h-2.5" />
            Pending
          </span>
        )
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-destructive">
            <XCircle className="w-2.5 h-2.5" />
            Failed
          </span>
        )
      default:
        return null
    }
  }

  const executedCount = messages.filter((m) => m.status === "executed").length
  const tasksCreated = messages.filter((m) => m.taskCreated).length

  return (
    <DashboardShell activeItem="Messages" title="Messages" subtitle="Your conversation history with ClodsApp.">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 border border-border rounded-xl bg-card">
          <div className="text-xs text-muted-foreground mb-1">Messages</div>
          <div className="text-xl font-display font-black text-foreground">{messages.length}</div>
        </div>
        <div className="p-4 border border-border rounded-xl bg-card">
          <div className="text-xs text-muted-foreground mb-1">Executed</div>
          <div className="text-xl font-display font-black text-accent">{executedCount}</div>
        </div>
        <div className="p-4 border border-border rounded-xl bg-card">
          <div className="text-xs text-muted-foreground mb-1">Tasks created</div>
          <div className="text-xl font-display font-black text-foreground">{tasksCreated}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/30 focus:ring-2 focus:ring-accent/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
          {(["all", "executed", "pending", "failed"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                filterStatus === f
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Message thread */}
      <div className="border border-border rounded-xl bg-card overflow-hidden flex flex-col" style={{ height: "520px" }}>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.sender === "user"
                    ? "bg-accent text-accent-foreground rounded-br-md"
                    : "bg-secondary text-foreground rounded-bl-md"
                }`}
              >
                <div className="text-sm whitespace-pre-line">{msg.text}</div>
                <div className="flex items-center justify-between gap-3 mt-2">
                  <span
                    className={`text-[10px] ${
                      msg.sender === "user" ? "text-accent-foreground/60" : "text-muted-foreground"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                  {msg.sender === "clods" && statusBadge(msg.status)}
                </div>
                {msg.taskCreated && (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <span className="text-[10px] text-muted-foreground">
                      Task created: <span className="text-foreground font-medium">{msg.taskCreated}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-border p-4">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message to ClodsApp..."
              className="flex-1 px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/30 focus:ring-2 focus:ring-accent/10 transition-all"
            />
            <button
              type="submit"
              className="p-2.5 bg-accent text-accent-foreground rounded-xl hover:opacity-90 transition-all"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Messages here mirror your WhatsApp conversation. You can also type directly.
          </p>
        </div>
      </div>
    </DashboardShell>
  )
}
