// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-29)
export const meta = {
  id: "c1031-etfxs-29",
  name: "Variance-ratio trending filter on momentum: 12-1 leaders among the ETFs whose 5-day variance ratio exceeds 1 (trending), monthly",
  family: "trend",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  rebalance: "monthly",
  longShort: false,
  params: { q: 5, window: 252, top: 5 },
};

const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const sampleVar = (a) => {
  const mu = mean(a);
  return a.reduce((s, x) => s + (x - mu) * (x - mu), 0) / (a.length - 1);
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const elig = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length > 258) elig.push({ sym, b, e: b.length - 1 });
  }
  if (elig.length < 12) return {};
  const cands = [];
  for (const s of elig) {
    // d[j] = ln(c(k)/c(k-1)) for k = e-251+j, j = 0..251
    const d = [];
    for (let j = 0; j < p.window; j++) {
      const k = s.e - (p.window - 1) + j;
      d.push(Math.log(s.b[k].close / s.b[k - 1].close));
    }
    // q5 at k = e-247..e is the sum of d(k-4..k), i.e. j = 4..251
    const qs = [];
    for (let j = p.q - 1; j < p.window; j++) {
      let sum = 0;
      for (let m = 0; m < p.q; m++) sum += d[j - m];
      qs.push(sum);
    }
    const vr = sampleVar(qs) / (p.q * sampleVar(d));
    const mom = s.b[s.e - 21].close / s.b[s.e - 252].close - 1;
    s.mom = mom;
    if (vr > 1 && mom > 0) cands.push(s);
  }
  if (cands.length < 2) return {};
  cands.sort((x, y) => y.mom - x.mom || (x.sym < y.sym ? -1 : 1));
  const n = Math.min(p.top, cands.length);
  const w = {};
  for (const s of cands.slice(0, n)) w[s.sym] = 1 / n;
  return w;
}
