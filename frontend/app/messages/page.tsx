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
import { apiFetch } from "@/lib/api"

interface Message {
  id: number
  text: string
  sender: "user" | "clods"
  timestamp: string
  status?: "executed" | "pending" | "failed" | "info"
  taskCreated?: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "executed" | "pending" | "failed">("all")
  const [search, setSearch] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    try {
      const data = await apiFetch<{ userMessage: Message; botMessage: Message }>("/api/messages", {
        method: "POST",
        body: JSON.stringify({ text: input.trim() }),
      })
      await apiFetch("/api/whatsapp/send", {
        method: "POST",
        body: JSON.stringify({ body: input.trim() }),
      })
      setMessages((prev) => [...prev, data.userMessage, data.botMessage])
      setInput("")
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      // keep input for retry
    }
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

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await apiFetch<{ messages: Message[] }>("/api/messages")
        setMessages(data.messages)
        setTimeout(scrollToBottom, 100)
      } catch (err) {
        // Keep empty state on failure
      }
    }

    loadMessages()
  }, [])

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
