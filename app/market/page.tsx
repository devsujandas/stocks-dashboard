"use client"

import { useState } from "react"
import useSWR from "swr"
import { PriceLineChart } from "@/components/charts/price-line"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function MarketPage() {
  const [symbol, setSymbol] = useState("AAPL")
  const { data, isLoading, error, mutate } = useSWR(
    symbol ? `/api/alpha/quote?symbol=${encodeURIComponent(symbol)}` : null,
    fetcher,
  )

  // Small demo series to render the chart before hooking up historical APIs
  const demoSeries = [
    { date: "2025-08-25", close: 226.1 },
    { date: "2025-08-26", close: 227.4 },
    { date: "2025-08-27", close: 224.9 },
    { date: "2025-08-28", close: 229.3 },
    { date: "2025-08-29", close: 231.7 },
  ]

  const price = data?.price as number | null
  const change = data?.change as number | null
  const changePct = data?.changePercent as number | null

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-balance">Market Overview</h1>
          <p className="text-sm text-muted-foreground">Live price and news via secure API proxies.</p>
        </div>
        <div className="flex-1" />
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            mutate()
          }}
        >
          <Input
            aria-label="Ticker symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter ticker (e.g., AAPL)"
            className="w-40"
          />
          <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
            Load
          </Button>
        </form>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-sm text-muted-foreground">Symbol</p>
            <p className="text-lg font-semibold">{symbol}</p>
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-lg font-semibold">
                {isLoading ? "Loading…" : error ? "—" : price != null ? `$${price}` : "—"}
              </p>
              {change != null && changePct != null ? (
                <p className={`text-sm ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {change >= 0 ? "+" : ""}
                  {change} ({changePct}%)
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <PriceLineChart data={demoSeries} xKey="date" yKey="close" color="#0284c7" height={200} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Market News</h2>
        <NewsPreview />
      </section>
    </div>
  )
}

function NewsPreview() {
  const { data, isLoading, error } = useSWR("/api/news?query=market", fetcher)

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading news…</p>
  if (error) return <p className="text-sm text-red-600">Failed to load news.</p>
  if (!data?.articles?.length) return <p className="text-sm text-muted-foreground">No news available.</p>

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {data.articles.map((a: any, i: number) => (
        <li key={i} className="rounded-lg border p-4 hover:bg-accent/30">
          <a href={a.url} target="_blank" rel="noreferrer" className="space-y-2 block">
            <p className="text-sm font-medium text-pretty">{a.title}</p>
            <p className="text-xs text-muted-foreground text-pretty line-clamp-3">{a.description || a.source}</p>
            <p className="text-xs text-muted-foreground">
              {a.publishedAt ? new Date(a.publishedAt).toLocaleString() : ""}
            </p>
          </a>
        </li>
      ))}
    </ul>
  )
}
