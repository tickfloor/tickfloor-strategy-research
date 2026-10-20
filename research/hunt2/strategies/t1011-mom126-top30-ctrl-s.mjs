// tests-1011 (lane l-tests-1011). Pre-registered in docs/research/tests-1011/prereg.md before any run.
// Dumb control for t1011-minervini-tt-s: rule 8 (126-day return in the top 30%) alone, same eligibility and dates.
export const meta = {
  id: "t1011-mom126-top30-ctrl-s",
  name: "Control: top 30% by 126-day return alone, equal weight monthly, US stocks wide x171",
  family: "tests-1011",
  source: "dumb control for the Minervini Trend Template (is the template anything beyond momentum?)",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  warmup: 252, // amendment 2026-10-11: scored from day 253 of the universe calendar, rule and benchmark alike
  params: { rsBars: 126, rsTop: 0.3, yearBars: 252 },
};
export function rank(universe, t, ctx) {
  const p = ctx.params;
  const elig = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < p.yearBars + 1) continue;
    const L = b.length;
    elig.push([sym, b[L - 1].close / b[L - 1 - p.rsBars].close - 1]);
  }
  if (elig.length < 10) return {};
  const cut = elig.map((e) => e[1]).sort((x, y) => y - x)[Math.ceil(elig.length * p.rsTop) - 1];
  const top = elig.filter((e) => e[1] >= cut);
  const w = {};
  for (const [s] of top) w[s] = 1 / top.length;
  return w;
}
