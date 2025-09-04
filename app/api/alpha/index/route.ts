import { NextResponse } from "next/server"
import { resolveToFinnhubSymbol } from "@/lib/market-symbols"

const FINNHUB_BASE = "https://finnhub.io/api/v1"

function requireEnv(): string {
  const key = process.env.FINNHUB_API_KEY
  if (!key) throw new Error("Missing FINNHUB_API_KEY. Add it in Project Settings.")
  return key
}

const DEFAULT_INDICES = ["SENSEX", "NIFTY", "NASDAQ", "SP500", "BANKNIFTY"]

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const listRaw = searchParams.get("list")
    const names = (listRaw ? listRaw.split(",") : DEFAULT_INDICES).map((s) => s.trim())
    const token = requireEnv()

    const results = await Promise.all(
      names.map(async (name) => {
        const symbol = resolveToFinnhubSymbol(name)
        const url = `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(token)}`
        const r = await fetch(url, { cache: "no-store" })
        if (!r.ok) return { name, symbol, error: true }
        const q = await r.json()
        return {
          name,
          symbol,
          price: q.c ?? null,
          change: q.d ?? null,
          changePercent: q.dp ?? null,
          high: q.h ?? null,
          low: q.l ?? null,
          open: q.o ?? null,
          prevClose: q.pc ?? null,
        }
      }),
    )

    return NextResponse.json({ indices: results }, { headers: { "cache-control": "no-store" } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 })
  }
}
