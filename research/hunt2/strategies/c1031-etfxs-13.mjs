// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-13). Overnight-return momentum. Disclosure: cached bars are unadjusted, so ex-dividend gaps sit inside the overnight leg (accepted, not corrected).
export const meta = {
  id: "c1031-etfxs-13",
  name: "Overnight-return momentum across 13 equity ETFs: top 4 by 12-1 sum of overnight (close-to-open) log returns",
  family: "momentum",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "QQQ", "DIA"],
  rebalance: "monthly",
  params: { from: 252, skip: 21, top: 4 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const scored = [];
  for (const s of Object.keys(universe)) {
    const b = universe[s];
    if (b.length <= 254) continue;
    const e = b.length - 1;
    let score = 0;
    for (let k = e - p.from + 1; k <= e - p.skip; k++) score += Math.log(b[k].open / b[k - 1].close);
    scored.push([s, score]);
  }
  if (scored.length < 8) return {};
  scored.sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1));
  const w = {};
  for (const [s] of scored.slice(0, p.top)) w[s] = 1 / p.top;
  return w;
}
