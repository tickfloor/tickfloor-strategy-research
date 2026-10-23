// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-55). Portfolio rank mode, monthly sectors.
// Blitz, Huij & Martens 2011: rank sectors by Sharpe of market-residual returns over months 12-2.

export const meta = {
  id: "c1022-acad-55",
  name: "Sector residual momentum: rank sectors by the Sharpe of their market-residual return over months 12-2 (Blitz-Huij-Martens)",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  rebalance: "monthly",
  longShort: false,
  params: { regBars: 252, skip: 21, topN: 3 },
};

// daily return m bars back from the latest bar (m = 0 is t)
const retAt = (b, m) => b[b.length - 1 - m].close / b[b.length - 2 - m].close - 1;

export function rank(universe, t, ctx) {
  const { regBars, skip, topN } = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length > regBars + 1);
  if (syms.length < topN) return {};

  const mkt = [];
  for (let m = 0; m < regBars; m++) {
    let s = 0;
    for (const sym of syms) s += retAt(universe[sym], m);
    mkt.push(s / syms.length);
  }
  const xMean = mkt.reduce((a, v) => a + v, 0) / regBars;

  const scores = [];
  for (const sym of syms) {
    const b = universe[sym];
    const y = [];
    for (let m = 0; m < regBars; m++) y.push(retAt(b, m));
    const yMean = y.reduce((a, v) => a + v, 0) / regBars;
    let sxy = 0, sxx = 0;
    for (let m = 0; m < regBars; m++) {
      sxy += (mkt[m] - xMean) * (y[m] - yMean);
      sxx += (mkt[m] - xMean) ** 2;
    }
    const beta = sxy / sxx;
    const alpha = yMean - beta * xMean;
    // residuals over k = t-251..t-21 (m = 21..251)
    const e = [];
    for (let m = skip; m < regBars; m++) e.push(y[m] - alpha - beta * mkt[m]);
    const eMean = e.reduce((a, v) => a + v, 0) / e.length;
    const eStd = Math.sqrt(e.reduce((a, v) => a + (v - eMean) ** 2, 0) / (e.length - 1));
    scores.push({ sym, score: eMean / eStd });
  }
  scores.sort((a, c) => c.score - a.score);
  const w = {};
  for (const x of scores.slice(0, topN)) w[x.sym] = 1 / topN;
  return w;
}
