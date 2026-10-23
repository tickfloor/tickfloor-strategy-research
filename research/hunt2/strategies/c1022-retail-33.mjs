// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-33). Frozen before code.
// Pivot P and S1 = 2P - H from the last COMPLETE weekly bar. Long only.
export const meta = {
  id: "c1022-retail-33",
  name: "Weekly floor pivot as a trend line (above P long, below S1 flat)",
  family: "trend",
  source: "c1022/retail",
  assetClass: "etf",
  timeframe: "1d",
  params: {},
};

export function signal(bars, i, ctx) {
  const S = ctx.state;
  if (S.pos === undefined) S.pos = 0;
  const W = ctx.resample(bars, "1w");
  let w = null;
  for (let k = W.length - 1; k >= 0; k--) {
    if (W[k].complete) { w = W[k]; break; }
  }
  if (!w) return 0;
  const P = (w.high + w.low + w.close) / 3;
  const S1 = 2 * P - w.high;
  const c = bars[i].close;

  if (S.pos === 1) {
    if (c < S1) S.pos = 0;
  } else if (c > P) {
    S.pos = 1;
  }
  return S.pos;
}
