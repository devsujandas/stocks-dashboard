"use client"

import useSWR from "swr"
import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export default function ComparisonChart({ symbols }: { symbols: string[] }) {
  const { data: sets } = useSWR(
    symbols.length ? `/api/compare?syms=${symbols.join(",")}` : null,
    async (url: string) => {
      const params = new URLSearchParams(url.split("?")[1])
      const syms = (params.get("syms") || "").split(",").filter(Boolean)
      const out: Record<string, any> = {}
      await Promise.all(
        syms.map(async (s) => {
          const r = await fetch(`/api/alpha/time-series?symbol=${s}&range=6M`)
          out[s] = await r.json()
        }),
      )
      return out
    },
  )

  const series = useMemo(() => {
    const entries = Object.entries(sets || {})
    if (!entries.length) return []
    const length = Math.min(...entries.map(([_, v]: any) => v.candles.length))
    const basePrices: Record<string, number> = {}
    const lines = Array.from({ length }).map((_, i) => {
      const row: any = { i }
      for (const [sym, v] of entries) {
        const c = v.candles[v.candles.length - length + i]
        basePrices[sym] ??= v.candles[v.candles.length - length].close
        row[sym] = ((c.close - basePrices[sym]) / basePrices[sym]) * 100
      }
      return row
    })
    return lines
  }, [sets])

  const colors = ["#0284c7", "#059669", "#dc2626"]

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series}>
          <XAxis dataKey="i" hide />
          <YAxis tickFormatter={(v) => `${v}%`} />
          <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
          {symbols.map((s, i) => (
            <Line key={s} dataKey={s} stroke={colors[i % colors.length]} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
