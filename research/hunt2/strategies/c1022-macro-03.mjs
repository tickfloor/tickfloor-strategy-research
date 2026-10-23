export const meta = {
  id: "c1022-macro-03",
  name: "Variance risk premium sign gate on credit ETFs",
  family: "volatility",
  source: "c1022/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["HYG", "LQD"],
  params: { rvWindow: 21 },
};

export function signal(bars, i, ctx) {
  const v = ctx.macro("VIX", i);
  const rv = ctx.rollingStd("ret", ctx.params.rvWindow, i) * Math.sqrt(252) * 100;
  if (v === null || !Number.isFinite(rv)) return 0;
  const vrp = v - rv * 2.5; // credit ETF vol ~1/2.5 of index vol (a priori scale)
  return vrp > 0 ? 1 : 0;
}
