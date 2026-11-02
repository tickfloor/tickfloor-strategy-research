export const meta = {
  id: "c1031-macro-04",
  name: "55-day Donchian breakout on large-cap stocks, entries allowed only when VIX is below its 126-day mean",
  family: "trend",
  source: "c1031/macro",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: [
    "AAPL", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "V", "UNH", "XOM",
    "JNJ", "COST", "ABBV", "MRK", "AVGO", "CVX", "WMT", "BAC", "ORCL", "ADBE",
    "CRM", "NFLX", "AMD", "INTC", "ABT", "MCD", "DIS", "QCOM", "TXN", "HON",
    "CAT", "LOW", "SBUX", "BA", "UPS", "PFE", "T", "MDT", "UNP", "MMM",
  ],
  params: { entryN: 55, exitN: 20, vixMeanN: 126 },
};

// M(ctx, id, i, k) = ctx.macro(id) known by the close of bar i-k; null if i-k < 0 or no value yet.
function M(ctx, id, i, k) {
  return i - k < 0 ? null : ctx.macro(id, i - k);
}

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.pos === undefined) ctx.state.pos = 0;
  if (i < 1) return 0;
  const v0 = M(ctx, "VIXCLS", i, 0);
  if (v0 === null) return 0;
  let sum = 0;
  for (let k = 0; k < p.vixMeanN; k++) {
    const v = M(ctx, "VIXCLS", i, k);
    if (v === null) return 0;
    sum += v;
  }
  const calm = v0 < sum / p.vixMeanN;
  const c = bars[i].close;
  const prev = ctx.state.pos; // conditions read the state at the start of the bar
  if (prev === 0 && calm && c > ctx.donchian(p.entryN, i - 1).upper) ctx.state.pos = 1;
  if (prev === 1 && c < ctx.donchian(p.exitN, i - 1).lower) ctx.state.pos = 0;
  return ctx.state.pos;
}
