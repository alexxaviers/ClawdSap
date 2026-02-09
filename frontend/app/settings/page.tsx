"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/dashboard-shell"
import {
  User,
  MessageSquare,
  Bell,
  Shield,
  Globe,
  Smartphone,
  Key,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Clock,
} from "lucide-react"
import { apiFetch } from "@/lib/api"

interface ToggleSetting {
  id: string
  label: string
  description: string
  enabled: boolean
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "whatsapp" | "notifications" | "security">("profile")

  // Profile
  const [displayName, setDisplayName] = useState("Alex Morgan")
  const [email, setEmail] = useState("alex@example.com")
  const [timezone, setTimezone] = useState("America/New_York")
  const [saved, setSaved] = useState(false)

  // WhatsApp
  const [whatsappConnected, setWhatsappConnected] = useState(true)
  const [phoneNumber, setPhoneNumber] = useState("+1 (555) 123-4567")
  const [autoExecute, setAutoExecute] = useState(true)
  const [confirmBefore, setConfirmBefore] = useState(false)
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true)
  const [quietStart, setQuietStart] = useState("22:00")
  const [quietEnd, setQuietEnd] = useState("07:00")

  // Notifications
  const [notifications, setNotifications] = useState<ToggleSetting[]>([])

  // Security
  const [sessions, setSessions] = useState<Array<{ device: string; location: string; lastActive: string; current: boolean }>>([])
  const [apiKey, setApiKey] = useState("clods_sk_demo_xxxxxxxxxxxxxxxxx")

  const handleSave = async () => {
    const payload = { displayName, email, timezone }
    try {
      await syncSettings(payload)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setSaved(false)
    }
  }

  const toggleNotification = async (id: string) => {
    const next = notifications.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    setNotifications(next)
    await syncSettings({ notifications: next })
  }

  const syncSettings = async (payload: Record<string, unknown>) => {
    const data = await apiFetch<{
      profile: { displayName: string; email: string; timezone: string }
      whatsapp: {
        connected: boolean
        phoneNumber: string
        autoExecute: boolean
        confirmBefore: boolean
        quietHoursEnabled: boolean
        quietStart: string
        quietEnd: string
      }
      notifications: ToggleSetting[]
      security: { apiKey: string; sessions: Array<{ device: string; location: string; lastActive: string; current: boolean }> }
    }>("/api/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    })

    setDisplayName(data.profile.displayName)
    setEmail(data.profile.email)
    setTimezone(data.profile.timezone)
    setWhatsappConnected(data.whatsapp.connected)
    setPhoneNumber(data.whatsapp.phoneNumber)
    setAutoExecute(data.whatsapp.autoExecute)
    setConfirmBefore(data.whatsapp.confirmBefore)
    setQuietHoursEnabled(data.whatsapp.quietHoursEnabled)
    setQuietStart(data.whatsapp.quietStart)
    setQuietEnd(data.whatsapp.quietEnd)
    setNotifications(data.notifications)
    setApiKey(data.security.apiKey)
    setSessions(data.security.sessions)
  }

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await apiFetch<{
          profile: { displayName: string; email: string; timezone: string }
          whatsapp: {
            connected: boolean
            phoneNumber: string
            autoExecute: boolean
            confirmBefore: boolean
            quietHoursEnabled: boolean
            quietStart: string
            quietEnd: string
          }
          notifications: ToggleSetting[]
          security: { apiKey: string; sessions: Array<{ device: string; location: string; lastActive: string; current: boolean }> }
        }>("/api/settings")
        setDisplayName(data.profile.displayName)
        setEmail(data.profile.email)
        setTimezone(data.profile.timezone)
        setWhatsappConnected(data.whatsapp.connected)
        setPhoneNumber(data.whatsapp.phoneNumber)
        setAutoExecute(data.whatsapp.autoExecute)
        setConfirmBefore(data.whatsapp.confirmBefore)
        setQuietHoursEnabled(data.whatsapp.quietHoursEnabled)
        setQuietStart(data.whatsapp.quietStart)
        setQuietEnd(data.whatsapp.quietEnd)
        setNotifications(data.notifications)
        setApiKey(data.security.apiKey)
        setSessions(data.security.sessions)
      } catch (err) {
        // Keep defaults on failure
      }
    }

    loadSettings()
  }, [])

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "whatsapp" as const, label: "WhatsApp", icon: MessageSquare },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "security" as const, label: "Security", icon: Shield },
  ]

  return (
    <DashboardShell activeItem="Settings" title="Settings" subtitle="Your account, connections, and preferences.">
      {/* Tab navigation */}
      <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg w-fit mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Profile tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <section className="border border-border rounded-xl bg-card p-6">
            <h3 className="font-display font-bold text-foreground mb-1">Profile Information</h3>
            <p className="text-xs text-muted-foreground mb-6">How ClodsApp knows and addresses you.</p>

            <div className="space-y-5 max-w-md">
              <div>
                <label htmlFor="displayName" className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Display name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/30 focus:ring-2 focus:ring-accent/10 transition-all"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/30 focus:ring-2 focus:ring-accent/10 transition-all"
                />
              </div>
              <div>
                <label htmlFor="timezone" className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Timezone
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/30 appearance-none transition-all"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">GMT (London)</option>
                    <option value="Europe/Paris">CET (Paris)</option>
                    <option value="Asia/Tokyo">JST (Tokyo)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2.5 bg-accent text-accent-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
              >
                Save Changes
              </button>
              {saved && (
                <span className="flex items-center gap-1 text-xs text-accent animate-fade-in-up">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved
                </span>
              )}
            </div>
          </section>

          {/* Danger zone */}
          <section className="border border-destructive/20 rounded-xl bg-card p-6">
            <h3 className="font-display font-bold text-destructive mb-1">Danger Zone</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 border border-destructive/30 text-destructive rounded-lg text-xs font-semibold hover:bg-destructive/10 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Account
            </button>
          </section>
        </div>
      )}

      {/* WhatsApp tab */}
      {activeTab === "whatsapp" && (
        <div className="space-y-6">
          {/* Connection status */}
          <section className="border border-border rounded-xl bg-card p-6">
            <h3 className="font-display font-bold text-foreground mb-1">WhatsApp Connection</h3>
            <p className="text-xs text-muted-foreground mb-5">Manage your WhatsApp integration via OpenClaw.</p>

            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 mb-5">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${whatsappConnected ? "bg-accent/10" : "bg-destructive/10"}`}>
                  <Smartphone className={`w-5 h-5 ${whatsappConnected ? "text-accent" : "text-destructive"}`} />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{phoneNumber}</div>
                  <div className={`text-xs font-medium ${whatsappConnected ? "text-accent" : "text-destructive"}`}>
                    {whatsappConnected ? "Connected and active" : "Disconnected"}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !whatsappConnected
                  setWhatsappConnected(next)
                  syncSettings({ whatsapp: { connected: next } })
                }}
                className="px-3 py-1.5 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                {whatsappConnected ? "Disconnect" : "Connect"}
              </button>
            </div>

            {/* Execution settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">Auto-execute tasks</div>
                  <div className="text-xs text-muted-foreground">ClodsApp runs tasks immediately without asking.</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !autoExecute
                    setAutoExecute(next)
                    syncSettings({ whatsapp: { autoExecute: next } })
                  }}
                  className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${
                    autoExecute ? "bg-accent" : "bg-muted"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${
                      autoExecute ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">Confirm before sensitive actions</div>
                  <div className="text-xs text-muted-foreground">Ask for confirmation before sending emails, making payments, etc.</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !confirmBefore
                    setConfirmBefore(next)
                    syncSettings({ whatsapp: { confirmBefore: next } })
                  }}
                  className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${
                    confirmBefore ? "bg-accent" : "bg-muted"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${
                      confirmBefore ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Quiet hours */}
          <section className="border border-border rounded-xl bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-foreground">Quiet Hours</h3>
                <p className="text-xs text-muted-foreground">ClodsApp won't send non-urgent messages during these hours.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !quietHoursEnabled
                  setQuietHoursEnabled(next)
                  syncSettings({ whatsapp: { quietHoursEnabled: next } })
                }}
                className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${
                  quietHoursEnabled ? "bg-accent" : "bg-muted"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${
                    quietHoursEnabled ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {quietHoursEnabled && (
              <div className="flex items-center gap-4">
                <div>
                  <label htmlFor="quietStart" className="block text-xs text-muted-foreground mb-1">
                    From
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      id="quietStart"
                      type="time"
                      value={quietStart}
                      onChange={(e) => {
                        const value = e.target.value
                        setQuietStart(value)
                        syncSettings({ whatsapp: { quietStart: value } })
                      }}
                      className="pl-9 pr-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/30 transition-all"
                    />
                  </div>
                </div>
                <span className="text-muted-foreground mt-5">to</span>
                <div>
                  <label htmlFor="quietEnd" className="block text-xs text-muted-foreground mb-1">
                    Until
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      id="quietEnd"
                      type="time"
                      value={quietEnd}
                      onChange={(e) => {
                        const value = e.target.value
                        setQuietEnd(value)
                        syncSettings({ whatsapp: { quietEnd: value } })
                      }}
                      className="pl-9 pr-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/30 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Notifications tab */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <section className="border border-border rounded-xl bg-card p-6">
            <h3 className="font-display font-bold text-foreground mb-1">Notification Preferences</h3>
            <p className="text-xs text-muted-foreground mb-6">Choose what ClodsApp tells you about.</p>

            <div className="space-y-5">
              {notifications.map((n) => (
                <div key={n.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">{n.label}</div>
                    <div className="text-xs text-muted-foreground">{n.description}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNotification(n.id)}
                    className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${
                      n.enabled ? "bg-accent" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${
                        n.enabled ? "left-[18px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Security tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* API key */}
          <section className="border border-border rounded-xl bg-card p-6">
            <h3 className="font-display font-bold text-foreground mb-1">API Key</h3>
            <p className="text-xs text-muted-foreground mb-4">Use this to integrate ClodsApp with other tools.</p>

            <div className="flex items-center gap-3">
              <div className="flex-1 px-3 py-2.5 bg-secondary border border-border rounded-lg">
                <code className="text-sm font-mono text-muted-foreground">{apiKey}</code>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2.5 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                <Key className="w-3.5 h-3.5" />
                Regenerate
              </button>
            </div>
          </section>

          {/* Active sessions */}
          <section className="border border-border rounded-xl bg-card p-6">
            <h3 className="font-display font-bold text-foreground mb-1">Active Sessions</h3>
            <p className="text-xs text-muted-foreground mb-4">Devices and services currently signed in.</p>

            <div className="space-y-3">
              {sessions.map((session, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${session.lastActive === "Active now" ? "bg-accent" : "bg-muted"}`} />
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {session.device}
                        {session.current && (
                          <span className="ml-2 text-[10px] text-accent font-medium">This device</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {session.location} &middot; {session.lastActive}
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Data export */}
          <section className="border border-border rounded-xl bg-card p-6">
            <h3 className="font-display font-bold text-foreground mb-1">Data Export</h3>
            <p className="text-xs text-muted-foreground mb-4">Download a copy of all your data including tasks, workflows, and messages.</p>

            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-secondary transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Request Data Export
            </button>
          </section>
        </div>
      )}
    </DashboardShell>
  )
}
