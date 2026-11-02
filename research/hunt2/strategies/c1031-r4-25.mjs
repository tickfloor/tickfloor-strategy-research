// c1031 round-4 spec c1031-r4-25 (campaign-1031/prereg-r4.json, frozen before code).
// High-volatility, top-half dollar-volume names; momentum vote over 3/6/12-month horizons picks the sleeve; sleeve spread vol-scaled to a 10% target, residual across the eligible universe. Monthly, long-only.
export const meta = {
  id: "c1031-r4-25",
  name: "Vol-scaled momentum among high-volatility, top-half dollar-volume names with the lookback decided by a 3/6/12-month vote (wide US stocks), monthly",
  family: "equity-factors",
  source: "c1031/r4",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { dvWindow: 63, volBars: 252, highVolFrac: 0.5, horizons: [63, 126, 252], skip: 21, tieHorizon: 126, topFrac: 0.2, spreadWindow: 126, target: 0.1, minNames: 50 },
};

const ret = (b, j) => b[j].close / b[j - 1].close - 1;
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

function mean(xs) {
  let m = 0;
  for (const x of xs) m += x;
  return m / xs.length;
}

function sampleStd(xs) {
  const m = mean(xs);
  let s = 0;
  for (const x of xs) s += (x - m) ** 2;
  return Math.sqrt(s / (xs.length - 1));
}

// names sorted by value descending (ties by name ascending), top n
const topNames = (names, val, n) =>
  names.slice().sort((x, y) => val.get(y) - val.get(x) || cmp(x, y)).slice(0, n);

export function rank(universe, t, ctx) {
  const { dvWindow, volBars, highVolFrac, horizons, skip, tieHorizon, topFrac, spreadWindow, target, minNames } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length > 260);
  const N = elig.length;
  if (N < minNames) return ew(universe);
  const E = new Map(elig.map((s) => [s, universe[s].length - 1]));

  const dv = new Map();
  for (const s of elig) {
    const b = universe[s];
    const e = E.get(s);
    let x = 0;
    for (let kk = e - dvWindow + 1; kk <= e; kk++) x += b[kk].close * b[kk].volume;
    dv.set(s, x / dvWindow);
  }
  const liquid = topNames(elig, dv, Math.ceil(N / 2));

  const vol = new Map();
  for (const s of liquid) {
    const b = universe[s];
    const e = E.get(s);
    const r = [];
    for (let m = 0; m < volBars; m++) r.push(ret(b, e - m));
    vol.set(s, sampleStd(r));
  }
  const HV = topNames(liquid, vol, Math.floor(highVolFrac * liquid.length));
  const kN = Math.floor(topFrac * liquid.length);
  if (kN < 3) return ew(universe);

  const momOf = (s, h) => {
    const b = universe[s];
    const e = E.get(s);
    return b[e - skip].close / b[e - h].close - 1;
  };
  const votes = new Map(HV.map((s) => [s, 0]));
  for (const h of horizons) {
    const mh = new Map(HV.map((s) => [s, momOf(s, h)]));
    for (const s of topNames(HV, mh, kN)) votes.set(s, votes.get(s) + 1);
  }
  const m126 = new Map(HV.map((s) => [s, momOf(s, tieHorizon)]));
  const sleeve = HV.slice()
    .sort((x, y) => votes.get(y) - votes.get(x) || m126.get(y) - m126.get(x) || cmp(x, y))
    .slice(0, kN);

  // spread of the sleeve over the eligible mean, daily, j = 0..spreadWindow-1
  const spread = [];
  for (let j = 0; j < spreadWindow; j++) {
    let a = 0;
    for (const s of sleeve) a += ret(universe[s], E.get(s) - j);
    let c = 0;
    for (const s of elig) c += ret(universe[s], E.get(s) - j);
    spread.push(a / sleeve.length - c / N);
  }
  const sd = sampleStd(spread) * Math.sqrt(252);
  const w = sd > 0 ? Math.min(1, target / sd) : 1;

  const out = {};
  for (const s of elig) out[s] = (1 - w) / N;
  for (const s of sleeve) out[s] += w / kN;
  return out;
}
