// Spec: research/hunt2/campaign-1023/prereg-r2.json (c1023-r2-13). Portfolio rank, monthly, long-only.
// Idea: c1022-acad-61 (12-1 momentum inside the high-volatility half) with volatility-scaled sleeve.

export const meta = {
  id: "c1023-r2-13",
  name: "12-1 momentum among high-volatility stocks with the sleeve volatility-scaled to a 10% tracking target (wide US stocks), monthly",
  family: "momentum",
  source: "c1023/r2",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { volBars: 252, highVolFrac: 0.5, form: 252, skip: 21, topFrac: 0.2, spreadWindow: 126, target: 0.1, minNames: 50 },
};

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}
const mean = (xs) => xs.reduce((p, q) => p + q, 0) / xs.length;
function sampleStd(xs) {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((p, q) => p + (q - m) ** 2, 0) / (xs.length - 1));
}
// rows: [sym, value]; ties broken by symbol name ascending
function sortRows(rows, desc) {
  return rows.sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}
const topN = (rows, n) => sortRows(rows, true).slice(0, n).map((x) => x[0]);
const retAt = (b, k) => b[k].close / b[k - 1].close - 1;

export function rank(universe, t, ctx) {
  const { volBars, highVolFrac, form, skip, topFrac, spreadWindow, target, minNames } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length > 260);
  const N = elig.length;
  if (N < minNames) return ew(universe);

  const vols = elig.map((s) => {
    const b = universe[s], e = b.length - 1, r = [];
    for (let m = 0; m < volBars; m++) r.push(retAt(b, e - m));
    return [s, sampleStd(r)];
  });
  const HV = topN(vols, Math.floor(highVolFrac * N));

  const k = Math.floor(topFrac * N);
  if (k < 3) return ew(universe);
  const moms = HV.map((s) => {
    const b = universe[s], e = b.length - 1;
    return [s, b[e - skip].close / b[e - form].close - 1];
  });
  const sleeve = topN(moms, k);

  const spread = [];
  for (let j = 0; j < spreadWindow; j++) {
    const sl = mean(sleeve.map((s) => { const b = universe[s]; return retAt(b, b.length - 1 - j); }));
    const el = mean(elig.map((s) => { const b = universe[s]; return retAt(b, b.length - 1 - j); }));
    spread.push(sl - el);
  }
  const sd = sampleStd(spread) * Math.sqrt(252);
  const w = sd > 0 ? Math.min(1, target / sd) : 1;

  const out = {};
  for (const s of elig) out[s] = (1 - w) / N;
  for (const s of sleeve) out[s] += w / k;
  return out;
}
