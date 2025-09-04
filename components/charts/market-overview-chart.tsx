"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function MarketOverviewChart({
  symbol = "AAPL",
  refreshInterval = 30000,
}: { symbol?: string; refreshInterval?: number }) {
  const { data } = useSWR(`/api/alpha/time-series?symbol=${symbol}&range=1M`, fetcher, { refreshInterval })
  const points =
    data?.candles?.map((c: any) => ({
      date: new Date(c.date).toLocaleDateString(),
      close: c.close,
    })) ?? []

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <XAxis dataKey="date" hide />
          <YAxis hide />
          <Tooltip />
          <Line type="monotone" dataKey="close" stroke="#0284c7" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
