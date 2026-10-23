// c1023 pop chunk 2. 10% trailing stop on buy-and-hold, re-entry on 20-day closing high (Kaminski & Lo 2014).
export const meta = {
  id: "c1023-pop-28",
  name: "10% trailing stop on buy-and-hold with re-entry on a new 20-day closing high",
  family: "trend",
  source: "c1023/pop",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { trailPct: 0.1, reentryHigh: 20 },
};

export function signal(bars, i, ctx) {
  const S = ctx.state;
  const p = ctx.params;
  if (S.pos === undefined) { S.pos = 0; S.peak = 0; }
  const c = bars[i].close;
  if (S.pos === 1) {
    if (c > S.peak) S.peak = c;
    if (c <= (1 - p.trailPct) * S.peak) { S.pos = 0; return 0; }
    return 1;
  }
  if (i < p.reentryHigh) return 0;
  // start long on the first bar with 21 bars of history (i = 20), then re-enter on new 20-day closing highs
  let h = -Infinity;
  for (let k = i - p.reentryHigh; k < i; k++) if (bars[k].close > h) h = bars[k].close;
  if (i === p.reentryHigh || c > h) {
    S.pos = 1; S.peak = c;
    return 1;
  }
  return 0;
}
