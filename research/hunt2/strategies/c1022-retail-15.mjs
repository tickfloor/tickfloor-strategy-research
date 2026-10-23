// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-15). Frozen before code.
export const meta = {
  id: "c1022-retail-15",
  name: "Bollinger lower band + Stochastic cross-up (classic combo)",
  family: "mean_reversion",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "V", "UNH", "XOM", "JNJ", "COST", "ABBV", "MRK", "AVGO", "CVX", "WMT", "BAC", "ORCL", "ADBE", "CRM", "NFLX", "AMD", "INTC", "ABT", "MCD", "DIS", "QCOM", "TXN", "HON", "CAT", "LOW", "SBUX", "BA", "UPS", "PFE", "T", "MDT", "UNP", "MMM"],
  params: {"len": 20, "mult": 2, "stochK": 14, "stochSmooth": 3, "stochD": 3, "oversold": 20, "exitK": 80, "maxHold": 10},
};

// Stoch(14,3,3) helpers at arbitrary bar k (NaN until valid).
function fastK(bars, k) {
  if (k < 13) return NaN;
  let hh = -Infinity, ll = Infinity;
  for (let j = k - 13; j <= k; j++) {
    if (bars[j].high > hh) hh = bars[j].high;
    if (bars[j].low < ll) ll = bars[j].low;
  }
  return hh === ll ? 50 : (100 * (bars[k].close - ll)) / (hh - ll);
}
function slowK(bars, k) { return (fastK(bars, k) + fastK(bars, k - 1) + fastK(bars, k - 2)) / 3; }
function dLine(bars, k) { return (slowK(bars, k) + slowK(bars, k - 1) + slowK(bars, k - 2)) / 3; }

export function signal(bars, i, ctx) {
  const s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.entry = 0; }
  const midAt = (k) => ctx.sma("close", 20, k);
  const lowerAt = (k) => ctx.sma("close", 20, k) - 2 * ctx.rollingStd("close", 20, k);
  if (s.pos === 1) {
    if (bars[i].close >= midAt(i) || slowK(bars, i) > 80 || i - s.entry >= 10) s.pos = 0;
    return s.pos;
  }
  if (i < 1) return 0;
  const below = bars[i - 1].close < lowerAt(i - 1) || bars[i].close < lowerAt(i);
  let dipRecent = false;
  for (let k = i - 3; k <= i; k++) if (slowK(bars, k) < 20) dipRecent = true;
  const cross = slowK(bars, i - 1) <= dLine(bars, i - 1) && slowK(bars, i) > dLine(bars, i);
  if (below && dipRecent && cross) { s.pos = 1; s.entry = i; }
  return s.pos;
}
