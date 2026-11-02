// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-31). Heavy-volume small-range losers (volume ratio / range ratio), top 8, weekly.
export const meta = {
  id: "c1031-stockxs-31",
  name: "Effort versus result: among large caps down over 5 days, buy the 8 where volume is heavy but the daily range is small, weekly",
  family: "volume",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "weekly",
  longShort: false,
  params: { window: 5, base: 63, top: 8 },
};

const pos = (b, lo, hi) => { for (let k = lo; k <= hi; k++) { const x = b[k]; if (!(x.open > 0 && x.high > 0 && x.low > 0 && x.close > 0)) return false; } return true; };
const byName = (x, y) => (x.sym < y.sym ? -1 : x.sym > y.sym ? 1 : 0);

export function rank(universe, t, ctx) {
  const { window: W, base: BASE, top } = ctx.params;
  const mean = (b, lo, hi, f) => { let s = 0; for (let k = lo; k <= hi; k++) s += f(b[k]); return s / (hi - lo + 1); };
  const vol = (x) => x.volume;
  const rng = (x) => (x.high - x.low) / x.close;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const e = b.length - 1;
    if (e < BASE + 1 || !pos(b, e - BASE, e)) continue;
    if (!(b[e].close / b[e - W].close - 1 < 0)) continue;
    const vr = mean(b, e - W + 1, e, vol) / mean(b, e - BASE, e - W, vol);
    const rr = mean(b, e - W + 1, e, rng) / mean(b, e - BASE, e - W, rng);
    if (!(rr > 0)) continue;
    const s = vr / rr;
    if (Number.isFinite(s)) names.push({ sym, s });
  }
  if (names.length < 3) return {};
  names.sort((x, y) => y.s - x.s || byName(x, y));
  const w = {};
  for (const p of names.slice(0, top)) w[p.sym] = 1 / top;
  return w;
}
