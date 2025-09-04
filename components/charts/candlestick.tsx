"use client"

import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js"
import "chartjs-adapter-date-fns"
import {
  CandlestickController,
  CandlestickElement,
} from "chartjs-chart-financial"
import { Chart } from "react-chartjs-2"

ChartJS.register(
  TimeScale,
  LinearScale,
  ChartTooltip,
  Legend,
  CandlestickController,
  CandlestickElement
)

type Candle = { t: string | number; o: number; h: number; l: number; c: number }

export function CandleStick({ data }: { data: Candle[] }) {
  const formattedData = data.map((d) => ({
    x: typeof d.t === "string" ? new Date(d.t).getTime() : d.t * 1000, // timestamp ms
    o: d.o,
    h: d.h,
    l: d.l,
    c: d.c,
  }))

  const chartData = {
    datasets: [
      {
        label: "Candlestick",
        data: formattedData,
        color: {
          up: "#16a34a",
          down: "#dc2626",
          unchanged: "#94a3b8",
        },
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    parsing: false as const,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        type: "time" as const,
        time: { unit: "day" as const, tooltipFormat: "MMM dd, yyyy" },
      },
      y: { beginAtZero: false },
    },
  }

  return (
    <div className="w-full h-80">
      <Chart type="candlestick" data={chartData as any} options={options} />
    </div>
  )
}

export default CandleStick
