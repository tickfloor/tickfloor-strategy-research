// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-29). Frazzini & Pedersen 2014, JFE 111(1); Baker-Bradley-Wurgler 2011, FAJ 67(1)
// ponytail: universe name used instead of the spec's identical assets list (harness forbids both keys).
export const meta = {
  id: "c1031-overlay-29",
  name: "Beta tilt when the market turns: 40 large caps equal weight, but only the 10 lowest-beta names while their composite is below its 200-day average, weekly",
  family: "trend-filter",
  source: "c1031/overlay",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "weekly",
  longShort: false,
  warmup: 260,
  params: { betaWin: 252, smaWin: 200, nLow: 10, need: 254 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length >= p.need);
  const N = syms.length;
  if (N === 0) return {};
  if (N < 20) {
    const w = {};
    for (const s of syms) w[s] = 1 / N;
    return w;
  }
  // R[s][m] = daily return of s on day e-251+m, m = 0..251 (e = the rebalance-day bar)
  const R = {};
  for (const s of syms) {
    const b = universe[s];
    const e = b.length - 1;
    const r = [];
    for (let k = e - p.betaWin + 1; k <= e; k++) r.push(b[k].close / b[k - 1].close - 1);
    R[s] = r;
  }
  const n = p.betaWin;
  const rc = new Array(n).fill(0);
  for (const s of syms) for (let m = 0; m < n; m++) rc[m] += R[s][m] / N;
  // C[m] = composite level on day e-252+m, C[0] = 1
  const C = new Array(n + 1);
  C[0] = 1;
  for (let m = 0; m < n; m++) C[m + 1] = C[m] * (1 + rc[m]);
  let avg = 0;
  for (let m = n + 1 - p.smaWin; m <= n; m++) avg += C[m];
  avg /= p.smaWin;
  const trendUp = C[n] > avg;
  if (trendUp) {
    const w = {};
    for (const s of syms) w[s] = 1 / N;
    return w;
  }
  const mrc = rc.reduce((a, x) => a + x, 0) / n;
  let varRc = 0;
  for (let m = 0; m < n; m++) varRc += (rc[m] - mrc) * (rc[m] - mrc);
  const betas = syms.map((s) => {
    const mr = R[s].reduce((a, x) => a + x, 0) / n;
    let cov = 0;
    for (let m = 0; m < n; m++) cov += (R[s][m] - mr) * (rc[m] - mrc);
    return { sym: s, beta: cov / varRc };
  });
  betas.sort((a, b) => a.beta - b.beta || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const x of betas.slice(0, p.nLow)) w[x.sym] = 1 / p.nLow;
  return w;
}
