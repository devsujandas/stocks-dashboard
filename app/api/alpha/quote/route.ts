import type { NextRequest } from "next/server"
import { resolveToFinnhubSymbol } from "@/lib/market-symbols"

const FINNHUB_BASE = "https://finnhub.io/api/v1"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawSymbol = searchParams.get("symbol") || "AAPL"
  const symbol = resolveToFinnhubSymbol(rawSymbol)
  const token = process.env.FINNHUB_API_KEY

  if (!token) {
    return Response.json({
      symbol: rawSymbol,
      price: 100 + Math.random() * 50,
      change: Number(((Math.random() - 0.5) * 2).toFixed(2)),
      changePercent: Number(((Math.random() - 0.5) * 2).toFixed(2)),
      volume: Math.floor(1_000_000 + Math.random() * 5_000_000),
      open: 100,
      high: 120,
      low: 95,
      previousClose: 101,
      time: new Date().toISOString(),
    })
  }

  try {
    const url = `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(token)}`
    const r = await fetch(url, { cache: "no-store" })
    if (!r.ok) {
      return Response.json({ error: "Upstream error" }, { status: 502 })
    }
    const q = await r.json()
    return Response.json({
      symbol: rawSymbol,
      price: q?.c ?? 0,
      change: q?.d ?? 0,
      changePercent: q?.dp ?? 0,
      volume: 0, // Finnhub /quote doesn't return volume; UI uses (volume||0)
      open: q?.o ?? 0,
      high: q?.h ?? 0,
      low: q?.l ?? 0,
      previousClose: q?.pc ?? 0,
      time: q?.t ? new Date(q.t * 1000).toISOString() : new Date().toISOString(),
    })
  } catch (e) {
    return Response.json({ error: "Request failed" }, { status: 500 })
  }
}
