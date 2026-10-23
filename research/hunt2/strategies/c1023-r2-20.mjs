// Spec: research/hunt2/campaign-1023/prereg-r2.json (c1023-r2-20). Portfolio rank, weekly, long-only.
// Idea: s29-us-vix-beta re-measured weekly: lowest VIX-innovation beta, 8 names, weekly rebalance.

export const meta = {
  id: "c1023-r2-20",
  name: "Lowest VIX-beta stocks from weekly innovations, weekly rebalance (40 large caps)",
  family: "volatility",
  source: "c1023/r2",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "weekly",
  params: { weeks: 52, top: 8, maxHist: 60 },
};

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}
const fin = (x) => typeof x === "number" && Number.isFinite(x);
const mean = (xs) => xs.reduce((p, q) => p + q, 0) / xs.length;

export function rank(universe, t, ctx) {
  const { weeks, top, maxHist } = ctx.params;
  if (ctx.state.hist === undefined) ctx.state.hist = [];
  const close = {};
  for (const s of Object.keys(universe)) {
    const b = universe[s];
    close[s] = b[b.length - 1].close;
  }
  ctx.state.hist.push({ v: ctx.macro("VIX"), close });
  while (ctx.state.hist.length > maxHist) ctx.state.hist.shift();
  const H = ctx.state.hist;
  if (H.length < weeks + 1) return {};

  // last `weeks` consecutive pairs (entries start..end); pair j uses entries j-1 and j
  const start = H.length - weeks - 1;
  const scored = [];
  for (const s of Object.keys(universe)) {
    const xs = [], ys = [];
    for (let j = start + 1; j < H.length; j++) {
      const a = H[j - 1], c = H[j];
      if (!fin(a.v) || !fin(c.v)) continue;
      if (!fin(a.close[s]) || !fin(c.close[s])) continue;
      xs.push(c.v - a.v);
      ys.push(c.close[s] / a.close[s] - 1);
    }
    if (xs.length !== weeks) continue;
    const mx = mean(xs), my = mean(ys);
    let sxy = 0, sxx = 0;
    for (let i = 0; i < xs.length; i++) {
      sxy += (xs[i] - mx) * (ys[i] - my);
      sxx += (xs[i] - mx) ** 2;
    }
    if (!(sxx > 0)) continue;
    const beta = sxy / sxx;
    if (fin(beta)) scored.push([s, beta]);
  }
  if (scored.length < top) return {};
  scored.sort((a, b) => (a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const out = {};
  for (const [s] of scored.slice(0, top)) out[s] = 1 / top;
  return out;
}
