// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-05). Intermediate momentum (Novy-Marx 2012 style), return from 12 to 7 months ago.
// Harness rejects meta with both assets and universe, so the spec's universe 'ETFS_DAILY' is implied by assets.
export const meta = {
  id: "c1031-etfxs-05",
  name: "Intermediate momentum: top 6 of 25 ETFs by the return from 12 to 7 months ago (skips the latest 7 months), monthly",
  family: "momentum",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ",
    "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  rebalance: "monthly",
  longShort: false,
  params: { from: 252, to: 147, top: 6 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length > p.from + 1).sort();
  if (syms.length < 12) return {};
  const sc = syms.map((s) => {
    const b = universe[s];
    const e = b.length - 1;
    return { s, v: b[e - p.to].close / b[e - p.from].close - 1 };
  });
  sc.sort((x, y) => y.v - x.v || (x.s < y.s ? -1 : 1));
  const out = {};
  for (const x of sc.slice(0, p.top)) out[x.s] = 1 / p.top;
  return out;
}
