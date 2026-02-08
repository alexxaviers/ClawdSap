"use client"

import { useState } from "react"
import Link from "next/link"
import DashboardShell from "@/components/dashboard-shell"
import {
  CheckCircle2,
  ArrowRight,
  CreditCard,
  Download,
} from "lucide-react"

const INVOICES = [
  { id: "INV-2026-001", date: "Jan 1, 2026", amount: "$29.00", status: "Paid" },
  { id: "INV-2025-012", date: "Dec 1, 2025", amount: "$29.00", status: "Paid" },
  { id: "INV-2025-011", date: "Nov 1, 2025", amount: "$29.00", status: "Paid" },
  { id: "INV-2025-010", date: "Oct 1, 2025", amount: "$0.00", status: "Free tier" },
]

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro">("pro")

  return (
    <DashboardShell activeItem="Billing" title="Billing" subtitle="Pay for execution, not seats.">
      <div className="space-y-8">
        {/* Current Plan */}
        <section>
          <h2 className="font-display font-bold text-foreground mb-4">Current Plan</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                id: "starter" as const,
                name: "Starter",
                price: "Free",
                desc: "100 executions / month",
                features: ["1 WhatsApp connection", "Basic workflows", "Community support"],
              },
              {
                id: "pro" as const,
                name: "Pro",
                price: "$29/mo",
                desc: "Unlimited executions",
                features: ["Multiple connections", "Advanced workflows", "Priority support"],
              },
            ].map((plan) => {
              const isCurrent = plan.id === selectedPlan
              return (
                <div
                  key={plan.id}
                  className={`p-6 border rounded-xl transition-all ${
                    isCurrent
                      ? "border-accent/40 bg-accent/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-bold text-foreground">{plan.name}</h3>
                    {isCurrent && (
                      <span className="px-2.5 py-1 rounded-md bg-accent/10 text-accent text-xs font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-black text-foreground mb-1">{plan.price}</div>
                  <div className="text-sm text-muted-foreground mb-4">{plan.desc}</div>
                  <ul className="space-y-2 mb-5">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span className="text-foreground/80">{f}</span>
                      </li>
                    ))}
                  </ul>
                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        plan.id === "pro"
                          ? "bg-accent text-accent-foreground hover:opacity-90"
                          : "border border-border text-foreground hover:bg-secondary"
                      }`}
                    >
                      {plan.id === "pro" ? "Upgrade to Pro" : "Downgrade to Starter"}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Usage */}
        <section>
          <h2 className="font-display font-bold text-foreground mb-4">Usage This Month</h2>
          <div className="border border-border rounded-xl bg-card p-6">
            <div className="grid grid-cols-3 gap-6 mb-6">
              {[
                { label: "Executions", used: "247", total: "Unlimited", pct: 100 },
                { label: "Workflows", used: "2", total: "10", pct: 20 },
                { label: "Messages", used: "89", total: "Unlimited", pct: 100 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                  <div className="text-lg font-display font-bold text-foreground">
                    {item.used}
                    <span className="text-sm font-normal text-muted-foreground"> / {item.total}</span>
                  </div>
                  {item.total !== "Unlimited" && (
                    <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Usage resets on the 1st of each month. You only pay for what you use.
            </p>
          </div>
        </section>

        {/* Payment Method */}
        <section>
          <h2 className="font-display font-bold text-foreground mb-4">Payment Method</h2>
          <div className="border border-border rounded-xl bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 rounded-md bg-secondary flex items-center justify-center border border-border">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">Visa ending in 4242</div>
                  <div className="text-xs text-muted-foreground">Expires 12/2027</div>
                </div>
              </div>
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                Update
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Invoices */}
        <section>
          <h2 className="font-display font-bold text-foreground mb-4">Invoices</h2>
          <div className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="grid grid-cols-4 px-5 py-3 border-b border-border text-xs font-medium text-muted-foreground">
              <span>Invoice</span>
              <span>Date</span>
              <span>Amount</span>
              <span className="text-right">Status</span>
            </div>
            {INVOICES.map((inv, i) => (
              <div
                key={inv.id}
                className={`grid grid-cols-4 px-5 py-4 items-center ${
                  i < INVOICES.length - 1 ? "border-b border-border" : ""
                } hover:bg-secondary/30 transition-colors`}
              >
                <span className="text-sm font-mono text-foreground">{inv.id}</span>
                <span className="text-sm text-muted-foreground">{inv.date}</span>
                <span className="text-sm text-foreground">{inv.amount}</span>
                <div className="flex items-center justify-end gap-3">
                  <span className={`text-xs font-medium ${inv.status === "Paid" ? "text-accent" : "text-muted-foreground"}`}>
                    {inv.status}
                  </span>
                  {inv.status === "Paid" && (
                    <button type="button" className="p-1 hover:bg-secondary rounded transition-colors" aria-label="Download invoice">
                      <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Help text */}
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            Questions about billing?{" "}
            <Link href="#" className="text-accent hover:underline">
              Reach out
            </Link>
            . We respond within a few hours.
          </p>
        </div>
      </div>
    </DashboardShell>
  )
}
