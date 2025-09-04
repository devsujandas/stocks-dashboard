"use client"

import { useState } from "react"
import SettingsForm from "@/components/settings/settings-form"
import { lsClearAll } from "@/lib/storage"

export default function SettingsPage() {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Settings</h2>
      <SettingsForm />

      {/* Profile / About moved here */}
      <section className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-black">
        <h3 className="text-base font-semibold mb-2">Profile & About</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Accounts are disabled. This app runs without authentication. Your preferences (theme, layout, refresh
          interval, watchlist, and portfolio) are stored locally in your browser.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">Designed &amp; Developed by Sujan Das • Version 1.07</p>
      </section>

      {/* Danger zone */}
      <section className="rounded-lg border border-red-200 dark:border-red-900/50 p-4 bg-red-50 dark:bg-red-950/20">
        <h3 className="text-base font-semibold text-red-700 dark:text-red-300">Danger zone</h3>
        <p className="mt-1 text-sm text-red-700/90 dark:text-red-200">
          Resetting will permanently clear all locally stored data (settings, watchlist, portfolio).
        </p>
        <button
          onClick={() => setConfirmOpen(true)}
          className="mt-3 inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Reset All Data
        </button>

        {confirmOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setConfirmOpen(false)}
          >
            <div
              className="w-full max-w-sm rounded-lg border border-slate-200 dark:border-white/15 bg-white dark:bg-black p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-base font-semibold">Confirm reset</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                This will clear all local data. This action cannot be undone.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="rounded-md border px-3 py-1.5 text-sm border-slate-200 dark:border-white/15 hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    lsClearAll()
                    setConfirmOpen(false)
                  }}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
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
