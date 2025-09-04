"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import useSWR from "swr"
import { lsGet, lsSet } from "@/lib/storage"
import { toPng } from "html-to-image"
import jsPDF from "jspdf"

type Holding = { symbol: string; quantity: number }

export default function PortfolioForm() {
  const [holdings, setHoldings] = useState<Holding[]>(() => lsGet<Holding[]>("app:portfolio", []))
  const [symbol, setSymbol] = useState("")
  const [qty, setQty] = useState<number>(0)
  const refreshInterval = lsGet("app:settings", { refreshInterval: 30000 }).refreshInterval

  useEffect(() => {
    lsSet("app:portfolio", holdings)
  }, [holdings])

  const { data: quotes } = useSWR(
    holdings.length ? `/api/portfolio-quotes?syms=${holdings.map((h) => h.symbol).join(",")}` : null,
    async (url: string) => {
      const params = new URLSearchParams(url.split("?")[1])
      const syms = (params.get("syms") || "").split(",").filter(Boolean)
      const out: Record<string, any> = {}
      await Promise.all(
        syms.map(async (s) => {
          const r = await fetch(`/api/alpha/quote?symbol=${s}`)
          out[s] = await r.json()
        }),
      )
      return out
    },
    { refreshInterval },
  )

  const total = useMemo(() => {
    return holdings.reduce((sum, h) => sum + (quotes?.[h.symbol]?.price || 0) * h.quantity, 0)
  }, [holdings, quotes])

  function addHolding() {
    const s = symbol.trim().toUpperCase()
    if (!s || qty <= 0) return
    setHoldings((prev) => {
      const i = prev.findIndex((p) => p.symbol === s)
      if (i >= 0) {
        const copy = [...prev]
        copy[i] = { ...copy[i], quantity: copy[i].quantity + qty }
        return copy
      }
      return [...prev, { symbol: s, quantity: qty }]
    })
    setSymbol("")
    setQty(0)
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(holdings, null, 2)], { type: "application/json" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "portfolio.json"
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const chartRef = useRef<HTMLDivElement>(null)
  async function downloadPNG() {
    if (!chartRef.current) return
    const png = await toPng(chartRef.current)
    const a = document.createElement("a")
    a.href = png
    a.download = "portfolio-chart.png"
    a.click()
  }
  async function downloadPDF() {
    if (!chartRef.current) return
    const png = await toPng(chartRef.current)
    const pdf = new jsPDF({ unit: "pt", format: "a4" })
    const pageWidth = pdf.internal.pageSize.getWidth()
    pdf.addImage(png, "PNG", 24, 24, pageWidth - 48, (pageWidth - 48) * 0.6)
    pdf.save("portfolio-chart.pdf")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="block text-xs text-slate-600 dark:text-slate-400">Symbol</label>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
            placeholder="AAPL"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 dark:text-slate-400">Quantity</label>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 w-28"
          />
        </div>
        <button onClick={addHolding} className="rounded-md bg-sky-600 text-white px-3 py-2 hover:bg-sky-700">
          Add
        </button>
        <div className="ml-auto text-sm">
          <span className="text-slate-600 dark:text-slate-400">Total Value</span>{" "}
          <span className="font-semibold">${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-600 dark:text-slate-400">
              <th className="py-2">Symbol</th>
              <th className="py-2">Quantity</th>
              <th className="py-2">Price</th>
              <th className="py-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => {
              const price = quotes?.[h.symbol]?.price || 0
              return (
                <tr key={h.symbol} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-2">{h.symbol}</td>
                  <td className="py-2">{h.quantity.toLocaleString()}</td>
                  <td className="py-2">{price.toFixed(2)}</td>
                  <td className="py-2">
                    {(price * h.quantity).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div ref={chartRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PortfolioGrowth holdings={holdings} />
        <PortfolioPie holdings={holdings} quotes={quotes} />
      </div>

      <div className="flex items-center gap-2">
        <button onClick={exportJSON} className="rounded-md border px-3 py-2 border-slate-300 dark:border-slate-700">
          Export JSON
        </button>
        <button onClick={downloadPNG} className="rounded-md border px-3 py-2 border-slate-300 dark:border-slate-700">
          Download PNG
        </button>
        <button onClick={downloadPDF} className="rounded-md border px-3 py-2 border-slate-300 dark:border-slate-700">
          Download PDF
        </button>
      </div>
    </div>
  )
}

function PortfolioGrowth({ holdings }: { holdings: Holding[] }) {
  const data = Array.from({ length: 30 }).map((_, i) => ({
    day: i + 1,
    value: 10000 + i * (holdings.length * 50 + 100),
  }))
  const { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } = require("recharts")
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
      <h3 className="font-semibold mb-2">Portfolio Growth</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="day" hide />
            <YAxis hide />
            <Tooltip />
            <Line dataKey="value" stroke="#0284c7" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function PortfolioPie({ holdings, quotes }: { holdings: Holding[]; quotes: Record<string, any> | undefined }) {
  const { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } = require("recharts")
  const total = holdings.reduce((sum, h) => sum + (quotes?.[h.symbol]?.price || 0) * h.quantity, 0)
  const data = holdings.map((h) => ({
    name: h.symbol,
    value: ((quotes?.[h.symbol]?.price || 0) * h.quantity * 100) / (total || 1),
  }))
  const COLORS = ["#0284c7", "#059669", "#dc2626", "#0ea5e9", "#16a34a"]

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
      <h3 className="font-semibold mb-2">Allocation</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip />
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
              {data.map((_: any, i: number) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
