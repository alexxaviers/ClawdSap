"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Zap,
  ArrowRight,
  MessageSquare,
  Lock,
  CheckCircle2,
  Calendar,
  Workflow,
  Bell,
  Play,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"

const CAPABILITIES = [
  { icon: CheckCircle2, label: "Create tasks", desc: "\"Add groceries to my list\"" },
  { icon: Calendar, label: "Schedule events", desc: "\"Meeting with Sam Thursday 3pm\"" },
  { icon: Workflow, label: "Run workflows", desc: "\"Every Monday, send me a summary\"" },
  { icon: Bell, label: "Set reminders", desc: "\"Remind me to call the bank at 5\"" },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [enabledCapabilities, setEnabledCapabilities] = useState<Set<number>>(new Set([0, 1, 2, 3]))
  const [firstMessage, setFirstMessage] = useState("")
  const [messageSent, setMessageSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const totalSteps = 4

  const handleConnect = async () => {
    setConnecting(true)
    setError(null)
    try {
      await apiFetch("/api/onboarding/connect-whatsapp", { method: "POST" })
      setConnected(true)
    } catch (err) {
      setError("Unable to connect WhatsApp right now.")
    } finally {
      setConnecting(false)
    }
  }

  const handleSendMessage = async () => {
    if (!firstMessage.trim()) return
    setMessageSent(true)
    setError(null)
    try {
      await apiFetch("/api/onboarding/first-message", {
        method: "POST",
        body: JSON.stringify({ text: firstMessage.trim() }),
      })
      setTimeout(() => {
        router.push("/dashboard")
      }, 1200)
    } catch (err) {
      setMessageSent(false)
      setError("Unable to send your first message.")
    }
  }

  const persistCapabilities = async (next: Set<number>) => {
    const capabilities = Array.from(next).map((index) => CAPABILITIES[index]?.label)
    try {
      await apiFetch("/api/onboarding/capabilities", {
        method: "PUT",
        body: JSON.stringify({ capabilities }),
      })
    } catch (err) {
      setError("Unable to update capabilities.")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/clodsapp-logo.png" alt="ClodsApp logo" width={28} height={28} className="rounded-lg" />
            <span className="font-display font-bold text-lg tracking-tight text-foreground">
              ClodsApp
            </span>
          </Link>
          {/* Progress */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i <= step ? "w-8 bg-accent" : "w-4 bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="animate-fade-in-up">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-accent" />
              </div>
              <h1 className="text-3xl font-display font-black tracking-tight text-foreground mb-3">
                Your AI operator is almost ready.
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-3 max-w-md">
                In the next few steps, you'll connect your WhatsApp and send your first task. It takes about a minute.
              </p>
              <p className="text-sm text-muted-foreground mb-10">
                After this, everything runs from your messages.
              </p>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all font-semibold text-sm"
              >
                Let's go
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 1: Connect WhatsApp */}
          {step === 1 && (
            <div className="animate-fade-in-up">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                <MessageSquare className="w-7 h-7 text-accent" />
              </div>
              <h1 className="text-3xl font-display font-black tracking-tight text-foreground mb-3">
                Connect your WhatsApp.
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
                Your messages become actions. We spin up a private OpenClaw instance just for you — encrypted, isolated, and secure.
              </p>

              {/* Security badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  { icon: Lock, label: "End-to-end encrypted" },
                  { icon: Shield, label: "Private VPC" },
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card">
                    <badge.icon className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-medium text-muted-foreground">{badge.label}</span>
                  </div>
                ))}
              </div>

              {!connected ? (
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={connecting}
                  className="flex items-center gap-3 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all font-semibold text-sm disabled:opacity-60"
                >
                  {connecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Connect WhatsApp
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-accent/30 bg-accent/5">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-foreground">WhatsApp connected</div>
                      <div className="text-xs text-muted-foreground">Your OpenClaw instance is live.</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all font-semibold text-sm"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Capabilities */}
          {step === 2 && (
            <div className="animate-fade-in-up">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                <Play className="w-7 h-7 text-accent" />
              </div>
              <h1 className="text-3xl font-display font-black tracking-tight text-foreground mb-3">
                What ClodsApp can do.
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
                Everything is enabled by default. You can adjust these anytime from your dashboard.
              </p>

              <div className="space-y-3 mb-8">
                {CAPABILITIES.map((cap, i) => {
                  const Icon = cap.icon
                  const enabled = enabledCapabilities.has(i)
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const next = new Set(enabledCapabilities)
                        if (next.has(i)) {
                          next.delete(i)
                        } else {
                          next.add(i)
                        }
                        setEnabledCapabilities(next)
                        persistCapabilities(next)
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                        enabled
                          ? "border-accent/30 bg-accent/5"
                          : "border-border bg-card opacity-50"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">{cap.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 font-mono">{cap.desc}</div>
                      </div>
                      <div
                        className={`w-10 h-6 rounded-full flex items-center p-0.5 transition-all flex-shrink-0 ${
                          enabled ? "bg-accent justify-end" : "bg-muted justify-start"
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full bg-foreground shadow-sm" />
                      </div>
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all font-semibold text-sm"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
              {error && (
                <div className="mt-3 text-xs text-destructive">{error}</div>
              )}
            </div>
          )}

          {/* Step 3: First Action */}
          {step === 3 && (
            <div className="animate-fade-in-up">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                <MessageSquare className="w-7 h-7 text-accent" />
              </div>
              <h1 className="text-3xl font-display font-black tracking-tight text-foreground mb-3">
                Send your first task.
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
                Type anything you'd send via WhatsApp. ClodsApp will handle the rest.
              </p>

              {!messageSent ? (
                <>
                  {/* Message composer */}
                  <div className="border border-border rounded-xl bg-card overflow-hidden mb-4">
                    <div className="p-4">
                      <input
                        type="text"
                        value={firstMessage}
                        onChange={(e) => setFirstMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="plan my week"
                        className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none"
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/30">
                      <div className="text-xs text-muted-foreground">
                        Try: "plan my week" or "remind me to call Sam at 5pm"
                      </div>
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        disabled={!firstMessage.trim()}
                        className="px-4 py-1.5 bg-accent text-accent-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-30"
                      >
                        Send
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFirstMessage("plan my week")
                      setTimeout(handleSendMessage, 300)
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip for now
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  {/* Sent message */}
                  <div className="flex justify-end">
                    <div className="px-4 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm max-w-xs">
                      {firstMessage}
                    </div>
                  </div>
                  {/* Response */}
                  <div className="flex justify-start">
                    <div className="px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground max-w-xs">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-4 h-4 rounded bg-accent/20 flex items-center justify-center">
                          <Zap className="w-2.5 h-2.5 text-accent" />
                        </div>
                        <span className="text-xs font-medium text-accent">ClodsApp</span>
                      </div>
                      Done. Your task is running. Heading to your dashboard now.
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="mt-3 text-xs text-destructive">{error}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
