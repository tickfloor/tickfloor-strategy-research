// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-28). Frozen before code.
// Anchored VWAP from the first bar of each UTC calendar year (typical price, volume-weighted). Long only.
export const meta = {
  id: "c1022-retail-28",
  name: "Year-to-date anchored VWAP trend filter (Shannon)",
  family: "trend",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { exitBuffer: 0.01 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, S = ctx.state, b = bars[i];
  if (S.pos === undefined) { S.pos = 0; S.year = -1; S.pv = 0; S.v = 0; }
  const y = new Date(b.time * 1000).getUTCFullYear();
  if (y !== S.year) { S.year = y; S.pv = 0; S.v = 0; }
  S.pv += ((b.high + b.low + b.close) / 3) * b.volume;
  S.v += b.volume;
  if (!(S.v > 0)) return S.pos;
  const avwap = S.pv / S.v;

  if (S.pos === 1) {
    if (b.close < avwap * (1 - p.exitBuffer)) S.pos = 0;
  } else if (b.close > avwap) {
    S.pos = 1;
  }
  return S.pos;
}
