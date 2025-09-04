export type IndexAlias =
  | "NIFTY"
  | "SENSEX"
  | "NASDAQ"
  | "SP500"
  | "BANKNIFTY"
  | "^NSEI"
  | "^BSESN"
  | "^IXIC"
  | "^GSPC"
  | "^NSEBANK"
  | "NSEI"
  | "BSESN"
  | "IXIC"
  | "GSPC"
  | "NSEBANK"

const INDEX_MAP: Record<string, string> = {
  // India
  NIFTY: "^NSEI",
  "^NSEI": "^NSEI",
  NSEI: "^NSEI",
  SENSEX: "^BSESN",
  "^BSESN": "^BSESN",
  BSESN: "^BSESN",
  BANKNIFTY: "^NSEBANK",
  "^NSEBANK": "^NSEBANK",
  NSEBANK: "^NSEBANK",
  // US
  NASDAQ: "^IXIC",
  "^IXIC": "^IXIC",
  IXIC: "^IXIC",
  SP500: "^GSPC",
  "S&P500": "^GSPC",
  "^GSPC": "^GSPC",
  GSPC: "^GSPC",
}

export function resolveToFinnhubSymbol(input: string): string {
  const sym = (input || "").toUpperCase().trim()
  return INDEX_MAP[sym] || sym
}
