"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PriceLineChart } from "@/components/charts/price-line"
import { lsGet } from "@/lib/storage"

type Quote = {
  symbol: string
  price: number
  change?: number
  changePercent?: number
  volume?: number
  open?: number
  high?: number
  low?: number
  previousClose?: number
  time?: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Helper to fetch quotes for multiple symbols with SWR
function useQuotes(symbols: string[]) {
  // Keep order stable in the key to avoid refetch loops
  const stable = symbols.map((s) => s.toUpperCase())
  const key = stable.length ? (["quotes", stable.join(",")] as const) : null

  const { data, error, isLoading } = useSWR<Quote[]>(key, async () => {
    const results = await Promise.all(
      stable.map((s) =>
        fetch(`/api/alpha/quote?symbol=${encodeURIComponent(s)}`).then((r) => r.json() as Promise<Quote>),
      ),
    )
    return results
  })

  return { quotes: data ?? [], error, isLoading }
}

// KPI Card component
function KPICard({ title, value, accent }: { title: string; value: string; accent?: "up" | "down" }) {
  return (
    <div className="rounded-lg border p-4 bg-card text-card-foreground">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p
          className={`text-lg font-semibold ${
            accent === "up" ? "text-green-600" : accent === "down" ? "text-red-600" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  // Selected symbol for the overview chart
  const router = useRouter()
  const [symbol, setSymbol] = useState("AAPL")
  const [focus, setFocus] = useState(false)

  // Portfolio holdings from localStorage: [{ symbol, qty }]
  const holdings = lsGet<{ symbol: string; qty: number }[]>("portfolio:holdings", [
    // default sample when empty
    { symbol: "AAPL", qty: 10 },
    { symbol: "MSFT", qty: 5 },
  ])
  const holdingSymbols = Array.from(new Set(holdings.map((h) => h.symbol)).values())

  // Use aggregated hook instead of calling a hook inside a loop
  const { quotes: holdingQuotes } = useQuotes(holdingSymbols)

  // Compute portfolio value and daily % change (weighted by position value)
  const { portfolioValue, portfolioChangePct } = useMemo(() => {
    if (!holdingQuotes.length) return { portfolioValue: 0, portfolioChangePct: 0 }
    let total = 0
    let deltaPctWeighted = 0
    for (const h of holdings) {
      const q = holdingQuotes.find((qq) => qq.symbol?.toUpperCase() === h.symbol.toUpperCase())
      if (!q || !q.price) continue
      const value = q.price * h.qty
      total += value
      const cp = q.changePercent ?? 0
      deltaPctWeighted += value * cp
    }
    const pct = total > 0 ? deltaPctWeighted / total : 0
    return { portfolioValue: Math.round(total * 100) / 100, portfolioChangePct: Math.round(pct * 100) / 100 }
  }, [holdings, holdingQuotes])

  // Top gainer/loser from a small universe
  const universe = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"]
  // Aggregate universe quotes via single hook call
  const { quotes: uniQuotes, isLoading: uniLoading } = useQuotes(universe)
  const { topGainer, topLoser } = useMemo(() => {
    if (!uniQuotes.length) return { topGainer: null as Quote | null, topLoser: null as Quote | null }
    const sorted = [...uniQuotes].sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0))
    return { topGainer: sorted[0] ?? null, topLoser: sorted[sorted.length - 1] ?? null }
  }, [uniQuotes])

  // Global Index Snapshot (fallback to mocks via our API if env not set)
  const indexes = [
    { name: "Sensex", symbol: "SENSEX" },
    { name: "Nifty 50", symbol: "NIFTY" },
    { name: "NASDAQ", symbol: "IXIC" },
    { name: "S&P 500", symbol: "GSPC" },
  ]
  // Aggregate index quotes via single hook call
  const { quotes: indexQuoteList, isLoading: indexLoading } = useQuotes(indexes.map((i) => i.symbol))

  // Overview time series (1M) for the selected symbol
  const { data: series } = useSWR<{ points: { t: string; c: number }[] }>(
    `/api/alpha/timeseries?symbol=${encodeURIComponent(symbol)}&range=1M`,
    fetcher,
  )
  const chartData = (series?.points || []).map((p) => ({ date: p.t, close: p.c }))

  const suggestions = useMemo(() => {
    const pool = Array.from(new Set([...holdingSymbols, ...universe])).map((s) => s.toUpperCase())
    const q = symbol.trim().toUpperCase()
    if (!q) return pool.slice(0, 6)
    return pool.filter((s) => s.includes(q)).slice(0, 6)
  }, [symbol, holdingSymbols])

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-balance">Dashboard</h2>
        <div className="relative flex items-center gap-2">
          <input
            aria-label="Ticker symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onFocus={() => setFocus(true)}
            onBlur={() => setTimeout(() => setFocus(false), 120)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                if (symbol.trim()) router.push(`/stocks/${encodeURIComponent(symbol.trim().toUpperCase())}`)
              }
            }}
            placeholder="e.g., AAPL"
            className="w-full sm:w-56 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
          />
          <Link
            href={`/stocks/${encodeURIComponent(symbol)}`}
            className="inline-flex items-center justify-center rounded-md bg-sky-600 px-3 py-2 text-white text-sm font-medium hover:bg-sky-700"
          >
            Open
          </Link>

          {/* Suggestions dropdown */}
          {focus && suggestions.length > 0 && (
            <div className="absolute left-0 top-full mt-1 w-[14rem] rounded-md border bg-popover text-popover-foreground shadow-sm z-10">
              <ul className="max-h-60 overflow-auto py-1">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSymbol(s)
                        router.push(`/stocks/${encodeURIComponent(s)}`)
                      }}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Portfolio Value" value={portfolioValue > 0 ? `$${portfolioValue.toLocaleString()}` : "—"} />
        <KPICard
          title="Daily % Change"
          value={`${portfolioChangePct >= 0 ? "+" : ""}${portfolioChangePct.toFixed(2)}%`}
          accent={portfolioChangePct >= 0 ? "up" : "down"}
        />
        <KPICard
          title="Top Gainer"
          value={
            uniLoading || !topGainer
              ? "—"
              : `${topGainer.symbol} ${topGainer.changePercent ? topGainer.changePercent.toFixed(2) : "0.00"}%`
          }
          accent="up"
        />
        <KPICard
          title="Top Loser"
          value={
            uniLoading || !topLoser
              ? "—"
              : `${topLoser.symbol} ${topLoser.changePercent ? topLoser.changePercent.toFixed(2) : "0.00"}%`
          }
          accent="down"
        />
      </section>

      {/* Index snapshot */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Global Index Snapshot</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {indexes.map((idx, i) => {
            // Pull per-card quote from aggregated list
            const quote = indexQuoteList[i]
            return (
              <div
                key={idx.symbol}
                className="rounded-lg border p-4 bg-card text-card-foreground border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{idx.name}</p>
                    <p className="text-base font-medium">{idx.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-base font-semibold">
                      {indexLoading ? "…" : quote?.price ? `$${quote.price.toLocaleString()}` : "—"}
                    </p>
                    {quote?.changePercent != null && (
                      <p className={`text-xs ${quote.changePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {quote.changePercent >= 0 ? "+" : ""}
                        {quote.changePercent.toFixed(2)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Overview chart */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Market Overview</h3>
        <div className="rounded-lg border p-4">
          {chartData.length > 0 ? (
            <PriceLineChart data={chartData} xKey="date" yKey="close" color="#0284c7" height={260} />
          ) : (
            <p className="text-sm text-muted-foreground">No data available.</p>
          )}
        </div>
      </section>

      {/* Recent activity and highlights */}
      <section className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h4 className="text-base font-semibold mb-2">Recent Activity</h4>
          <ul className="space-y-2 text-sm">
            {lsGet<{ at: string; text: string }[]>("watchlist:events", [])
              .slice(-5)
              .reverse()
              .map((e, i) => (
                <li key={i} className="text-muted-foreground">
                  <span className="text-xs">{new Date(e.at).toLocaleString()}</span> – {e.text}
                </li>
              ))}
            {lsGet<{ at: string; text: string }[]>("watchlist:events", []).length === 0 && (
              <li className="text-muted-foreground">No recent activity.</li>
            )}
          </ul>
        </div>
        <div className="rounded-lg border p-4">
          <h4 className="text-base font-semibold mb-2">Highlights</h4>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
            <li>Tap a KPI to drill into details (Portfolio and Compare).</li>
            <li>Use Settings to adjust theme, density, and refresh interval.</li>
            <li>Navigate with the bottom bar on mobile for a native app feel.</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
