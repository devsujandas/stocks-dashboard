export const dynamic = "force-dynamic"

import { resolveToFinnhubSymbol } from "@/lib/market-symbols"

type Range = "1D" | "1W" | "1M" | "6M" | "1Y"

const FINNHUB_BASE = "https://finnhub.io/api/v1"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const rawSymbol = url.searchParams.get("symbol")
  const range = (url.searchParams.get("range") as Range) || "1M"
  if (!rawSymbol) {
    return new Response(JSON.stringify({ error: "Missing symbol" }), { status: 400 })
  }

  const token = process.env.FINNHUB_API_KEY
  if (!token) {
    // mock series
    const now = Date.now()
    const days = range === "1W" ? 7 : range === "6M" ? 180 : range === "1Y" ? 365 : range === "1D" ? 1 : 30
    const points = Array.from({ length: days }, (_, i) => {
      const t = new Date(now - (days - i) * 86400000).toISOString().slice(0, 10)
      const base = 200 + Math.sin(i / 5) * 5
      return { t, o: base - 1, h: base + 2, l: base - 3, c: base + (Math.random() - 0.5) * 2, v: 1000000 + i * 1000 }
    })
    return new Response(JSON.stringify({ symbol: rawSymbol, range, points }), {
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    })
  }

  try {
    const symbol = resolveToFinnhubSymbol(rawSymbol)
    const nowSec = Math.floor(Date.now() / 1000)

    // Determine resolution and 'from' based on the requested range
    let resolution = "D" // default daily
    let fromSec = nowSec - 30 * 24 * 60 * 60

    if (range === "1D") {
      resolution = "5" // 5-minute bars
      fromSec = nowSec - 24 * 60 * 60
    } else if (range === "1W") {
      resolution = "60" // 60-minute bars
      fromSec = nowSec - 7 * 24 * 60 * 60
    } else if (range === "1M") {
      resolution = "D"
      fromSec = nowSec - 30 * 24 * 60 * 60
    } else if (range === "6M") {
      resolution = "D"
      fromSec = nowSec - 180 * 24 * 60 * 60
    } else if (range === "1Y") {
      resolution = "D"
      fromSec = nowSec - 365 * 24 * 60 * 60
    }

    const endpoint = `${FINNHUB_BASE}/stock/candle?symbol=${encodeURIComponent(
      symbol,
    )}&resolution=${encodeURIComponent(resolution)}&from=${fromSec}&to=${nowSec}&token=${encodeURIComponent(token)}`

    const res = await fetch(endpoint, { cache: "no-store" })
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Upstream error" }), { status: 502 })
    }
    const json = await res.json()
    if (!json || json.s !== "ok") {
      // Finnhub returns s: "no_data" when no candles
      return new Response(JSON.stringify({ symbol: rawSymbol, range, points: [] }), {
        status: 200,
        headers: { "content-type": "application/json", "cache-control": "no-store" },
      })
    }

    const t: number[] = json.t || []
    const o: number[] = json.o || []
    const h: number[] = json.h || []
    const l: number[] = json.l || []
    const c: number[] = json.c || []
    const v: number[] = json.v || []

    const points = t.map((ts, i) => ({
      t: new Date(ts * 1000).toISOString().slice(0, 10),
      o: o[i] ?? null,
      h: h[i] ?? null,
      l: l[i] ?? null,
      c: c[i] ?? null,
      v: v[i] ?? null,
    }))

    return new Response(JSON.stringify({ symbol: rawSymbol, range, points }), {
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    })
  } catch {
    return new Response(JSON.stringify({ error: "Request failed" }), { status: 500 })
  }
}
