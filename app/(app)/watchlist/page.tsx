"use client"

import WatchlistTable from "@/components/watchlist/watchlist-table"
import { SymbolAutocomplete } from "@/components/watchlist/symbol-autocomplete"
import { useState } from "react"
import { SYMBOLS } from "@/lib/symbols"

export default function WatchlistPage() {
  const [lastError, setLastError] = useState<string | null>(null)
  const validSet = new Set(SYMBOLS.map((s) => s.symbol))

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Watchlist</h2>

      <div className="flex items-center gap-3">
        <SymbolAutocomplete
          onSelect={(item) => {
            setLastError(null)
            // dispatch a custom event so the table can handle add consistently
            window.dispatchEvent(new CustomEvent("watchlist:add", { detail: item.symbol }))
          }}
          className="max-w-md"
        />
        {lastError && <p className="text-xs text-destructive">{lastError}</p>}
      </div>

      <WatchlistTable
        onAdd={(symbol) => {
          if (!validSet.has(symbol)) {
            setLastError("Invalid Symbol")
            return false
          }
          setLastError(null)
          return true
        }}
      />
    </div>
  )
}
