// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-01). Frozen before code.
export const meta = {
  id: "c1022-retail-01",
  name: "RSI bull-range support test (Cardwell/Brown range rules)",
  family: "momentum",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "V", "UNH", "XOM", "JNJ", "COST", "ABBV", "MRK", "AVGO", "CVX", "WMT", "BAC", "ORCL", "ADBE", "CRM", "NFLX", "AMD", "INTC", "ABT", "MCD", "DIS", "QCOM", "TXN", "HON", "CAT", "LOW", "SBUX", "BA", "UPS", "PFE", "T", "MDT", "UNP", "MMM"],
  params: {"rsi": 14, "rangeLookback": 60, "rangeTop": 70, "rangeFloor": 35, "supportZone": 42, "trigger": 45, "exitLow": 35, "exitHigh": 70},
};

export function signal(bars, i, ctx) {
  const s = ctx.state;
  if (s.pos === undefined) s.pos = 0;
  const r = ctx.rsi(14, i);
  if (s.pos === 1) {
    if (r < 35 || r >= 70) s.pos = 0;
    return s.pos;
  }
  if (i < 59 || i < 1) return 0;
  let mx = -Infinity, mn = Infinity, minRecent = Infinity;
  for (let k = i - 59; k <= i; k++) {
    const x = ctx.rsi(14, k);
    if (Number.isNaN(x)) return 0;
    if (x > mx) mx = x;
    if (x < mn) mn = x;
    if (k >= i - 5 && x < minRecent) minRecent = x;
  }
  const rp = ctx.rsi(14, i - 1);
  const bullRange = mx >= 70 && mn >= 35;
  if (bullRange && rp < 45 && r >= 45 && minRecent <= 42) s.pos = 1;
  return s.pos;
}
