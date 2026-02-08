"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Zap,
  CheckCircle2,
  Workflow,
  MessageSquare,
  Settings,
  CreditCard,
  LogOut,
  MoreHorizontal,
} from "lucide-react"

const NAV_ITEMS = [
  { icon: Zap, label: "Command Center", href: "/dashboard" },
  { icon: CheckCircle2, label: "Tasks", href: "/tasks" },
  { icon: Workflow, label: "Workflows", href: "/workflows" },
  { icon: MessageSquare, label: "Messages", href: "/messages" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: CreditCard, label: "Billing", href: "/billing" },
]

interface DashboardShellProps {
  activeItem: string
  title: string
  subtitle: string
  children: React.ReactNode
}

export default function DashboardShell({ activeItem, title, subtitle, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/clodsapp-logo.png" alt="ClodsApp logo" width={28} height={28} className="rounded-lg" />
            <span className="font-display font-bold text-lg tracking-tight text-foreground">
              ClodsApp
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = item.label === activeItem
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            type="button"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-background/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        <header className="border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-secondary"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <MoreHorizontal className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-display font-bold text-foreground">{title}</h1>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
              <span className="text-xs font-medium text-accent">Connected</span>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
