// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-26), frozen before code.
export const meta = {
  id: "c1031-overlay-26",
  name: "Fast EMA trend-rider on large caps: out after 2 straight closes below the 21-day EMA, back in when the 10-day EMA is above it and the close is above it",
  family: "trend",
  source: "c1031/overlay",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "V", "UNH", "XOM", "JNJ", "COST", "ABBV", "MRK", "AVGO", "CVX", "WMT", "BAC", "ORCL", "ADBE", "CRM", "NFLX", "AMD", "INTC", "ABT", "MCD", "DIS", "QCOM", "TXN", "HON", "CAT", "LOW", "SBUX", "BA", "UPS", "PFE", "T", "MDT", "UNP", "MMM"],
  params: { slowEma: 21, fastEma: 10, exitBars: 2 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < 40) return 0;
  const slow = (j) => ctx.ema("close", p.slowEma, j);
  const sNow = slow(i);
  const fNow = ctx.ema("close", p.fastEma, i);
  if (!Number.isFinite(sNow) || !Number.isFinite(fNow)) return 0;
  const c = bars[i].close;
  if (ctx.state.on === undefined) {
    ctx.state.on = c > sNow ? 1 : 0;
    return ctx.state.on;
  }
  let belowAll = true;
  for (let k = i - p.exitBars + 1; k <= i; k++) if (!(bars[k].close < slow(k))) belowAll = false;
  if (ctx.state.on === 1 && belowAll) ctx.state.on = 0;
  else if (ctx.state.on === 0 && fNow > sNow && c > sNow) ctx.state.on = 1;
  return ctx.state.on;
}
