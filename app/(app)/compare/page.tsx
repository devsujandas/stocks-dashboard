"use client"

import { useMemo, useState } from "react"
import ComparisonChart from "@/components/compare/comparison-chart"
import { SYMBOLS, type SymbolItem } from "@/lib/symbols"

function useSymbolAutocomplete(all: SymbolItem[], q: string) {
  const query = q.trim().toUpperCase()
  return useMemo(() => {
    if (!query) return []
    return all.filter((s) => s.symbol.startsWith(query) || s.name.toUpperCase().includes(query)).slice(0, 8)
  }, [all, query])
}

export default function ComparePage() {
  const [symbols, setSymbols] = useState<string[]>(["AAPL", "MSFT"])
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const suggestions = useSymbolAutocomplete(SYMBOLS, input)

  function addFromSuggestion(sym: string) {
    const s = sym.trim().toUpperCase()
    if (!s) return
    if (symbols.includes(s)) {
      setError("Already added")
      return
    }
    if (symbols.length >= 3) {
      setError("Limit reached (3)")
      return
    }
    setSymbols((prev) => [...prev, s])
    setInput("")
    setError(null)
  }

  function remove(sym: string) {
    setSymbols((prev) => prev.filter((s) => s !== sym))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Compare Stocks</h2>

      <div className="flex flex-wrap items-start gap-3">
        <div className="relative">
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              if (error) setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && suggestions[0]) {
                e.preventDefault()
                addFromSuggestion(suggestions[0].symbol)
              }
            }}
            placeholder="Search symbol (e.g., NVDA)"
            className="w-64 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
            aria-autocomplete="list"
            aria-expanded={suggestions.length > 0}
            aria-controls="cmp-suggestions"
          />
          {suggestions.length > 0 && (
            <ul
              id="cmp-suggestions"
              role="listbox"
              className="absolute z-20 mt-1 w-64 overflow-hidden rounded-md border border-slate-200 bg-white text-sm shadow-md dark:border-white/10 dark:bg-black"
            >
              {suggestions.map((s) => (
                <li key={s.symbol}>
                  <button
                    type="button"
                    role="option"
                    onClick={() => addFromSuggestion(s.symbol)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-white/10"
                  >
                    <span className="font-medium">{s.symbol}</span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{s.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ul className="flex items-center gap-2">
          {symbols.map((s) => (
            <li key={s}>
              <button
                onClick={() => remove(s)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-white/15 px-2 py-0.5 text-xs"
                aria-label={`Remove ${s}`}
              >
                <span>{s}</span>
                <span className="opacity-60">×</span>
              </button>
            </li>
          ))}
        </ul>

        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>

      <ComparisonChart symbols={symbols} />
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Percentage difference is normalized from the first common data point.
      </div>
    </div>
  )
}
