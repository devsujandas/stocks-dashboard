export type Candle = { date: string; open: number; high: number; low: number; close: number; volume: number }

export function sma(data: Candle[], period: number) {
  const out: (number | null)[] = []
  for (let i = 0; i < data.length; i++) {
    if (i + 1 < period) out.push(null)
    else {
      const slice = data.slice(i + 1 - period, i + 1)
      out.push(slice.reduce((a, c) => a + c.close, 0) / period)
    }
  }
  return out
}

export function ema(data: Candle[], period: number) {
  const out: (number | null)[] = []
  const k = 2 / (period + 1)
  let prev: number | null = null
  data.forEach((d, i) => {
    if (i === 0) {
      out.push(null)
      prev = d.close
    } else {
      const val = d.close * k + (prev as number) * (1 - k)
      out.push(val)
      prev = val
    }
  })
  return out
}
