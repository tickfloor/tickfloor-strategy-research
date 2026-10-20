// trending-1005 (lane m14). Pre-registered in docs/research/trending-1005/prereg.md before any run.
export const meta = {
  id: "tr5-vwap-ema9-trend",
  name: "Session VWAP plus 9 EMA trend rule: long above both, short below both, flat when they disagree",
  family: "trending-1005",
  source: "Reddit r/options 1womyhg ('mainly VWAP and 9 EMA'); YouTube VWAP strategy videos, Aug to Sep 2026; hourly crypto version",
  assetClass: "crypto",
  timeframe: "1h",
  longShort: true,
  params: { ema: 9 },
};

// VWAP anchored at 00:00 UTC each day: running sum of typical price x volume over running volume.
export function signal(bars, i, ctx) {
  const s = ctx.state, b = bars[i];
  const day = Math.floor(b.time / 86400);
  if (s.day !== day) { s.day = day; s.pv = 0; s.v = 0; }
  s.pv += ((b.high + b.low + b.close) / 3) * b.volume; s.v += b.volume;
  const e = ctx.ema("close", ctx.params.ema);
  if (!(e === e) || !(s.v > 0) || Math.floor(b.time / 3600) % 24 === 0) return 0;
  const vwap = s.pv / s.v;
  if (b.close > vwap && b.close > e) return 1;
  if (b.close < vwap && b.close < e) return -1;
  return 0;
}
