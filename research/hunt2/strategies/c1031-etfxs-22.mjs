// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-22)
export const meta = {
  id: "c1031-etfxs-22",
  name: "Unanimous multi-horizon momentum: 5 of 25 ETFs with the best worst-rank across 1, 3, 6 and 12 month returns",
  family: "momentum",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  rebalance: "monthly",
  longShort: false,
  params: { lookbacks: [21, 63, 126, 252], top: 5 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const elig = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length > 253) elig.push({ sym, b, e: b.length - 1, ranks: [] });
  }
  if (elig.length < 12) return {};
  for (const n of p.lookbacks) {
    const order = elig
      .map((s) => ({ s, r: s.b[s.e].close / s.b[s.e - n].close - 1 }))
      .sort((x, y) => y.r - x.r || (x.s.sym < y.s.sym ? -1 : 1));
    order.forEach((x, pos) => x.s.ranks.push(pos + 1));
  }
  for (const s of elig) {
    s.worst = Math.max(...s.ranks);
    s.sum = s.ranks.reduce((a, x) => a + x, 0);
  }
  elig.sort((x, y) => x.worst - y.worst || x.sum - y.sum || (x.sym < y.sym ? -1 : 1));
  const w = {};
  for (const s of elig.slice(0, p.top)) w[s.sym] = 1 / p.top;
  return w;
}
