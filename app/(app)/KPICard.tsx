"use client"

type Props = {
  title: string
  value: string
  accent?: "up" | "down" | "neutral"
}
export function KPICard({ title, value, accent = "neutral" }: Props) {
  const color =
    accent === "up" ? "text-green-600" : accent === "down" ? "text-red-600" : "text-slate-900 dark:text-white"
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-card text-card-foreground">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className={`mt-1 text-lg font-semibold ${color}`}>{value}</p>
    </div>
  )
}
export default KPICard
