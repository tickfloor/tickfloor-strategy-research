// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-20). Halloween beta rotation, monthly.
export const meta = {
  id: "c1031-stockxs-20",
  name: "Halloween beta rotation: highest-beta 10 large caps November to April, lowest-beta 10 May to October, monthly",
  family: "seasonality",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  longShort: false,
  params: { betaWindow: 252, top: 10 },
};

const ok = (x) => Number.isFinite(x) && x > 0;
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;

export function rank(universe, t, ctx) {
  const { betaWindow: W, top } = ctx.params;
  const N = W - 1; // 251 daily returns, k = e-250..e
  const syms = Object.keys(universe).sort();
  const first = universe[Object.keys(universe)[0]];
  const month = new Date(first[first.length - 1].time * 1000).getUTCMonth() + 1;

  const rets = {};
  for (const sym of syms) {
    const b = universe[sym];
    const e = b.length - 1;
    if (b.length < W + 1) continue;
    let good = true;
    for (let k = e - N; k <= e; k++) if (!ok(b[k].close)) { good = false; break; }
    if (!good) continue;
    const r = [];
    for (let k = e - N + 1; k <= e; k++) r.push(b[k].close / b[k - 1].close - 1);
    rets[sym] = r;
  }
  const elig = Object.keys(rets).sort();
  const rm = [];
  for (let i = 0; i < N; i++) rm.push(elig.reduce((s, sym) => s + rets[sym][i], 0) / elig.length);
  const mrm = mean(rm);
  const varm = rm.reduce((s, x) => s + (x - mrm) * (x - mrm), 0);

  const betas = elig.map((sym) => {
    const r = rets[sym];
    const mr = mean(r);
    let cov = 0;
    for (let i = 0; i < N; i++) cov += (r[i] - mr) * (rm[i] - mrm);
    return { sym, beta: cov / varm };
  });
  const highBeta = [11, 12, 1, 2, 3, 4].includes(month);
  if (betas.length < top) return {};
  betas.sort((x, y) => (highBeta ? y.beta - x.beta : x.beta - y.beta) || (x.sym < y.sym ? -1 : 1));
  const w = {};
  for (const n of betas.slice(0, top)) w[n.sym] = 1 / top;
  return w;
}
