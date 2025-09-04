"use client"

import { Chart as ChartJS, TimeScale, LinearScale, Tooltip as ChartTooltip, Legend } from "chart.js"
import "chartjs-adapter-date-fns"
import { CandlestickController, CandlestickElement } from "chartjs-chart-financial"
import { Chart } from "react-chartjs-2"

ChartJS.register(TimeScale, LinearScale, ChartTooltip, Legend, CandlestickController, CandlestickElement)

type Candle = { t: string | number; o: number; h: number; l: number; c: number }
export function CandleStick({ data }: { data: Candle[] }) {
  const ds = {
    datasets: [
      {
        label: "Price",
        data: data.map((d) => ({ x: d.t, o: d.o, h: d.h, l: d.l, c: d.c })),
        borderColor: "#0f172a",
        color: {
          up: "#16a34a",
          down: "#dc2626",
          unchanged: "#94a3b8",
        },
      },
    ],
  }
  return (
    <div className="w-full h-64">
      <Chart
        type="candlestick"
        data={ds as any}
        options={{ parsing: false, plugins: { legend: { display: false } } }}
      />
    </div>
  )
}
export default CandleStick
