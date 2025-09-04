"use client"

import { useEffect, useMemo, useRef } from "react"
import useSWRInfinite from "swr/infinite"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function CardSkeleton() {
  return (
    <li className="rounded-xl border border-slate-200 dark:border-white/10 p-4 animate-pulse">
      <div className="h-36 w-full rounded-lg bg-slate-100 dark:bg-white/10" />
      <div className="mt-3 h-4 w-5/6 rounded bg-slate-100 dark:bg-white/10" />
      <div className="mt-2 h-3 w-3/4 rounded bg-slate-100 dark:bg-white/10" />
      <div className="mt-4 h-3 w-24 rounded bg-slate-100 dark:bg-white/10" />
    </li>
  )
}

export default function NewsPage() {
  const PAGE_SIZE = 10
  const getKey = (pageIndex: number, prev: any) => {
    if (prev && (!prev.articles || prev.articles.length === 0)) return null
    return `/api/news?query=market&page=${pageIndex + 1}&pageSize=${PAGE_SIZE}`
  }
  const { data, error, isLoading, setSize, size, isValidating } = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: false,
  })

  const articles = useMemo(() => (data ? data.flatMap((d: any) => d?.articles ?? []) : []), [data])
  const isEmpty = !isLoading && articles.length === 0
  const isEnd = data && data[data.length - 1]?.articles?.length === 0

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!sentinelRef.current || isLoading || isEnd) return
    const io = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry.isIntersecting) setSize((s) => s + 1)
    })
    io.observe(sentinelRef.current)
    return () => io.disconnect()
  }, [isLoading, isEnd, setSize])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Latest Market News</h2>

      {error && <p className="text-sm text-red-600">Failed to load news.</p>}

      {isLoading && !data ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </ul>
      ) : isEmpty ? (
        <p className="text-sm text-muted-foreground">No news available.</p>
      ) : (
        <>
          <ul className="grid gap-4 md:grid-cols-2">
            {articles.map((a: any, i: number) => {
              const img = a.urlToImage || "/market-news-illustration.jpg"
              const source = a.source?.name || "Unknown"
              const published = a.publishedAt ? new Date(a.publishedAt).toLocaleString() : ""
              return (
                <li
                  key={`${a.url}-${i}`}
                  className="group overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-card text-card-foreground transition hover:shadow-lg hover:-translate-y-0.5"
                >
                  <a href={a.url} target="_blank" rel="noreferrer" className="block">
                    <div className="aspect-[16/9] w-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img || "/placeholder.svg"}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-white/15 px-2 py-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                          {source}
                        </span>
                        {published && (
                          <span className="text-[11px] text-muted-foreground" aria-label="Published at">
                            {published}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium leading-5 text-pretty group-hover:underline">{a.title}</p>
                      {a.description && <p className="text-xs text-muted-foreground line-clamp-3">{a.description}</p>}
                    </div>
                  </a>
                </li>
              )
            })}
          </ul>

          {/* load more controls */}
          {!isEnd && (
            <div className="flex justify-center">
              <button
                onClick={() => setSize(size + 1)}
                className="mt-2 rounded-md border px-3 py-1.5 text-sm border-slate-200 dark:border-white/15 hover:bg-slate-50 dark:hover:bg-white/5"
                disabled={isValidating}
              >
                {isValidating ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
          <div ref={sentinelRef} className="h-6" aria-hidden />
        </>
      )}
    </div>
  )
}
