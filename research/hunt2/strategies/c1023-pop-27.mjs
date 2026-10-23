// c1023 pop chunk 2. Weekly top-5 1-week winners (Jegadeesh 1990 prior, retail top-gainer screens).
export const meta = {
  id: "c1023-pop-27",
  name: "Buy last week's winners: top 5 of 40 large caps by 1-week return, rebalanced weekly",
  family: "momentum",
  source: "c1023/pop",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "weekly",
  params: { lookbackDays: 5, top: 5 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const scores = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < p.lookbackDays + 1) continue;
    scores.push([sym, b[b.length - 1].close / b[b.length - 1 - p.lookbackDays].close - 1]);
  }
  scores.sort((x, y) => (y[1] - x[1]) || (x[0] < y[0] ? -1 : 1));
  const w = {};
  const top = scores.slice(0, p.top);
  for (const [sym] of top) w[sym] = 1 / p.top;
  return w;
}
