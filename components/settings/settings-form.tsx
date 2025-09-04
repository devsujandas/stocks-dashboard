"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { lsGet, lsSet } from "@/lib/storage"

type Settings = {
  theme: "light" | "dark" | "system"
  fontSize: "sm" | "md" | "lg"
  density: "compact" | "spacious"
  notifications: boolean
  refreshInterval: number
}

const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  fontSize: "md",
  density: "compact",
  notifications: false,
  refreshInterval: 30000,
}

export default function SettingsForm() {
  const [s, setS] = useState<Settings>(() => lsGet<Settings>("app:settings", DEFAULT_SETTINGS))

  useEffect(() => {
    lsSet("app:settings", s)
  }, [s])

  return (
    <form className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Theme">
          <select
            value={s.theme}
            onChange={(e) => setS({ ...s, theme: e.target.value as Settings["theme"] })}
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </Field>
        <Field label="Font size">
          <select
            value={s.fontSize}
            onChange={(e) => setS({ ...s, fontSize: e.target.value as Settings["fontSize"] })}
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </Field>
        <Field label="Layout density">
          <select
            value={s.density}
            onChange={(e) => setS({ ...s, density: e.target.value as Settings["density"] })}
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
          >
            <option value="compact">Compact</option>
            <option value="spacious">Spacious</option>
          </select>
        </Field>
        <Field label="Data refresh interval">
          <select
            value={String(s.refreshInterval)}
            onChange={(e) => setS({ ...s, refreshInterval: Number(e.target.value) })}
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
          >
            <option value="0">Manual</option>
            <option value="15000">15s</option>
            <option value="30000">30s</option>
            <option value="60000">60s</option>
          </select>
        </Field>
        <Field label="Notifications">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={s.notifications}
              onChange={(e) => setS({ ...s, notifications: e.target.checked })}
            />
            Enable notifications
          </label>
        </Field>
      </div>
      <div className="text-xs text-slate-600 dark:text-slate-400">
        Preferences save automatically and apply across the app.
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{label}</div>
      {children}
    </div>
  )
}
