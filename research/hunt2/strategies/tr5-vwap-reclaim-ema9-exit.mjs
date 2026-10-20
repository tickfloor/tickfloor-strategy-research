// trending-1005 (lane m14). Pre-registered in docs/research/trending-1005/prereg.md before any run.
export const meta = {
  id: "tr5-vwap-reclaim-ema9-exit",
  name: "Session VWAP reclaim (close back above VWAP), exit on a close below the 9 EMA, long only",
  family: "trending-1005",
  source: "Reddit r/Daytrading 1wi7h4j ('A VWAP reclaim would look clean'), r/options 1womyhg (9 EMA for exits); hourly crypto version",
  assetClass: "crypto",
  timeframe: "1h",
  longShort: false,
  params: { ema: 9, flatHour: 23 },
};

// VWAP anchored at 00:00 UTC. Long when the previous close was below VWAP and this close is above it.
// Exit on a close below the 9 EMA, and flat from 23:00 UTC (the VWAP resets at midnight).
export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const day = Math.floor(b.time / 86400), h = Math.floor(b.time / 3600) % 24;
  if (s.day !== day) { s.day = day; s.pv = 0; s.v = 0; s.prevBelow = false; s.pos = 0; }
  s.pv += ((b.high + b.low + b.close) / 3) * b.volume; s.v += b.volume;
  const e = ctx.ema("close", P.ema);
  if (!(e === e) || !(s.v > 0)) return 0;
  const vwap = s.pv / s.v, below = b.close < vwap;
  if (h >= P.flatHour) s.pos = 0;
  else if (s.pos === 1 && b.close < e) s.pos = 0;
  else if (s.pos === 0 && h > 0 && s.prevBelow && !below) s.pos = 1;
  s.prevBelow = below;
  return s.pos;
}
