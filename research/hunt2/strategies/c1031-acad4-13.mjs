// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-13). Lottery/idiosyncratic-volatility/skew composite, lowest 20% long, monthly
export const meta = {
  id: "c1031-acad4-13",
  name: "Idiosyncratic vol, skew and MAX composite: long the lowest 20% of wide US stocks, monthly",
  family: "volatility",
  source: "c1031/acad4",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  longShort: false,
  params: { maxWin: 21, regWin: 63, bottomFrac: 0.2 },
};

const sampleStd = (a, mu) => Math.sqrt(a.reduce((s, x) => s + (x - mu) * (x - mu), 0) / (a.length - 1));
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;

// ponytail: percentile rank by full sort, fine for <=171 names
function pctRanks(items) {
  const sorted = [...items].sort((x, y) => x.v - y.v || (x.sym < y.sym ? -1 : 1));
  const out = new Map();
  sorted.forEach((it, pos) => out.set(it.sym, pos / (sorted.length - 1)));
  return out;
}

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const W = p.regWin;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L < W + 1) continue;
    // ret at offset o back from the rebalance-day close: o=0 is the latest return
    const rets = [];
    for (let o = 0; o < W; o++) rets.push(b[L - 1 - o].close / b[L - 2 - o].close - 1);
    names.push({ sym, rets, L });
  }
  const N = names.length;
  const k = Math.floor(p.bottomFrac * N);
  if (N < 5 || k < 3) return {};

  const rm = [];
  for (let o = 0; o < W; o++) rm.push(names.reduce((s, n) => s + n.rets[o], 0) / N);
  const mx = mean(rm);

  for (const n of names) {
    const my = mean(n.rets);
    let sxy = 0, sxx = 0;
    for (let o = 0; o < W; o++) { sxy += (rm[o] - mx) * (n.rets[o] - my); sxx += (rm[o] - mx) ** 2; }
    const beta = sxy / sxx;
    const alpha = my - beta * mx;
    const u = n.rets.map((y, o) => y - alpha - beta * rm[o]);
    const mu = mean(u);
    const sd = sampleStd(u, mu);
    const popSd = Math.sqrt(u.reduce((s, x) => s + (x - mu) ** 2, 0) / u.length);
    n.ivol = sd;
    n.iskew = u.reduce((s, x) => s + (x - mu) ** 3, 0) / u.length / popSd ** 3;
    n.max = Math.max(...n.rets.slice(0, p.maxWin));
  }

  const pMax = pctRanks(names.map((n) => ({ sym: n.sym, v: n.max })));
  const pIvol = pctRanks(names.map((n) => ({ sym: n.sym, v: n.ivol })));
  const pSkew = pctRanks(names.map((n) => ({ sym: n.sym, v: n.iskew })));
  const comp = names.map((n) => ({ sym: n.sym, v: (pMax.get(n.sym) + pIvol.get(n.sym) + pSkew.get(n.sym)) / 3 }));
  comp.sort((x, y) => x.v - y.v || (x.sym < y.sym ? -1 : 1));
  const w = {};
  for (const c of comp.slice(0, k)) w[c.sym] = 1 / k;
  return w;
}
