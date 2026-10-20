// trending-1005 (lane m14). Pre-registered in docs/research/trending-1005/prereg.md before any run.
export const meta = {
  id: "tr5-ict-asia-sweep-2r",
  name: "ICT-style Asia range sweep in the London session, close back inside, stop at the sweep wick, 2R target",
  family: "trending-1005",
  source: "Reddit r/Daytrading 1wf36to ('Mark out Asia high/low + London high/low', 'TP at 2R', 'B/E after 1R'); hourly crypto version",
  assetClass: "crypto",
  timeframe: "1h",
  longShort: true,
  params: { asiaEndHour: 7, londonEndHour: 12, flatHour: 20, targetR: 2, breakEvenAt1R: false },
};

// Asia range = high/low of the 00:00-06:00 UTC hourly bars. In London (07:00-11:00 UTC) a bar that trades below the Asia low
// and closes back above it is a sweep: go long, stop = that bar's low, R = close - stop. Mirror for shorts at the Asia high.
// One trade a day. Exits are on closes: stop, target (if targetR > 0), break-even after 1R (if set), and flat from 20:00 UTC.
export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const day = Math.floor(b.time / 86400), h = Math.floor(b.time / 3600) % 24;
  if (s.day !== day) { s.day = day; s.hi = -Infinity; s.lo = Infinity; s.n = 0; s.pos = 0; s.done = false; }
  if (h < P.asiaEndHour) { s.hi = Math.max(s.hi, b.high); s.lo = Math.min(s.lo, b.low); s.n++; return 0; }
  if (s.n !== P.asiaEndHour || h >= P.flatHour) { s.pos = 0; return 0; }
  if (s.pos !== 0) {
    const d = s.pos, gain = d * (b.close - s.entry);
    if (P.breakEvenAt1R && gain >= s.R) s.stop = s.entry;
    if (d * (b.close - s.stop) <= 0 || (P.targetR > 0 && gain >= P.targetR * s.R)) s.pos = 0;
  } else if (!s.done && h < P.londonEndHour) {
    const swept = b.low < s.lo && b.close > s.lo, sweptUp = b.high > s.hi && b.close < s.hi;
    if (swept && !sweptUp && b.close > b.low) { s.pos = 1; s.done = true; s.entry = b.close; s.stop = b.low; s.R = b.close - b.low; }
    else if (sweptUp && !swept && b.high > b.close) { s.pos = -1; s.done = true; s.entry = b.close; s.stop = b.high; s.R = b.high - b.close; }
  }
  return s.pos;
}
