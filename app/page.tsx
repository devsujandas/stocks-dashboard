"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

type Point = { x: number; y: number }

function useSparkline(points = 90) {
  const [data, setData] = useState<Point[]>([])
  useEffect(() => {
    let y = 50
    const arr: Point[] = []
    for (let i = 0; i < points; i++) {
      y = Math.min(95, Math.max(5, y + (Math.random() - 0.5) * 8))
      arr.push({ x: i, y })
    }
    setData(arr)
    const id = setInterval(() => {
      y = Math.min(95, Math.max(5, y + (Math.random() - 0.5) * 6))
      setData((prev) => {
        const next = prev.slice(1)
        next.push({ x: prev[prev.length - 1]?.x + 1 || points, y })
        return next.map((p, idx) => ({ x: idx, y: p.y }))
      })
    }, 1200)
    return () => clearInterval(id)
  }, [points])

  const pathD = useMemo(() => {
    if (!data.length) return ""
    const w = 320
    const h = 200
    const maxX = Math.max(...data.map((p) => p.x)) || 1
    const maxY = 100
    const minY = 0
    const scaleX = (x: number) => (x / maxX) * w
    const scaleY = (y: number) => h - ((y - minY) / (maxY - minY)) * h
    return data.reduce((path, p, i) => {
      const cmd = `${i === 0 ? "M" : "L"} ${scaleX(p.x)} ${scaleY(p.y)}`
      return path + (i === 0 ? cmd : ` ${cmd}`)
    }, "")
  }, [data])

  return { pathD }
}

export default function HomePage() {
  const { pathD } = useSparkline(90)

  return (
    <main className="min-h-dvh bg-white text-black dark:bg-black dark:text-white">
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
              Smarter stock insights, clean and fast.
            </h1>
            <p className="mt-4 text-base text-neutral-700 dark:text-neutral-300 md:text-lg">
              A premium dashboard for markets, watchlists, portfolios, and news—beautifully designed for speed and
              clarity.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/dashboard"
                className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
              >
                Open Dashboard
              </Link>
              <Link
                href="/news"
                className="rounded-md border border-black/10 px-4 py-2 text-sm font-medium text-black transition hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
              >
                Browse News
              </Link>
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <Link href="/privacy" className="underline decoration-white/20 underline-offset-4 hover:opacity-90">
                Privacy Policy
              </Link>
              <Link href="/terms" className="underline decoration-white/20 underline-offset-4 hover:opacity-90">
                Terms & Conditions
              </Link>
            </div>
          </div>
          <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
            <div className="relative h-60 w-full overflow-hidden">
              {pathD ? (
                <svg viewBox="0 0 320 200" className="h-full w-full">
                  <defs>
                    <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2"
                    className="animate-[dash_2s_ease-in-out_infinite]"
                  />
                  <path d={`${pathD} L 320 200 L 0 200 Z`} fill="url(#sparkFill)" className="opacity-70" />
                </svg>
              ) : (
                <div className="h-full w-full rounded-md bg-slate-100 dark:bg-white/10 animate-pulse" />
              )}
              <style>
                {`
                @keyframes dash {
                  0% { stroke-dasharray: 0 1000; }
                  50% { stroke-dasharray: 500 1000; }
                  100% { stroke-dasharray: 0 1000; }
                }
              `}
              </style>
            </div>
          </div>
        </div>
      </section>
      <footer className="border-t border-black/10 px-4 py-8 text-sm text-neutral-600 dark:border-white/10 dark:text-neutral-300">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} StockPro Analytics. All rights reserved.</div>
          <div>Designed & Developed by Sujan Das</div>
        </div>
      </footer>
    </main>
  )
}
