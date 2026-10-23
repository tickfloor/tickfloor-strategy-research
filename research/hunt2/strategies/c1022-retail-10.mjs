// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-10). Frozen before code.
export const meta = {
  id: "c1022-retail-10",
  name: "MACD histogram uptick below zero (Elder)",
  family: "mean_reversion",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "V", "UNH", "XOM", "JNJ", "COST", "ABBV", "MRK", "AVGO", "CVX", "WMT", "BAC", "ORCL", "ADBE", "CRM", "NFLX", "AMD", "INTC", "ABT", "MCD", "DIS", "QCOM", "TXN", "HON", "CAT", "LOW", "SBUX", "BA", "UPS", "PFE", "T", "MDT", "UNP", "MMM"],
  params: {"fast": 12, "slow": 26, "signal": 9, "maxHold": 20},
};

// MACD(12,26,9): line via ctx.ema; signal = custom EMA9 (alpha 2/10, seeded with first valid line).
// Must be called once per bar, in order, before reading lines/sigs.
function macdAt(ctx, i) {
  const s = ctx.state;
  if (s.lines === undefined) { s.lines = []; s.sigs = []; }
  const line = ctx.ema("close", 12, i) - ctx.ema("close", 26, i);
  let sig = NaN;
  if (!Number.isNaN(line)) {
    const ps = i > 0 ? s.sigs[i - 1] : NaN;
    sig = Number.isNaN(ps) ? line : ps + (2 / 10) * (line - ps);
  }
  s.lines.push(line);
  s.sigs.push(sig);
}

export function signal(bars, i, ctx) {
  const s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.entryHist = NaN; s.entry = 0; }
  macdAt(ctx, i);
  const H = (k) => ctx.state.lines[k] - ctx.state.sigs[k];
  if (s.pos === 1) {
    const h = H(i), hp = H(i - 1);
    if ((h > 0 && h < hp) || h < s.entryHist || i - s.entry >= 20) s.pos = 0;
    return s.pos;
  }
  if (i < 2) return 0;
  const h = H(i), h1 = H(i - 1), h2 = H(i - 2);
  if (h < 0 && h1 <= h2 && h > h1) {
    s.pos = 1; s.entryHist = h; s.entry = i;
  }
  return s.pos;
}
