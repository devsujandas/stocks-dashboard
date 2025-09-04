"use client"

import useSWR from "swr"
import { useMemo, useRef, useState } from "react"
import { sma, ema, type Candle } from "@/components/stocks/indicator-utils"
import StockLineChart from "@/components/charts/stock-line-chart"
import CandlestickChart from "@/components/charts/candlestick-chart"

const fetcher = (url: string) => fetch(url).then((r) => r.json())
const RANGES = ["1D", "1W", "1M", "6M", "1Y"] as const
type Range = (typeof RANGES)[number]

export default function StockDetail({ symbol }: { symbol: string }) {
  const [range, setRange] = useState<Range>("1M")
  const [showSMA, setShowSMA] = useState(true)
  const [showEMA, setShowEMA] = useState(false)
  const [mode, setMode] = useState<"line" | "candle">("line")
  const chartWrapRef = useRef<HTMLDivElement>(null)

  const { data } = useSWR(`/api/alpha/time-series?symbol=${symbol}&range=${range}`, fetcher)
  const candles: Candle[] = data?.candles || []
  const sma20 = useMemo(() => sma(candles, 20), [candles])
  const ema20 = useMemo(() => ema(candles, 20), [candles])

  const latest = candles[candles.length - 1]

  const toggleFullscreen = async () => {
    const el = chartWrapRef.current
    if (!el) return
    if (document.fullscreenElement) await document.exitFullscreen()
    else await el.requestFullscreen().catch(() => {})
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 rounded-md border text-sm ${range === r ? "bg-sky-600 border-sky-600 text-white" : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"}`}
          >
            {r}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setMode("line")}
            className={`px-3 py-1 rounded-md border text-sm ${mode === "line" ? "bg-sky-600 border-sky-600 text-white" : "border-slate-300 dark:border-slate-700"}`}
          >
            Line
          </button>
          <button
            onClick={() => setMode("candle")}
            className={`px-3 py-1 rounded-md border text-sm ${mode === "candle" ? "bg-sky-600 border-sky-600 text-white" : "border-slate-300 dark:border-slate-700"}`}
          >
            Candles
          </button>
        </div>
      </div>

      <div ref={chartWrapRef}>
        {mode === "line" ? (
          <StockLineChart data={candles} showSMA={showSMA} showEMA={showEMA} smaData={sma20} emaData={ema20} />
        ) : (
          <CandlestickChart data={candles} />
        )}
      </div>

      <div className="flex items-center gap-4">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showSMA} onChange={(e) => setShowSMA(e.target.checked)} />
          SMA 20
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showEMA} onChange={(e) => setShowEMA(e.target.checked)} />
          EMA 20
        </label>
        <button onClick={toggleFullscreen} className="ml-auto text-sm text-sky-600">
          Full screen chart
        </button>
      </div>

      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
          <Metric label="Open" value={latest.open} />
          <Metric label="Close" value={latest.close} />
          <Metric label="High" value={latest.high} />
          <Metric label="Low" value={latest.low} />
          <Metric label="Volume" value={latest.volume} format="int" />
          <Metric label="Date" value={new Date(latest.date).toLocaleDateString()} format="text" />
        </div>
      )}
    </div>
  )
}

function Metric({ label, value, format = "float" as "float" | "int" | "text" }) {
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-800 p-2">
      <div className="text-xs text-slate-600 dark:text-slate-400">{label}</div>
      <div className="font-medium">
        {format === "text" ? value : format === "int" ? Number(value).toLocaleString() : Number(value).toFixed(2)}
      </div>
    </div>
  )
}
