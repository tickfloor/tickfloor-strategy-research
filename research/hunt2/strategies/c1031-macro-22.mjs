// c1031 round-4 macro spec c1031-macro-22 (frozen in campaign-1031/prereg-macro.json).
// Source: Baur & Lucey (2010) Is gold a hedge or a safe haven?, Financial Review 45(2); Ranaldo & Soderlind (2010) Safe haven currencies, Rev. of Finance 14(3)

export const meta = {
  "id": "c1031-macro-22",
  "name": "Safe-haven basket while the VIX curve is inverted: UUP, TLT and GLD from ratio of 1.0 or more until it falls below 0.95",
  "family": "volatility",
  "source": "c1031/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "UUP",
    "TLT",
    "GLD"
  ],
  "params": {
    "enterRatio": 1,
    "exitRatio": 0.95
  }
};

export function signal(bars, i, ctx) {
  const { enterRatio, exitRatio } = ctx.params;
  if (ctx.state.pos === undefined) ctx.state.pos = 0;
  const vix = ctx.macro("VIX", i);
  const vix3m = ctx.macro("VIX3M", i);
  if (vix === null || vix3m === null) return 0;
  const ratio = vix / vix3m;
  if (ctx.state.pos === 0 && ratio >= enterRatio) ctx.state.pos = 1;
  if (ctx.state.pos === 1 && ratio < exitRatio) ctx.state.pos = 0;
  return ctx.state.pos;
}
