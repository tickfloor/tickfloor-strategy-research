// trending-1005 amendment (2026-10-06, lane z1). Pre-registered in docs/research/trending-1005/prereg-amendment-2026-10-06.md
// before any run. The no-stop hold the original prereg promised: tr5-ict-asia-sweep-hold kept the wick stop (targetR 0 only
// dropped the target), so it is relabelled "wick stop, no target". Entry is byte-for-byte the archived one, so the only change is the exit.
export const meta = {
  id: "tr5a-ict-asia-sweep-nostop",
  name: "ICT-style Asia range sweep in London, no stop and no target, flat from the 20:00 UTC bar",
  family: "trending-1005",
  source: "Reddit r/Daytrading 1wf36to ('Mark out Asia high/low + London high/low'); exit ablation of tr5-ict-asia-sweep-be, hourly crypto version",
  assetClass: "crypto",
  timeframe: "1h",
  longShort: true,
  params: { asiaEndHour: 7, londonEndHour: 12, flatHour: 20 },
};

// Same entry as tr5-ict-asia-sweep-be (Asia range = 00:00-06:00 bars; in London, bars 07:00-11:00, low below the Asia low and close
// above it goes long, high above the Asia high and close below it goes short, skipped if both). Then hold: no price exit at all.
// The bar that opens at 20:00 UTC returns 0, so the position closes at that bar's close, 21:00 UTC. One trade a day.
export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const day = Math.floor(b.time / 86400), h = Math.floor(b.time / 3600) % 24;
  if (s.day !== day) { s.day = day; s.hi = -Infinity; s.lo = Infinity; s.n = 0; s.pos = 0; s.done = false; }
  if (h < P.asiaEndHour) { s.hi = Math.max(s.hi, b.high); s.lo = Math.min(s.lo, b.low); s.n++; return 0; }
  if (s.n !== P.asiaEndHour || h >= P.flatHour) { s.pos = 0; return 0; }
  if (s.pos === 0 && !s.done && h < P.londonEndHour) {
    const swept = b.low < s.lo && b.close > s.lo, sweptUp = b.high > s.hi && b.close < s.hi;
    if (swept && !sweptUp && b.close > b.low) { s.pos = 1; s.done = true; }
    else if (sweptUp && !swept && b.high > b.close) { s.pos = -1; s.done = true; }
  }
  return s.pos;
}
