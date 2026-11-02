// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-22), frozen before code.
export const meta = {
  id: "c1031-overlay-22",
  name: "Minervini breakdown exit on large caps: out when a stock closes below its 50-day average on 1.5x volume, back in above the 50-day",
  family: "stop-exit",
  source: "c1031/overlay",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "V", "UNH", "XOM", "JNJ", "COST", "ABBV", "MRK", "AVGO", "CVX", "WMT", "BAC", "ORCL", "ADBE", "CRM", "NFLX", "AMD", "INTC", "ABT", "MCD", "DIS", "QCOM", "TXN", "HON", "CAT", "LOW", "SBUX", "BA", "UPS", "PFE", "T", "MDT", "UNP", "MMM"],
  params: { smaWin: 50, volWin: 20, volMult: 1.5 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < 60) return 0;
  const m = ctx.sma("close", p.smaWin, i);
  const v = ctx.sma("volume", p.volWin, i);
  if (!Number.isFinite(m) || !Number.isFinite(v)) return 0;
  const c = bars[i].close;
  if (ctx.state.on === undefined) {
    ctx.state.on = c > m ? 1 : 0;
    return ctx.state.on;
  }
  if (ctx.state.on === 1 && c < m && bars[i].volume > p.volMult * v) ctx.state.on = 0;
  else if (ctx.state.on === 0 && c > m) ctx.state.on = 1;
  return ctx.state.on;
}
