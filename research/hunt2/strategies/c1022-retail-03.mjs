// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-03). Frozen before code.
export const meta = {
  id: "c1022-retail-03",
  name: "RSI failure swing bottom (Wilder 1978)",
  family: "mean_reversion",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "V", "UNH", "XOM", "JNJ", "COST", "ABBV", "MRK", "AVGO", "CVX", "WMT", "BAC", "ORCL", "ADBE", "CRM", "NFLX", "AMD", "INTC", "ABT", "MCD", "DIS", "QCOM", "TXN", "HON", "CAT", "LOW", "SBUX", "BA", "UPS", "PFE", "T", "MDT", "UNP", "MMM"],
  params: {"rsi": 14, "oversold": 30, "pullbackPts": 3, "maxPatternBars": 30, "takeProfit": 70, "maxHold": 20},
};

export function signal(bars, i, ctx) {
  const s = ctx.state;
  if (s.pos === undefined) {
    s.pos = 0; s.phase = 0; s.inEp = false; s.start = 0;
    s.trough1 = NaN; s.peak = NaN; s.trough2 = NaN; s.entry = 0; s.stop = NaN;
  }
  const r = ctx.rsi(14, i);
  if (Number.isNaN(r)) return s.pos;
  if (s.pos === 1) {
    if (r >= 70 || r < s.stop || i - s.entry >= 20) { s.pos = 0; s.phase = 0; s.inEp = false; }
    return s.pos;
  }
  if (s.phase === 0) {
    if (r < 30) {
      if (!s.inEp) { s.inEp = true; s.start = i; s.trough1 = r; }
      else if (r < s.trough1) s.trough1 = r;
    } else if (s.inEp) {
      s.phase = 1; s.peak = r; s.inEp = false;
    }
    return 0;
  }
  if (s.phase === 1) {
    if (r > s.peak) s.peak = r;
    if (r < s.peak - 3) { s.phase = 2; s.trough2 = r; }
    return 0;
  }
  if (r < s.trough2) s.trough2 = r;
  if (s.trough2 < s.trough1 || i - s.start > 30) { s.phase = 0; s.inEp = false; return 0; }
  if (r > s.peak) { s.pos = 1; s.entry = i; s.stop = s.trough2; }
  return s.pos;
}
