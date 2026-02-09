"use client"

import React from "react"
import dynamic from "next/dynamic"

interface AlienProviderProps {
  children: React.ReactNode
}

const ssoBaseUrl = process.env.NEXT_PUBLIC_ALIEN_SSO_URL || "https://sso.alien-api.com"
const providerAddress = process.env.NEXT_PUBLIC_ALIEN_PROVIDER_ADDRESS || ""

const AlienSsoProvider = dynamic(
  () => import("@alien_org/sso-sdk-react").then((mod) => mod.AlienSsoProvider),
  { ssr: false },
)

export default function AlienProvider({ children }: AlienProviderProps) {
  return (
    <AlienSsoProvider
      config={{
        ssoBaseUrl,
        providerAddress,
      }}
    >
      {children}
    </AlienSsoProvider>
  )
}
