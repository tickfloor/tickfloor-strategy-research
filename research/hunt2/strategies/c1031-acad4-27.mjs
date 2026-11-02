// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-27). Chen, Roll & Ross 1986, Journal of Business 59(3), 383-403
export const meta = {
  id: "c1031-acad4-27",
  name: "Chen-Roll-Ross macro exposure: long the fifth of stocks with the highest weekly beta to the 10y-2y Treasury term spread changes (wide US stocks)",
  family: "macro",
  source: "c1031/acad4",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "weekly",
  longShort: false,
  params: { weeks: 52, topFrac: 0.2, macro: "T10Y2Y", maxHist: 60 },
};

// OLS slope of y on x (with intercept)
function slope(y, x) {
  const n = x.length;
  const mx = x.reduce((s, v) => s + v, 0) / n;
  const my = y.reduce((s, v) => s + v, 0) / n;
  let sxy = 0, sxx = 0;
  for (let j = 0; j < n; j++) {
    sxy += (x[j] - mx) * (y[j] - my);
    sxx += (x[j] - mx) ** 2;
  }
  return sxx > 0 ? sxy / sxx : NaN;
}

export function rank(universe, t, ctx) {
  const p = ctx.params;
  if (ctx.state.hist === undefined) ctx.state.hist = [];
  const close = {};
  for (const s of Object.keys(universe)) {
    const b = universe[s];
    close[s] = b[b.length - 1].close;
  }
  ctx.state.hist.push({ v: ctx.macro(p.macro), close });
  if (ctx.state.hist.length > p.maxHist) ctx.state.hist.shift();
  const H = ctx.state.hist;
  const need = p.weeks + 1;
  if (H.length < need) return {};
  const first = H.length - need;
  const scored = [];
  for (const s of Object.keys(universe)) {
    const dv = [], r = [];
    for (let j = first + 1; j < H.length; j++) {
      const a = H[j - 1], c = H[j];
      const ca = a.close[s], cc = c.close[s];
      if (!Number.isFinite(a.v) || !Number.isFinite(c.v) || ca === undefined || cc === undefined) break;
      dv.push(c.v - a.v);
      r.push(cc / ca - 1);
    }
    if (dv.length !== p.weeks) continue;
    const beta = slope(r, dv);
    if (Number.isFinite(beta)) scored.push([s, beta]);
  }
  if (scored.length < 3) return {};
  const n = Math.floor(p.topFrac * scored.length);
  if (n < 1) return {};
  scored.sort((u, v) => v[1] - u[1] || (u[0] < v[0] ? -1 : u[0] > v[0] ? 1 : 0));
  const w = {};
  for (const [sym] of scored.slice(0, n)) w[sym] = 1 / n;
  return w;
}
