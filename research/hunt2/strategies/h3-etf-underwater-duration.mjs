// Spec: docs/research/hunt-1003/codex/specs.json (h3-etf-underwater-duration). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-etf-underwater-duration",
  name: "Does choosing ETFs with shorter drawdowns work?",
  family: "drawdown-duration",
  source: "retail trading content: ETF time under water drawdown duration ranking",
  assetClass: "etf",
  timeframe: "1d",
  universe: "ETFS_DAILY",
  rebalance: "monthly",
  longShort: false,
  params: { lookbackBars: 126, topN: 4, warmupBars: 126 },
};

export function rank(universe, t, ctx) {
  const L = ctx.params.lookbackBars;
  const scores = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < L) continue;
    let peak = b[b.length - L].close, run = 0, maxRun = 0;
    for (let k = b.length - L; k < b.length; k++) {
      const c = b[k].close;
      if (c >= peak) { peak = c; run = 0; } else { run++; if (run > maxRun) maxRun = run; }
    }
    scores.push([sym, -maxRun]);
  }
  scores.sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1));
  const top = scores.slice(0, ctx.params.topN);
  const w = {};
  for (const [sym] of top) w[sym] = 1 / top.length;
  return w;
}
