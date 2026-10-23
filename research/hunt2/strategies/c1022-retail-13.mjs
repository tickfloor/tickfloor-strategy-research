// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-13). Frozen before code.
export const meta = {
  id: "c1022-retail-13",
  name: "Bollinger W-bottom (Bollinger's own setup)",
  family: "mean_reversion",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "V", "UNH", "XOM", "JNJ", "COST", "ABBV", "MRK", "AVGO", "CVX", "WMT", "BAC", "ORCL", "ADBE", "CRM", "NFLX", "AMD", "INTC", "ABT", "MCD", "DIS", "QCOM", "TXN", "HON", "CAT", "LOW", "SBUX", "BA", "UPS", "PFE", "T", "MDT", "UNP", "MMM"],
  params: {"len": 20, "mult": 2, "nearLowTol": 0.01, "reboundPctB": 0.5, "maxPatternBars": 40, "maxHold": 30},
};

export function signal(bars, i, ctx) {
  const s = ctx.state;
  if (s.pos === undefined) {
    s.pos = 0; s.phase = 0; s.start = 0; s.low1 = NaN; s.neck = NaN; s.low2 = NaN; s.entry = 0;
  }
  const c = bars[i].close;
  const mid = ctx.sma("close", 20, i), sd = ctx.rollingStd("close", 20, i);
  const lower = mid - 2 * sd, upper = mid + 2 * sd;
  const pb = upper > lower ? (c - lower) / (upper - lower) : NaN;
  if (s.pos === 1) {
    if (pb > 1 || c < s.low2 || i - s.entry >= 30) { s.pos = 0; s.phase = 0; }
    return s.pos;
  }
  if (s.phase !== 0 && i - s.start > 40) s.phase = 0;
  if (s.phase === 0) {
    if (pb < 0) { s.phase = 1; s.low1 = c; s.start = i; }
    return 0;
  }
  if (s.phase === 1) {
    if (pb < 0) { if (c < s.low1) s.low1 = c; }
    else if (pb > 0.5) { s.neck = c; s.phase = 2; }
    return 0;
  }
  if (s.phase === 2) {
    if (c > s.neck) s.neck = c;
    if (c <= s.low1 * 1.01 && pb > 0) { s.low2 = c; s.phase = 3; }
    return 0;
  }
  if (c < s.low2) s.low2 = c;
  if (c < lower) { s.phase = 0; return 0; }
  if (c > s.neck) { s.pos = 1; s.entry = i; }
  return s.pos;
}
