// Spec: docs/research/hunt-1003/codex/specs.json (h3-etf-tail-ratio). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-etf-tail-ratio",
  name: "Does choosing ETFs by their return tail ratio work?",
  family: "return-tail-selection",
  source: "retail trading content: tail ratio ETF selection 95th percentile 5th percentile",
  assetClass: "etf",
  timeframe: "1d",
  universe: "ETFS_DAILY",
  rebalance: "monthly",
  longShort: false,
  params: { returnWindow: 126, upperQuantile: 0.95, lowerQuantile: 0.05, topN: 4, warmupBars: 127 },
};

export function rank(universe, t, ctx) {
  const P = ctx.params, W = P.returnWindow;
  const scores = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < W + 1) continue;
    const r = [];
    for (let k = b.length - W; k < b.length; k++) r.push(b[k].close / b[k - 1].close - 1);
    r.sort((x, y) => x - y);
    const q05 = r[Math.floor((W - 1) * P.lowerQuantile)], q95 = r[Math.floor((W - 1) * P.upperQuantile)];
    if (q05 < 0 && q95 > 0) scores.push([sym, q95 / Math.abs(q05)]);
  }
  scores.sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1));
  const top = scores.slice(0, P.topN);
  const w = {};
  for (const [sym] of top) w[sym] = 1 / top.length;
  return w;
}
