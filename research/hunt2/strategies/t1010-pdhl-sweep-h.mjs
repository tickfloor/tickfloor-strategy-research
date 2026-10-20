// tests-1010 (lane l-tests-1010). Pre-registered in docs/research/tests-1010/prereg.md before any run.
export const meta = {
  id: "t1010-pdhl-sweep-h",
  name: "ICT previous-day high/low sweep: fade a wick through yesterday's high/low that closes back inside, hold 12h, crypto 1h x8",
  family: "tests-1010",
  source: "ICT/SMC YouTube 'liquidity sweep of previous day high/low'",
  assetClass: "crypto",
  timeframe: "1h",
  longShort: true,
  holdBars: 12,
  params: { hold: 12 },
};
export function signal(bars, i, ctx) {
  const s = ctx.state, b = bars[i], day = Math.floor(b.time / 86400);
  if (s.day !== day) { s.pdh = s.dh; s.pdl = s.dl; s.day = day; s.dh = -Infinity; s.dl = Infinity; }
  const up = s.pdh !== undefined && b.high > s.pdh && b.close < s.pdh;
  const dn = s.pdl !== undefined && b.low < s.pdl && b.close > s.pdl;
  s.dh = Math.max(s.dh, b.high); s.dl = Math.min(s.dl, b.low);
  if (up && !dn) return -1;
  if (dn && !up) return 1;
  return 0;
}
