"use client"

import { useEffect } from "react"
import { lsGet } from "@/lib/storage"

type Settings = {
  theme: "light" | "dark" | "system"
  fontSize: "sm" | "md" | "lg"
  density: "compact" | "spacious"
  refreshInterval: number
  notifications: boolean
}

const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  fontSize: "md",
  density: "compact",
  refreshInterval: 30000,
  notifications: false,
}

export default function ClientThemeApplier() {
  useEffect(() => {
    const apply = () => {
      const s = lsGet<Settings>("app:settings", DEFAULT_SETTINGS)
      const root = document.documentElement
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const isDark = s.theme === "dark" || (s.theme === "system" && prefersDark)
      root.classList.toggle("dark", isDark)
      root.classList.remove("text-sm", "text-base", "text-lg")
      root.classList.add(s.fontSize === "sm" ? "text-sm" : s.fontSize === "lg" ? "text-lg" : "text-base")
      root.dataset.density = s.density
    }
    apply()
    const onStorage = (e: StorageEvent) => {
      if (e.key === "app:settings") apply()
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])
  return null
}
