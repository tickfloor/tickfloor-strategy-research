// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-12). Asset-class-neutral 12-1 momentum with inverse-volatility weights.
export const meta = {
  id: "c1031-etfxs-12",
  name: "Asset-class-neutral momentum: best 2 equity ETFs, best bond, best commodity by 12-1, inverse-volatility weighted",
  family: "momentum",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  rebalance: "monthly",
  params: { eq: 2, bond: 1, comm: 1, volWindow: 126 },
};

const EQ = ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"];
const BOND = ["TLT", "IEF", "SHY", "LQD", "HYG", "AGG"];
const COMM = ["GLD", "SLV", "USO", "UNG", "DBC"];

const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const sampleSd = (a) => {
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1));
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const mom = {};
  const vol = {};
  for (const s of Object.keys(universe)) {
    const b = universe[s];
    if (b.length <= 253) continue;
    const e = b.length - 1;
    mom[s] = b[e - 21].close / b[e - 252].close - 1;
    const r = [];
    for (let k = e - p.volWindow + 1; k <= e; k++) r.push(b[k].close / b[k - 1].close - 1);
    vol[s] = sampleSd(r);
  }
  const best = (cls, n) =>
    cls.filter((s) => mom[s] !== undefined).sort((x, y) => mom[y] - mom[x] || (x < y ? -1 : 1)).slice(0, n);
  const picks = [...best(EQ, p.eq), ...best(BOND, p.bond), ...best(COMM, p.comm)];
  if (picks.length < p.eq + p.bond + p.comm) return {};
  const inv = picks.map((s) => 1 / vol[s]);
  const tot = inv.reduce((a, x) => a + x, 0);
  const w = {};
  picks.forEach((s, i) => { w[s] = inv[i] / tot; });
  return w;
}
