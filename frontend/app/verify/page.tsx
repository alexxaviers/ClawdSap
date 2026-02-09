"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Zap, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { apiFetch } from "@/lib/api"

const INTENTS = [
  { id: "personal", label: "Running my own life", desc: "Tasks, reminders, personal workflows" },
  { id: "work", label: "Managing work", desc: "Projects, team coordination, scheduling" },
  { id: "both", label: "A bit of everything", desc: "Personal and professional, blended" },
]

const STATEMENTS = [
  "I understand that ClodsApp executes real actions on my behalf.",
  "I know my messages are processed by AI, not a person.",
  "I'm ready to connect my WhatsApp.",
]

export default function VerifyPage() {
  const [step, setStep] = useState(0)
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState<boolean[]>([false, false, false])
  const [verifying, setVerifying] = useState(false)
  const [typewriterText, setTypewriterText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const greetingText = "Before we begin, a quick check."

  useEffect(() => {
    if (step === 0) {
      let i = 0
      const interval = setInterval(() => {
        setTypewriterText(greetingText.slice(0, i + 1))
        i++
        if (i >= greetingText.length) {
          clearInterval(interval)
          setTimeout(() => setStep(1), 600)
        }
      }, 35)
      return () => clearInterval(interval)
    }
  }, [step])

  const allConfirmed = confirmed.every(Boolean)

  const handleContinue = async () => {
    if (step === 1 && selectedIntent) {
      setStep(2)
      return
    }
    if (step === 2 && allConfirmed) {
      setVerifying(true)
      setError(null)
      try {
        await apiFetch("/api/verify", {
          method: "POST",
          body: JSON.stringify({
            intent: selectedIntent,
            statementsConfirmed: STATEMENTS,
          }),
        })
        setTimeout(() => {
          router.push("/onboarding")
        }, 900)
      } catch (err) {
        setVerifying(false)
        setError("Verification failed. Continuing anyway.")
        setTimeout(() => {
          router.push("/onboarding")
        }, 600)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-12 flex justify-center">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/clodsapp-logo.png" alt="ClodsApp logo" width={32} height={32} className="rounded-lg" />
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              ClodsApp
            </span>
          </Link>
        </div>

        {/* Step 0: Typewriter greeting */}
        {step === 0 && (
          <div className="text-center">
            <h1 className="text-2xl font-display font-black tracking-tight text-foreground min-h-[2em]">
              {typewriterText}
              <span className="inline-block w-0.5 h-6 bg-accent ml-1 animate-pulse" />
            </h1>
          </div>
        )}

        {/* Step 1: Intent selection */}
        {step >= 1 && !verifying && (
          <div className={`${step === 1 ? "animate-fade-in-up" : ""}`}>
            {step === 1 && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-display font-black tracking-tight text-foreground mb-2">
                    What brings you here?
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    This helps us set up your experience. No wrong answers.
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {INTENTS.map((intent) => (
                    <button
                      key={intent.id}
                      type="button"
                      onClick={() => setSelectedIntent(intent.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedIntent === intent.id
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/20 bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm text-foreground">{intent.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{intent.desc}</div>
                        </div>
                        {selectedIntent === intent.id && (
                          <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!selectedIntent}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {step === 2 && (
              <div className="animate-fade-in-up">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-display font-black tracking-tight text-foreground mb-2">
                    A few things to know.
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    We respect your time. Just confirm you understand how ClodsApp works.
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {STATEMENTS.map((statement, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const next = [...confirmed]
                        next[i] = !next[i]
                        setConfirmed(next)
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                        confirmed[i]
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/20 bg-card"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 transition-all ${
                          confirmed[i]
                            ? "bg-accent border-accent"
                            : "border-muted"
                        }`}
                      >
                        {confirmed[i] && (
                          <svg className="w-3 h-3 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-foreground/90 leading-relaxed">{statement}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!allConfirmed}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Verify and Continue
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  This is a one-time confirmation. Not a captcha.
                </p>
                {error && (
                  <div className="mt-3 text-xs text-destructive text-center">{error}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Verifying state */}
        {verifying && (
          <div className="text-center animate-fade-in-up">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              Verified. Setting things up.
            </h2>
            <p className="text-sm text-muted-foreground">
              This takes a moment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
