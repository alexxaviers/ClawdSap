import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import AlienProvider from "@/components/alien-provider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ClodsApp — Text it. Run it. Done.",
  description:
    "ClodsApp is an AI-powered execution layer connected to WhatsApp. Manage tasks, workflows, and automations by sending a message.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`font-sans antialiased bg-background`} suppressHydrationWarning>
        <AlienProvider>{children}</AlienProvider>
        <Analytics />
      </body>
    </html>
  )
}
