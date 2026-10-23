// c1024 round-3 spec c1024-r3-10 (campaign-1024/prereg-r3.json, frozen before code).
// High downside beta restricted to the top-half dollar-volume names (wide US stocks). Monthly, long-only.
export const meta = {
  id: "c1024-r3-10",
  name: "High downside beta restricted to the top-half dollar-volume names (wide US stocks), monthly",
  family: "equity-factors",
  source: "c1024/r3",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { window: 252, minDown: 60, need: 254, minNames: 50, fraction: 0.2, minHoldings: 10, dvWindow: 63 },
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

export function rank(universe, t, ctx) {
  const { window, minDown, need, minNames, fraction, minHoldings, dvWindow } = ctx.params;

  const elig = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length >= need) elig.push({ sym, b, e: b.length - 1 });
  }
  const M = elig.length;
  if (M < minNames) return ew(universe);

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
    // dollar volume: mean of close * volume over k = e-dvWindow+1..e
    const dvs = [];
    for (let k = x.e - dvWindow + 1; k <= x.e; k++) dvs.push(x.b[k].close * x.b[k].volume);
    rows.push({ sym: x.sym, beta: c / vm, dv: mean(dvs) });
  }

  const liquidCount = Math.ceil(M / 2);
  const liquid = [...rows].sort((x, y) => y.dv - x.dv || cmp(x.sym, y.sym)).slice(0, liquidCount);
  const N = Math.max(minHoldings, Math.round(fraction * M));
  liquid.sort((x, y) => y.beta - x.beta || cmp(x.sym, y.sym));
  const out = {};
  for (const r of liquid.slice(0, N)) out[r.sym] = 1 / N;
  return out;
}
