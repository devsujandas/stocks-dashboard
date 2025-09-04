"use client"

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

type Props<T extends object> = {
  data: T[]
  xKey: keyof T
  yKey: keyof T
  color?: string
  height?: number
}

export function PriceLineChart<T extends object>({ data, xKey, yKey, color = "#0284c7", height = 220 }: Props<T>) {
  return (
    <div role="img" aria-label="Line chart of recent closing prices" className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey={xKey as string} tick={{ fontSize: 12 }} tickMargin={8} />
          <YAxis tick={{ fontSize: 12 }} tickMargin={8} width={44} domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--popover))",
            }}
            labelStyle={{ fontSize: 12 }}
            itemStyle={{ fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey={yKey as string}
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
