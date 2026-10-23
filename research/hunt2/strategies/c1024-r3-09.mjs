// c1024 round-3 spec c1024-r3-09 (campaign-1024/prereg-r3.json, frozen before code).
// High downside beta (beta on down-market days only), sleeve vol matched to the EW universe, residual in cash. Monthly, long-only.
// Gate (applied at retest, not here): counts as ahead only if the retest exposure check (e) passes.
export const meta = {
  id: "c1024-r3-09",
  name: "High downside beta, sleeve volatility matched to the EW universe with the residual in cash, exposure check (e) as a hard gate (wide US stocks), monthly",
  family: "equity-factors",
  source: "c1024/r3",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { window: 252, minDown: 60, need: 254, minNames: 50, fraction: 0.2, minHoldings: 10, volWindow: 63 },
};

const ret = (b, k) => b[k].close / b[k - 1].close - 1;
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

export function rank(universe, t, ctx) {
  const { window, minDown, need, minNames, fraction, minHoldings, volWindow } = ctx.params;

  const elig = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length >= need) elig.push({ sym, b, e: b.length - 1 });
  }
  const M = elig.length;
  if (M < minNames) return ew(universe);

  // market m_j = mean over elig of ret(b, e-j), j = 0..window-1
  const m = [];
  for (let j = 0; j < window; j++) {
    let s = 0;
    for (const x of elig) s += ret(x.b, x.e - j);
    m.push(s / M);
  }
  const down = [];
  for (let j = 0; j < window; j++) if (m[j] < 0) down.push(j);
  if (down.length < minDown) return ew(universe);
  const md = mean(down.map((j) => m[j]));
  let vm = 0;
  for (const j of down) vm += (m[j] - md) ** 2;
  if (!(vm > 0)) return ew(universe);

  const rows = [];
  for (const x of elig) {
    const r = down.map((j) => ret(x.b, x.e - j));
    const rd = mean(r);
    let c = 0;
    down.forEach((j, q) => {
      c += (r[q] - rd) * (m[j] - md);
    });
    rows.push({ sym: x.sym, beta: c / vm });
  }

  const N = Math.max(minHoldings, Math.round(fraction * M));
  rows.sort((x, y) => y.beta - x.beta || cmp(x.sym, y.sym));
  const sleeve = rows.slice(0, N);
  const sleeveSyms = new Set(sleeve.map((r) => r.sym));

  // daily equal-weight return series over j = 0..volWindow-1
  const seriesOf = (pred) => {
    const xs = [];
    for (let j = 0; j < volWindow; j++) {
      let s = 0;
      let k = 0;
      for (const x of elig) {
        if (!pred(x.sym)) continue;
        s += ret(x.b, x.e - j);
        k++;
      }
      xs.push(s / k);
    }
    return xs;
  };
  const sigmaS = sampleStd(seriesOf((sym) => sleeveSyms.has(sym)));
  const sigmaM = sampleStd(seriesOf(() => true));
  const w = sigmaS > 0 ? Math.min(1, sigmaM / sigmaS) : 1;

  const out = {};
  for (const r of sleeve) out[r.sym] = w / N;
  return out;
}
