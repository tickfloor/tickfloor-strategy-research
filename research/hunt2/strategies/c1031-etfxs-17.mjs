// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-17). Tranched weekly momentum: average of the last four weekly top-5 12-1 portfolios.
export const meta = {
  id: "c1031-etfxs-17",
  name: "Tranched weekly momentum: average of the last four weekly top-5 12-1 portfolios (rebalance-timing-luck fix)",
  family: "momentum",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  rebalance: "weekly",
  params: { tranches: 4, spacing: 5, top: 5 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const out = {};
  for (let j = 0; j < p.tranches; j++) {
    const off = j * p.spacing;
    // ponytail: tranche index is per-symbol bar arithmetic (ETF calendars match); no calendar join.
    const mom = {};
    for (const s of Object.keys(universe)) {
      const b = universe[s];
      const tj = b.length - 1 - off;
      if (tj + 1 <= 253) continue;
      mom[s] = b[tj - 21].close / b[tj - 252].close - 1;
    }
    const names = Object.keys(mom);
    if (names.length < 10) continue;
    names.sort((x, y) => mom[y] - mom[x] || (x < y ? -1 : 1));
    for (const s of names.slice(0, p.top)) out[s] = (out[s] || 0) + 1 / p.top / p.tranches;
  }
  return out;
}
