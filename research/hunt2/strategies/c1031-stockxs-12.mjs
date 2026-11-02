// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-12). 5-day variance-ratio filter, weakest 5-day names, weekly.
export const meta = {
  id: "c1031-stockxs-12",
  name: "Variance-ratio reversal: among large caps whose 5-day variance ratio is below one, buy the 8 with the weakest last 5 days, weekly",
  family: "mean_reversion",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "weekly",
  longShort: false,
  params: { window: 252, q: 5, top: 8 },
};

const ok = (x) => Number.isFinite(x) && x > 0;
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const sampleVar = (a, mu) => a.reduce((s, x) => s + (x - mu) * (x - mu), 0) / (a.length - 1);

export function rank(universe, t, ctx) {
  const { window: W, q, top } = ctx.params;
  const cands = [];
  for (const sym of Object.keys(universe).sort()) {
    const b = universe[sym];
    const e = b.length - 1;
    if (b.length < W + 2) continue;
    let good = true;
    for (let k = e - W; k <= e; k++) if (!ok(b[k].close)) { good = false; break; }
    if (!good) continue;
    const lr = [];
    for (let k = e - W + 1; k <= e; k++) lr.push(Math.log(b[k].close / b[k - 1].close));
    const v1 = sampleVar(lr, mean(lr));
    const sums = [];
    for (let j = q - 1; j < lr.length; j++) {
      let s = 0;
      for (let m = 0; m < q; m++) s += lr[j - m];
      sums.push(s);
    }
    const vq = sampleVar(sums, mean(sums));
    const vr = vq / (q * v1);
    if (!(vr < 1)) continue;
    cands.push({ sym, score: b[e].close / b[e - q].close - 1 });
  }
  cands.sort((x, y) => x.score - y.score || (x.sym < y.sym ? -1 : 1));
  const pick = cands.slice(0, top);
  if (pick.length < 3) return {};
  const w = {};
  for (const c of pick) w[c.sym] = 1 / top;
  return w;
}
