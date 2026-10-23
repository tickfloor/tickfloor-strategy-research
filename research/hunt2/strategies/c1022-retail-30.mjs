// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-30). Frozen before code.
// AVWAP restarts at the first 1h bar of each UTC calendar month. Long only.
export const meta = {
  id: "c1022-retail-30",
  name: "Monthly anchored VWAP with a 0.3% band (hourly crypto)",
  family: "trend",
  source: "c1022/retail",
  assetClass: "crypto",
  timeframe: "1h",
  params: { band: 0.003 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, S = ctx.state, b = bars[i];
  if (S.pos === undefined) { S.pos = 0; S.key = null; S.pv = 0; S.v = 0; }
  const d = new Date(b.time * 1000);
  const key = d.getUTCFullYear() * 12 + d.getUTCMonth();
  if (key !== S.key) { S.key = key; S.pv = 0; S.v = 0; }
  S.pv += ((b.high + b.low + b.close) / 3) * b.volume;
  S.v += b.volume;
  if (!(S.v > 0)) return S.pos;
  const avwap = S.pv / S.v;

  if (S.pos === 1) {
    if (b.close < avwap * (1 - p.band)) S.pos = 0;
  } else if (b.close > avwap * (1 + p.band)) {
    S.pos = 1;
  }
  return S.pos;
}
