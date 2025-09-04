import type { NextRequest } from "next/server"

type Candle = {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get("symbol") || "AAPL"
  const range = searchParams.get("range") || "1M" // 1D, 1W, 1M, 6M, 1Y
  const key = process.env.ALPHA_VANTAGE_API_KEY

  if (!key) {
    const now = Date.now()
    const candles: Candle[] = Array.from({ length: 120 }).map((_, i) => {
      const t = new Date(now - (120 - i) * 24 * 60 * 60 * 1000)
      const base = 100 + i * 0.3
      const open = base + (Math.random() - 0.5) * 2
      const close = open + (Math.random() - 0.5) * 3
      const high = Math.max(open, close) + Math.random() * 2
      const low = Math.min(open, close) - Math.random() * 2
      return { date: t.toISOString(), open, high, low, close, volume: Math.floor(500_000 + Math.random() * 2_000_000) }
    })
    return Response.json({ symbol, candles })
  }

  const func = range === "1D" ? "TIME_SERIES_INTRADAY&interval=5min" : "TIME_SERIES_DAILY_ADJUSTED"
  const url = `https://www.alphavantage.co/query?function=${func}&symbol=${encodeURIComponent(symbol)}&outputsize=compact&apikey=${key}`
  const r = await fetch(url, { cache: "no-store" })
  const j = await r.json()
  const keyName = j["Time Series (5min)"]
    ? "Time Series (5min)"
    : j["Time Series (Daily)"]
      ? "Time Series (Daily)"
      : "Time Series (Daily)"
  const ts = j[keyName] || {}
  const candles: Candle[] = Object.entries(ts)
    .map(([date, v]: any) => ({
      date,
      open: Number.parseFloat(v["1. open"]),
      high: Number.parseFloat(v["2. high"]),
      low: Number.parseFloat(v["3. low"]),
      close: Number.parseFloat(v["4. close"]),
      volume: Number.parseInt(v["6. volume"] || v["5. volume"] || "0", 10),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return Response.json({ symbol, candles })
}
