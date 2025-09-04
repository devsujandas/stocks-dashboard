"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import type { Candle } from "@/components/stocks/indicator-utils"

export default function StockLineChart({
  data,
  showSMA,
  showEMA,
  smaData,
  emaData,
}: { data: Candle[]; showSMA?: boolean; showEMA?: boolean; smaData?: (number | null)[]; emaData?: (number | null)[] }) {
  const points = data.map((d, i) => ({
    date: new Date(d.date).toLocaleDateString(),
    close: d.close,
    sma: smaData?.[i] ?? null,
    ema: emaData?.[i] ?? null,
  }))

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <XAxis dataKey="date" hide />
          <YAxis hide />
          <Tooltip />
          <Line type="monotone" dataKey="close" stroke="#0284c7" dot={false} strokeWidth={2} />
          {showSMA && <Line type="monotone" dataKey="sma" stroke="#334155" dot={false} />}
          {showEMA && <Line type="monotone" dataKey="ema" stroke="#059669" dot={false} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
