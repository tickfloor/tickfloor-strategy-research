// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-64). Portfolio rank mode, weekly.
// Gutierrez & Kelley 2008: twelve overlapping one-week cohorts, each formed on a skipped weekly return.

export const meta = {
  id: "c1022-acad-64",
  name: "Weekly-return momentum with a one-week skip: twelve overlapping one-week cohorts (Gutierrez-Kelley)",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "weekly",
  longShort: false,
  params: { formBars: 5, skipWeeks: 1, holdWeeks: 12, topFrac: 0.2 },
};

export function rank(universe, t, ctx) {
  const { formBars, topFrac } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length > 80);
  const w = {};
  // cohorts k = 2..13: tk = t - 5k bars; cohort = top 20% by close[tk]/close[tk-5] - 1
  for (let k = 2; k <= 13; k++) {
    const lag = formBars * k;
    const scores = elig.map((sym) => {
      const b = universe[sym], n = b.length;
      return { sym, ret: b[n - 1 - lag].close / b[n - 1 - lag - formBars].close - 1 };
    });
    const p = Math.floor(topFrac * scores.length);
    if (p < 3) continue; // cash for this cohort
    scores.sort((a, c) => c.ret - a.ret);
    for (const x of scores.slice(0, p)) w[x.sym] = (w[x.sym] || 0) + 1 / 12 / p;
  }
  return w;
}
