export const meta = {
  id: "c1031-macro-06",
  name: "Connors-style VIX stretch: buy when VIX closes 10% above its 10-day average in an index uptrend, exit above the 5-day average",
  family: "mean_reversion",
  source: "c1031/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA"],
  proxyFor: { SPY: "QQQ" },
  params: { stretch: 1.1, vixSma: 10, trendSma: 200, exitSma: 5 },
};

// M(ctx, id, i, k) = ctx.macro(id) known by the close of bar i-k; null if i-k < 0 or no value yet.
function M(ctx, id, i, k) {
  return i - k < 0 ? null : ctx.macro(id, i - k);
}

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.pos === undefined) ctx.state.pos = 0;
  const v0 = M(ctx, "VIXCLS", i, 0);
  if (v0 === null) return 0;
  let sum = 0;
  for (let k = 0; k < p.vixSma; k++) {
    const v = M(ctx, "VIXCLS", i, k);
    if (v === null) return 0;
    sum += v;
  }
  const stretch = v0 >= p.stretch * (sum / p.vixSma);
  const c = bars[i].close;
  // spec statements run in written order: entry check, then exit check on the same bar
  if (ctx.state.pos === 0 && stretch && c > ctx.sma("close", p.trendSma)) ctx.state.pos = 1;
  if (ctx.state.pos === 1 && c > ctx.sma("close", p.exitSma)) ctx.state.pos = 0;
  return ctx.state.pos;
}
