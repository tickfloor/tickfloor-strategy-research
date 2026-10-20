// trending-1005 (lane m14). Pre-registered in docs/research/trending-1005/prereg.md before any run.
export const meta = {
  id: "tr5-orb-utc-1h-eod",
  name: "Opening range breakout, first hour of the UTC day, stop at the other edge, out at day end",
  family: "trending-1005",
  source: "Reddit r/Trading 1w6samx and r/Daytrading 1wp9pgy (15-minute ORB); hourly crypto version of the same rule",
  assetClass: "crypto",
  timeframe: "1h",
  longShort: true,
  params: { rangeBars: 1, lastEntryHour: 22, flatHour: 23 },
};

// Range = high/low of the 00:00 UTC hourly bar. First close above the high goes long, first close below the low goes short.
// One trade a day. A close back beyond the opposite edge exits (the stop). Flat from 23:00 UTC.
export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const day = Math.floor(b.time / 86400), h = Math.floor(b.time / 3600) % 24;
  if (s.day !== day) { s.day = day; s.hi = -Infinity; s.lo = Infinity; s.n = 0; s.pos = 0; s.done = false; }
  if (h < P.rangeBars) { s.hi = Math.max(s.hi, b.high); s.lo = Math.min(s.lo, b.low); s.n++; return 0; }
  if (s.n !== P.rangeBars || h >= P.flatHour) { s.pos = 0; return 0; }
  if (s.pos === 1 && b.close < s.lo) { s.pos = 0; s.done = true; }
  else if (s.pos === -1 && b.close > s.hi) { s.pos = 0; s.done = true; }
  else if (s.pos === 0 && !s.done && h <= P.lastEntryHour) {
    if (b.close > s.hi) { s.pos = 1; s.done = true; } else if (b.close < s.lo) { s.pos = -1; s.done = true; }
  }
  return s.pos;
}
