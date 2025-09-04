import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q") || searchParams.get("query") || "markets"
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10))
  const pageSize = Math.min(50, Math.max(5, Number.parseInt(searchParams.get("pageSize") || "10", 10)))
  const key = process.env.NEWSAPI_API_KEY

  if (!key) {
    const now = Date.now()
    const articles = Array.from({ length: pageSize }).map((_, i) => {
      const idx = (page - 1) * pageSize + i + 1
      return {
        title: `Mock ${query} headline #${idx}`,
        description: `This is a mock description for ${query} item ${idx}.`,
        url: `https://news.example.com/${query}/${idx}`,
        source: { name: "Mock News" },
        publishedAt: new Date(now - idx * 60000).toISOString(),
        urlToImage: undefined,
      }
    })
    return Response.json({ status: "ok", totalResults: 1000, articles })
  }

  const url =
    `https://newsapi.org/v2/everything` +
    `?q=${encodeURIComponent(query)}` +
    `&page=${page}` +
    `&pageSize=${pageSize}` +
    `&sortBy=publishedAt&language=en&apiKey=${key}`
  const r = await fetch(url, { cache: "no-store" })
  const j = await r.json()
  return Response.json(j)
}
