// trending-1005 (lane m14). Pre-registered in docs/research/trending-1005/prereg.md before any run.
export const meta = {
  id: "tr5-orb-utc-1h-2r-cutoff",
  name: "Opening range breakout, first UTC hour, entries only in the next 2 hours, 2R target, stop at the other edge",
  family: "trending-1005",
  source: "Reddit r/Daytrading 1wdsegp ('no trading after 10:15') and 1w6samx (15-minute ORB); hourly crypto version",
  assetClass: "crypto",
  timeframe: "1h",
  longShort: true,
  params: { rangeBars: 1, lastEntryHour: 2, targetR: 2, flatHour: 23 },
};

// Same range as tr5-orb-utc-1h-eod. Entry only on a close outside the range at 01:00 or 02:00 UTC (the "time cutoff").
// Risk R = range width. Exit on a close at entry +/- 2R (target) or back beyond the opposite edge (stop); flat from 23:00 UTC.
export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const day = Math.floor(b.time / 86400), h = Math.floor(b.time / 3600) % 24;
  if (s.day !== day) { s.day = day; s.hi = -Infinity; s.lo = Infinity; s.n = 0; s.pos = 0; s.done = false; }
  if (h < P.rangeBars) { s.hi = Math.max(s.hi, b.high); s.lo = Math.min(s.lo, b.low); s.n++; return 0; }
  if (s.n !== P.rangeBars || h >= P.flatHour) { s.pos = 0; return 0; }
  const R = s.hi - s.lo;
  if (s.pos === 1 && (b.close < s.lo || b.close >= s.entry + P.targetR * R)) s.pos = 0;
  else if (s.pos === -1 && (b.close > s.hi || b.close <= s.entry - P.targetR * R)) s.pos = 0;
  else if (s.pos === 0 && !s.done && h <= P.lastEntryHour && R > 0) {
    if (b.close > s.hi) { s.pos = 1; s.done = true; s.entry = b.close; } else if (b.close < s.lo) { s.pos = -1; s.done = true; s.entry = b.close; }
  }
  return s.pos;
}
