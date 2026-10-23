export const meta = {
  id: "c1022-macro-02",
  name: "High variance risk premium versus its own year (VRP above 252d mean)",
  family: "volatility",
  source: "c1022/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA"],
  proxyFor: { SPY: "QQQ" },
  params: { rvWindow: 21, ref: 252 },
};

// vrp = M("VIX") - RV21 (annualised %, macro-01 definition). Null if VIX or RV not ready.
function vrpAt(i, ctx) {
  const v = ctx.macro("VIX", i);
  const rv = ctx.rollingStd("ret", ctx.params.rvWindow, i) * Math.sqrt(252) * 100;
  if (v === null || !Number.isFinite(rv)) return null;
  return v - rv;
}

export function signal(bars, i, ctx) {
  if (ctx.state.roll === undefined) ctx.state.roll = ctx.rolling(ctx.params.ref);
  const vrp = vrpAt(i, ctx);
  if (vrp === null) return 0;
  const roll = ctx.state.roll;
  roll.push(vrp);
  if (!roll.full()) return 0;
  return vrp > roll.mean() ? 1 : 0;
}
