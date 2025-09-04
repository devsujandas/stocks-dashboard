"use client"

import { Chart as ReactChart } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, TimeScale, Tooltip, Legend } from "chart.js"
import "chartjs-adapter-date-fns"
import { CandlestickController, CandlestickElement } from "chartjs-chart-financial"
import type { Candle } from "@/components/stocks/indicator-utils"

ChartJS.register(CategoryScale, LinearScale, TimeScale, Tooltip, Legend, CandlestickController, CandlestickElement)

export default function CandlestickChart({ data }: { data: Candle[] }) {
  const ds = data.map((d) => ({
    x: new Date(d.date),
    o: d.open,
    h: d.high,
    l: d.low,
    c: d.close,
  }))

  const chartData = {
    datasets: [
      {
        label: "Price",
        data: ds,
        type: "candlestick" as const,
        borderColor: "#334155",
        color: {
          up: "#059669",
          down: "#dc2626",
          unchanged: "#64748b",
        },
      },
    ],
  }

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    parsing: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { type: "time", time: { unit: "day" }, display: false },
      y: { display: true, ticks: { color: "#64748b" } },
    },
  }

  return (
    <div className="h-72">
      <ReactChart type="candlestick" data={chartData} options={options} />
    </div>
  )
}
