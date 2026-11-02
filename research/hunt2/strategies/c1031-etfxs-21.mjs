// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-21)
export const meta = {
  id: "c1031-etfxs-21",
  name: "Relative-price dip in an uptrend: buy the 3 sectors most oversold versus the sector average (60-day z-score) that are above their 200-day SMA, weekly",
  family: "mean_reversion",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  rebalance: "weekly",
  longShort: false,
  params: { window: 60, sma: 200, picks: 3 },
};

const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const sampleStd = (a, mu) => Math.sqrt(a.reduce((s, x) => s + (x - mu) * (x - mu), 0) / (a.length - 1));

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const W = p.window;
  const elig = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length > 260) elig.push({ sym, b, e: b.length - 1 });
  }
  if (elig.length < 8) return {};
  const N = elig.length;
  const meanLr = new Array(W).fill(0);
  for (const s of elig) {
    const start = s.e - (W - 1);
    s.lr = [];
    for (let j = 0; j < W; j++) {
      const lr = Math.log(s.b[start + j].close / s.b[start].close);
      s.lr.push(lr);
      meanLr[j] += lr / N;
    }
  }
  const cands = [];
  for (const s of elig) {
    const rp = s.lr.map((x, j) => x - meanLr[j]);
    const mu = mean(rp);
    const z = (rp[W - 1] - mu) / sampleStd(rp, mu);
    let ma = 0;
    for (let k = s.e - (p.sma - 1); k <= s.e; k++) ma += s.b[k].close;
    ma /= p.sma;
    if (s.b[s.e].close > ma) cands.push({ sym: s.sym, z });
  }
  if (cands.length < p.picks) return {};
  cands.sort((x, y) => x.z - y.z || (x.sym < y.sym ? -1 : 1));
  const w = {};
  for (const c of cands.slice(0, p.picks)) w[c.sym] = 1 / p.picks;
  return w;
}
