"use client"

import useSWR from "swr"

const fetcher = (u: string) => fetch(u).then((r) => r.json())

function sentiment(desc: string): "Positive" | "Neutral" | "Negative" {
  const d = (desc || "").toLowerCase()
  const pos = ["beat", "surge", "rise", "up", "record", "strong", "gain", "soar", "growth"]
  const neg = ["miss", "fall", "down", "weak", "drop", "loss", "slump", "cut", "decline"]
  const score =
    pos.reduce((s, w) => (d.includes(w) ? s + 1 : s), 0) - neg.reduce((s, w) => (d.includes(w) ? s + 1 : s), 0)
  if (score > 0) return "Positive"
  if (score < 0) return "Negative"
  return "Neutral"
}

export default function NewsList({ query }: { query?: string }) {
  const { data } = useSWR(`/api/news?q=${encodeURIComponent(query || "markets")}`, fetcher)
  const articles = data?.articles || []
  return (
    <div className="space-y-3">
      {articles.map((a: any, i: number) => {
        const tag = sentiment(a.description || a.title || "")
        return (
          <a
            key={i}
            href={a.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg border border-slate-200 dark:border-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="text-sm text-slate-500">
                  {a.source?.name} • {new Date(a.publishedAt).toLocaleString()}
                </div>
                <div className="mt-1 font-medium text-slate-900 dark:text-white">{a.title}</div>
                <div className="mt-1 text-sm text-slate-700 dark:text-slate-300">{a.description}</div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${tag === "Positive" ? "bg-emerald-50 text-emerald-700" : tag === "Negative" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-700"}`}
              >
                {tag}
              </span>
            </div>
          </a>
        )
      })}
    </div>
  )
}
