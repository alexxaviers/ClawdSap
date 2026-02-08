"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, useRef, useCallback } from "react"
import {
  Zap,
  Lock,
  MessageSquare,
  Cpu,
  Calendar,
  Workflow,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"

function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let stars: { x: number; y: number; size: number; speed: number; opacity: number; twinkleSpeed: number; twinkleOffset: number }[] = []
    let shootingStars: { x: number; y: number; length: number; speed: number; angle: number; opacity: number; life: number; maxLife: number }[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = document.documentElement.scrollHeight
      initStars()
    }

    const initStars = () => {
      const count = Math.floor((canvas.width * canvas.height) / 4000)
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.8 + 0.2,
        speed: Math.random() * 0.15 + 0.02,
        opacity: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
      }))
    }

    const spawnShootingStar = () => {
      if (shootingStars.length > 2) return
      shootingStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5,
        length: Math.random() * 80 + 40,
        speed: Math.random() * 6 + 4,
        angle: (Math.random() * 30 + 15) * (Math.PI / 180),
        opacity: 1,
        life: 0,
        maxLife: Math.random() * 60 + 30,
      })
    }

    let frame = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      // Stars
      for (const star of stars) {
        const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinkleOffset)
        const currentOpacity = star.opacity * (0.5 + twinkle * 0.5)
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`
        ctx.fill()

        // Subtle glow on larger stars
        if (star.size > 1.2) {
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(16, 185, 129, ${currentOpacity * 0.08})`
          ctx.fill()
        }

        star.y -= star.speed
        if (star.y < -5) {
          star.y = canvas.height + 5
          star.x = Math.random() * canvas.width
        }
      }

      // Shooting stars
      if (frame % 300 === 0 && Math.random() > 0.4) {
        spawnShootingStar()
      }

      shootingStars = shootingStars.filter((s) => {
        s.life++
        s.x += Math.cos(s.angle) * s.speed
        s.y += Math.sin(s.angle) * s.speed
        s.opacity = 1 - s.life / s.maxLife

        const gradient = ctx.createLinearGradient(
          s.x, s.y,
          s.x - Math.cos(s.angle) * s.length,
          s.y - Math.sin(s.angle) * s.length,
        )
        gradient.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`)
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(
          s.x - Math.cos(s.angle) * s.length,
          s.y - Math.sin(s.angle) * s.length,
        )
        ctx.strokeStyle = gradient
        ctx.lineWidth = 1.5
        ctx.stroke()

        return s.life < s.maxLife
      })

      animationId = requestAnimationFrame(animate)
    }

    resize()
    animate()

    window.addEventListener("resize", resize)
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
    />
  )
}

function NebulaOrb({ className }: { className?: string }) {
  return (
    <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />
  )
}

export default function Home() {
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const observers: Record<string, IntersectionObserver> = {}
    const sectionIds = ["hero", "features", "how", "pricing", "cta"]

    sectionIds.forEach((id) => {
      const element = document.getElementById(id)
      if (!element) return

      observers[id] = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({ ...prev, [id]: true }))
            observers[id].unobserve(element)
          }
        },
        { threshold: 0.15 },
      )

      observers[id].observe(element)
    })

    return () => {
      Object.values(observers).forEach((observer) => observer.disconnect())
    }
  }, [])

  return (
    <div className="min-h-screen bg-background relative">
      {/* Starfield Canvas */}
      <StarfieldCanvas />

      {/* Nebula Ambient Glows */}
      <NebulaOrb className="w-[600px] h-[600px] bg-accent/[0.04] top-[10%] -left-[200px] animate-float" />
      <NebulaOrb className="w-[500px] h-[500px] bg-accent/[0.03] top-[50%] -right-[150px] animate-float [animation-delay:2s]" />
      <NebulaOrb className="w-[400px] h-[400px] bg-accent/[0.02] top-[80%] left-[30%] animate-float [animation-delay:4s]" />

      {/* Header */}
      <header className="fixed top-0 w-full bg-background/60 backdrop-blur-2xl border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Image src="/clodsapp-logo.png" alt="ClodsApp logo" width={32} height={32} className="rounded-lg" />
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              ClodsApp
            </span>
          </div>
          <nav className="hidden md:flex gap-10 text-sm font-medium">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </nav>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-medium border border-border rounded-lg hover:border-accent/40 hover:bg-secondary transition-all text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-semibold bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 pb-24 px-6 min-h-screen flex items-center overflow-hidden">
        {/* Black hole centered background */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
          <div className="relative">
            <img
              src="/images/black-hole-gif.gif"
              alt=""
              className="w-[800px] h-[800px] object-contain opacity-60"
            />
            {/* Radial glow around the black hole */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_50%)]" />
          </div>
        </div>
        {/* Vignette overlay to fade edges */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--background)_75%)]" />

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="max-w-3xl">
            <div
              className={`transition-all duration-1000 ${visibleSections["hero"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
                <span className="text-xs font-medium tracking-wide text-accent">
                  Connected to WhatsApp via OpenClaw
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black leading-[1.05] mb-6 tracking-tighter text-balance">
                <span className="text-foreground">Text it.</span>
                <br />
                <span className="text-foreground">Run it.</span>
                <br />
                <span className="text-accent">Done.</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl">
                ClodsApp turns your WhatsApp messages into executed tasks, running workflows, and handled automations. If you can text it, we can run it.
              </p>
              <div className="flex gap-4 mb-16 flex-col sm:flex-row">
                <Link
                  href="/login"
                  className="group px-7 py-3.5 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all font-semibold text-base flex items-center justify-center gap-2.5"
                >
                  Start for Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </Link>
                <Link
                  href="#how"
                  className="px-7 py-3.5 border border-border rounded-lg hover:border-accent/30 hover:bg-secondary transition-all font-medium text-base text-foreground text-center"
                >
                  See How It Works
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
                <div>
                  <div className="text-2xl font-bold text-foreground mb-1">{'<'}2s</div>
                  <p className="text-sm text-muted-foreground">Avg. execution time</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground mb-1">12K+</div>
                  <p className="text-sm text-muted-foreground">Tasks handled daily</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent mb-1">99.9%</div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-28 px-6 bg-secondary/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${visibleSections["features"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <span className="text-xs font-medium tracking-widest text-accent uppercase">Capabilities</span>
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight mt-3 mb-4 text-foreground text-balance">
              Everything runs from a message
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              No new apps to learn. No dashboards to memorize. Just text what you need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: MessageSquare,
                title: "WhatsApp-Native",
                desc: "Send a message. ClodsApp interprets intent, creates tasks, and executes them.",
              },
              {
                icon: Cpu,
                title: "AI Execution Layer",
                desc: "Powered by OpenClaw. Your private instance understands context and acts on it.",
              },
              {
                icon: Calendar,
                title: "Smart Scheduling",
                desc: "Say 'remind me Thursday at 9am' and it's handled. No forms, no clicks.",
              },
              {
                icon: Lock,
                title: "Private by Default",
                desc: "Your data lives in a secure VPC. Messages are encrypted end-to-end.",
              },
              {
                icon: Workflow,
                title: "Workflow Automation",
                desc: "Chain actions together. 'Every Monday, send me a summary' just works.",
              },
              {
                icon: Zap,
                title: "Instant Execution",
                desc: "Tasks run in under two seconds. No queues. No waiting.",
              },
            ].map((item, i) => {
              const Icon = item.icon
              const isVisible = visibleSections["features"]
              return (
                <div
                  key={i}
                  className={`group p-7 border border-border hover:border-accent/30 rounded-xl bg-card hover:bg-card/80 transition-all duration-500 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2 text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="relative z-10 py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${visibleSections["how"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <span className="text-xs font-medium tracking-widest text-accent uppercase">Process</span>
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight mt-3 text-foreground text-balance">
              From message to execution
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-5">
            {[
              { num: "01", title: "Connect", desc: "Link your WhatsApp in under a minute. Your private OpenClaw instance spins up." },
              { num: "02", title: "Message", desc: "Text what you need done. Natural language. No commands to memorize." },
              { num: "03", title: "Execute", desc: "ClodsApp interprets, plans, and runs the task. You get confirmation." },
              { num: "04", title: "Flow", desc: "Chain tasks into workflows. They run quietly in the background." },
            ].map((step, i) => {
              const isVisible = visibleSections["how"]
              return (
                <div
                  key={i}
                  className={`relative transition-all duration-700 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <div className="group border border-border hover:border-accent/30 rounded-xl p-7 h-full flex flex-col transition-all bg-card">
                    <div className="text-4xl font-display font-black text-accent/40 group-hover:text-accent/70 mb-4 transition-colors">
                      {step.num}
                    </div>
                    <h3 className="font-display font-bold text-lg mb-2 text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                  </div>
                  {i < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-2.5 w-5 h-px bg-border" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 py-28 px-6 bg-secondary/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${visibleSections["pricing"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <span className="text-xs font-medium tracking-widest text-accent uppercase">Pricing</span>
            <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight mt-3 mb-4 text-foreground text-balance">
              Pay for execution, not seats
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Simple, transparent pricing. Start free. Scale as you go.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: "Starter",
                price: "Free",
                subtitle: "For individuals getting started",
                features: ["100 executions / month", "1 WhatsApp connection", "Basic workflows", "Community support"],
                highlight: false,
                cta: "Start Free",
              },
              {
                name: "Pro",
                price: "$29/mo",
                subtitle: "For power users and small teams",
                features: ["Unlimited executions", "Multiple connections", "Advanced workflows", "Priority support"],
                highlight: true,
                cta: "Get Pro",
              },
            ].map((plan, i) => {
              const isVisible = visibleSections["pricing"]
              return (
                <div
                  key={i}
                  className={`group relative transition-all duration-700 ${
                    isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  }`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <div
                    className={`relative p-8 border rounded-xl h-full flex flex-col justify-between transition-all ${
                      plan.highlight
                        ? "border-accent/40 bg-accent/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div>
                      {plan.highlight && (
                        <div className="inline-block px-2.5 py-1 rounded-md bg-accent/10 text-accent text-xs font-medium mb-4">
                          Most popular
                        </div>
                      )}
                      <h3 className="font-display font-bold text-xl mb-1 text-foreground">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{plan.subtitle}</p>
                      <p className="text-3xl font-black text-foreground mb-6">{plan.price}</p>
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((f, j) => (
                          <li key={j} className="flex gap-2.5 text-sm items-center">
                            <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                            <span className="text-foreground/80">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link
                      href="/login"
                      className={`w-full px-6 py-3 rounded-lg font-semibold text-center transition-all block ${
                        plan.highlight
                          ? "bg-accent text-accent-foreground hover:opacity-90"
                          : "border border-border hover:border-accent/30 hover:bg-secondary text-foreground"
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="relative z-10 py-28 px-6">
        <div
          className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${visibleSections["cta"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2 className="text-4xl lg:text-5xl font-display font-black tracking-tight mb-5 text-foreground text-balance">
            Ready to let your messages do the work?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Connect your WhatsApp. Send your first task. Watch it get done.
          </p>
          <Link
            href="/login"
            className="group inline-flex items-center gap-2.5 px-8 py-4 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all font-semibold text-base"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-10 px-6 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Image src="/clodsapp-logo.png" alt="ClodsApp logo" width={20} height={20} className="rounded" />
            <span className="font-medium text-foreground">ClodsApp</span>
          </div>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Docs</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
