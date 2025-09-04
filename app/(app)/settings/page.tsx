"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import SettingsForm from "@/components/settings/settings-form"
import { lsClearAll } from "@/lib/storage"

export default function SettingsPage() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h2>

      {/* Settings Form */}
      <SettingsForm />

      {/* Profile / About */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Profile & About</h3>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Accounts are disabled. This app runs without authentication. Your preferences (theme, layout, refresh
          interval, watchlist, and portfolio) are stored locally in your browser.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Designed &amp; Developed by Sujan Das • Version 1.07
        </p>
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">Danger Zone</h3>
        <p className="mt-2 text-sm text-red-700/90 dark:text-red-200 leading-relaxed">
          Resetting will permanently clear all locally stored data (settings, watchlist, portfolio).
        </p>
        <button
          onClick={() => setConfirmOpen(true)}
          className="mt-4 inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
        >
          Reset All Data
        </button>

        {/* Confirm Reset Modal */}
        {confirmOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmOpen(false)}
          >
            <div
              className="w-full max-w-sm rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-zinc-950 p-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-lg font-semibold">Confirm Reset</h4>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                This will clear all local data. This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium border-slate-200 dark:border-white/15 hover:bg-slate-50 dark:hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    lsClearAll()
                    setConfirmOpen(false)
                    router.push("/") // 🔥 confirm er por home e redirect
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
