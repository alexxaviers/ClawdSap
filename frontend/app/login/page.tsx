"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Zap, ArrowRight, Mail } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { SignInButton, useAuth } from "@alien_org/sso-sdk-react"

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { auth, logout } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/signup"
      await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })
      router.push("/verify")
    } catch (err) {
      setError("Unable to authenticate. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 border-r border-border">
        <div className="absolute inset-0 bg-accent/[0.02]" />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/clodsapp-logo.png" alt="ClodsApp logo" width={32} height={32} className="rounded-lg" />
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              ClodsApp
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-display font-black tracking-tight text-foreground mb-4 text-balance">
            Your AI operator is one message away.
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Connect your WhatsApp. Send a task. Watch it execute. That's ClodsApp — an execution engine you can text.
          </p>

          <div className="mt-10 space-y-4">
            {[
              "Create tasks with a message",
              "Schedule workflows naturally",
              "Trigger automations instantly",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground">
          Private. Secure. VPC-hosted.
        </div>
      </div>

      {/* Right panel - auth form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/clodsapp-logo.png" alt="ClodsApp logo" width={32} height={32} className="rounded-lg" />
              <span className="font-display font-bold text-xl tracking-tight text-foreground">
                ClodsApp
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-display font-black tracking-tight text-foreground mb-2">
              {mode === "signin" ? "Welcome back." : "Create your account."}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "signin"
                ? "Let's get things done."
                : "Start running tasks from your messages."}
            </p>
          </div>

          {/* Social auth */}
          <div className="space-y-3 mb-6">
            {auth?.isAuthenticated ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-foreground">
                  Alien session detected. You can continue or sign out to re-authenticate.
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/verify")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all font-semibold text-sm"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-lg hover:bg-secondary transition-all text-sm font-medium text-foreground"
                >
                  Sign out of Alien
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-full">
                  <SignInButton />
                </div>
                <div className="w-full">
                  <SignInButton color="dark" />
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Create a strong password" : "Enter your password"}
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all font-semibold text-sm"
            >
              {submitting ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {error && (
            <div className="mt-4 text-xs text-destructive text-center">{error}</div>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === "signin"
                ? "No account yet? Create one"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
