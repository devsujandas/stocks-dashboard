"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function KPI({ title, value, hint, positive }: { title: string; value: string; hint?: string; positive?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-950">
      <div className="text-sm text-slate-600 dark:text-slate-400">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{value}</div>
      {hint && <div className={`mt-1 text-xs ${positive ? "text-emerald-600" : "text-red-600"}`}>{hint}</div>}
    </div>
  )
}

export default function KPICards() {
  const { data: aapl } = useSWR("/api/alpha/quote?symbol=AAPL", fetcher)
  const { data: msft } = useSWR("/api/alpha/quote?symbol=MSFT", fetcher)

  const portfolioValue = (aapl?.price || 0) * 5 + (msft?.price || 0) * 3
  const dailyChange = ((aapl?.changePercent || 0) + (msft?.changePercent || 0)) / 2

  const topGainer = (aapl?.changePercent || 0) > (msft?.changePercent || 0) ? "AAPL" : "MSFT"
  const topLoser = topGainer === "AAPL" ? "MSFT" : "AAPL"

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <KPI
        title="Portfolio Value"
        value={`$${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
      />
      <KPI
        title="Daily % Change"
        value={`${dailyChange.toFixed(2)}%`}
        hint={dailyChange >= 0 ? "Up today" : "Down today"}
        positive={dailyChange >= 0}
      />
      <KPI title="Top Gainer" value={topGainer} hint="Among watchlist" positive />
      <KPI title="Top Loser" value={topLoser} hint="Among watchlist" />
    </div>
  )
}
