// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-16). VIX3M/VIX ratio beta of large caps, weekly.
export const meta = {
  id: "c1031-stockxs-16",
  name: "VIX term-structure beta: the 8 large caps with the highest sensitivity to weekly changes in VIX3M over VIX, weekly",
  family: "volatility",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "weekly",
  longShort: false,
  params: { weeks: 52, maxHist: 60, top: 8 },
};

const ok = (x) => Number.isFinite(x) && x > 0;
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;

export function rank(universe, t, ctx) {
  const { weeks, maxHist, top } = ctx.params;
  if (ctx.state.hist === undefined) ctx.state.hist = [];
  const syms = Object.keys(universe).sort();

  const a = ctx.macro("VIX3M");
  const b2 = ctx.macro("VIX");
  const v = a !== null && b2 !== null && Number.isFinite(a) && Number.isFinite(b2) && b2 > 0 ? a / b2 : null;
  const close = {};
  for (const s of syms) close[s] = universe[s][universe[s].length - 1].close;
  ctx.state.hist.push({ v, close });
  if (ctx.state.hist.length > maxHist) ctx.state.hist.shift();

  const H = ctx.state.hist;
  const N = weeks + 1;
  if (H.length < N) return {};
  const win = H.slice(H.length - N);

  // dV_j for j=1..52, only where v is finite at both ends; exactly 52 pairs required
  const dV = [];
  for (let j = 1; j < N; j++) {
    const p = win[j - 1].v, c = win[j].v;
    if (p !== null && c !== null && Number.isFinite(p) && Number.isFinite(c)) dV.push(c - p);
  }
  if (dV.length !== weeks) return {};
  const mdV = mean(dV);
  const sxx = dV.reduce((s, x) => s + (x - mdV) * (x - mdV), 0);

  const scored = [];
  for (const s of syms) {
    const r = [];
    let good = true;
    for (let j = 1; j < N; j++) {
      const p = win[j - 1].close[s], c = win[j].close[s];
      if (!ok(p) || !ok(c)) { good = false; break; }
      r.push(c / p - 1);
    }
    if (!good) continue;
    const mr = mean(r);
    let sxy = 0;
    for (let k = 0; k < dV.length; k++) sxy += (dV[k] - mdV) * (r[k] - mr);
    if (!(sxx > 0)) continue;
    scored.push({ sym: s, beta: sxy / sxx });
  }
  if (scored.length < top) return {};
  scored.sort((x, y) => y.beta - x.beta || (x.sym < y.sym ? -1 : 1));
  const w = {};
  for (const c of scored.slice(0, top)) w[c.sym] = 1 / top;
  return w;
}
