import StockDetail from "@/components/stocks/stock-detail"

export default function StockPage({ params }: { params: { symbol: string } }) {
  const symbol = decodeURIComponent(params.symbol).toUpperCase()
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{symbol}</h2>
      <StockDetail symbol={symbol} />
    </div>
  )
}
