"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { lsGet, lsSet } from "@/lib/storage"
import Link from "next/link"
import { SYMBOLS, type SymbolItem } from "@/lib/symbols"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function useSymbolAutocomplete(all: SymbolItem[], q: string) {
  const query = q.trim().toUpperCase()
  return useMemo(() => {
    if (!query) return []
    return all.filter((s) => s.symbol.startsWith(query) || s.name.toUpperCase().includes(query)).slice(0, 8)
  }, [all, query])
}

export default function WatchlistTable() {
  const [symbols, setSymbols] = useState<string[]>(() => lsGet<string[]>("app:watchlist", ["AAPL", "MSFT"]))
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const refreshInterval = lsGet("app:settings", { refreshInterval: 30000 }).refreshInterval

  const suggestions = useSymbolAutocomplete(SYMBOLS, input)

  useEffect(() => {
    lsSet("app:watchlist", symbols)
  }, [symbols])

  function addFromSuggestion(sym: string) {
    const s = sym.trim().toUpperCase()
    if (!s) return
    if (symbols.includes(s)) {
      setError("Already in watchlist")
      return
    }
    setSymbols((prev) => [...prev, s])
    setInput("")
    setError(null)
  }

  function addFirstSuggestion() {
    if (suggestions[0]) addFromSuggestion(suggestions[0].symbol)
    else setError("Invalid Symbol")
  }

  function removeSymbol(s: string) {
    setSymbols((prev) => prev.filter((x) => x !== s))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <div className="relative w-full max-w-sm">
          <input
            placeholder="Search symbol (e.g., TSLA)"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              if (error) setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addFirstSuggestion()
              }
            }}
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
            aria-autocomplete="list"
            aria-expanded={suggestions.length > 0}
            aria-controls="wl-suggestions"
          />
          {suggestions.length > 0 && (
            <ul
              id="wl-suggestions"
              role="listbox"
              className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white text-sm shadow-md dark:border-white/10 dark:bg-black"
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
        <button
          onClick={addFirstSuggestion}
          className="rounded-md bg-sky-600 text-white px-3 py-2 hover:bg-sky-700"
          aria-label="Add selected symbol"
        >
          Add
        </button>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-600 dark:text-slate-400">
              <th className="py-2">Symbol</th>
              <th className="py-2">Price</th>
              <th className="py-2">% Change</th>
              <th className="py-2">Volume</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {symbols.map((s) => (
              <Row key={s} symbol={s} onRemove={() => removeSymbol(s)} refreshInterval={refreshInterval} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Row({ symbol, onRemove, refreshInterval }: { symbol: string; onRemove: () => void; refreshInterval: number }) {
  const { data } = useSWR(`/api/alpha/quote?symbol=${symbol}`, fetcher, { refreshInterval })
  const pct = data?.changePercent || 0
  return (
    <tr className="border-t border-slate-200 dark:border-slate-800">
      <td className="py-2 font-medium">
        <Link href={`/stocks/${encodeURIComponent(symbol)}`} className="text-sky-600 hover:underline">
          {symbol}
        </Link>
      </td>
      <td className="py-2">{(data?.price || 0).toFixed(2)}</td>
      <td className={`py-2 ${pct >= 0 ? "text-emerald-600" : "text-red-600"}`}>{pct.toFixed(2)}%</td>
      <td className="py-2">{(data?.volume || 0).toLocaleString()}</td>
      <td className="py-2 text-right">
        <button onClick={onRemove} className="text-slate-500 hover:text-red-600">
          Remove
        </button>
      </td>
    </tr>
  )
}
