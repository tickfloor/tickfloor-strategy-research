// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-11). Frozen before code.
export const meta = {
  id: "c1022-retail-11",
  name: "Raschke 3/10 oscillator first cross",
  family: "momentum",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "V", "UNH", "XOM", "JNJ", "COST", "ABBV", "MRK", "AVGO", "CVX", "WMT", "BAC", "ORCL", "ADBE", "CRM", "NFLX", "AMD", "INTC", "ABT", "MCD", "DIS", "QCOM", "TXN", "HON", "CAT", "LOW", "SBUX", "BA", "UPS", "PFE", "T", "MDT", "UNP", "MMM"],
  params: {"fast": 3, "slow": 10, "signal": 16},
};

export function signal(bars, i, ctx) {
  const s = ctx.state;
  if (s.pos === undefined) s.pos = 0;
  if (i < 1) return 0;
  const osc = (k) => ctx.sma("close", 3, k) - ctx.sma("close", 10, k);
  // SMA16 of the oscillator at bar k (NaN until valid).
  const sig = (k) => {
    if (k - 15 < 0) return NaN;
    let t = 0;
    for (let j = k - 15; j <= k; j++) {
      const x = osc(j);
      if (Number.isNaN(x)) return NaN;
      t += x;
    }
    return t / 16;
  };
  const o = osc(i), g = sig(i), op = osc(i - 1), gp = sig(i - 1);
  if (s.pos === 1) {
    if (o < g) s.pos = 0;
  } else if (op <= gp && o > g) {
    s.pos = 1;
  }
  return s.pos;
}
