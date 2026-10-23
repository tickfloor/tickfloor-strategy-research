// Spec: research/hunt2/campaign-1024/prereg-r3.json (c1024-r3-14). Portfolio rank, monthly, long-only.
export const meta = {
  id: "c1024-r3-14__rob2",
  name: "12-1 momentum among high-volatility, top-half dollar-volume names with the sleeve volatility-scaled to a 10% tracking target (wide US stocks), monthly (+25%)",
  family: "momentum",
  source: "c1024/r3",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { dvWindow: 63, volBars: 252, highVolFrac: 0.5, form: 315, skip: 21, topFrac: 0.2, spreadWindow: 126, target: 0.1, minNames: 50 },
};

const mean = (xs) => xs.reduce((p, q) => p + q, 0) / xs.length;
const retAt = (b, k) => b[k].close / b[k - 1].close - 1;
function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}
function sampleStd(xs) {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((p, q) => p + (q - m) ** 2, 0) / (xs.length - 1));
}
// rows: [sym, value]; ties broken by symbol name ascending
function sortRows(rows, desc) {
  return rows.sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}
const topN = (rows, n) => sortRows(rows, true).slice(0, n).map((x) => x[0]);

export function rank(universe, t, ctx) {
  const { dvWindow, volBars, highVolFrac, form, skip, topFrac, spreadWindow, target, minNames } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length > 323);
  const N = elig.length;
  if (N < minNames) return ew(universe);

  const dv = elig.map((s) => {
    const b = universe[s], e = b.length - 1;
    let sum = 0;
    for (let k = e - dvWindow + 1; k <= e; k++) sum += b[k].close * b[k].volume;
    return [s, sum / dvWindow];
  });
  const liquid = topN(dv, Math.ceil(N / 2));

  const vol = liquid.map((s) => {
    const b = universe[s], e = b.length - 1;
    const r = [];
    for (let m = 0; m < volBars; m++) r.push(retAt(b, e - m));
    return [s, sampleStd(r)];
  });
  const HV = topN(vol, Math.floor(highVolFrac * liquid.length));

  const k = Math.floor(topFrac * liquid.length);
  if (k < 3) return ew(universe);
  const mom = HV.map((s) => {
    const b = universe[s], e = b.length - 1;
    return [s, b[e - skip].close / b[e - form].close - 1];
  });
  const sleeve = topN(mom, k);

  const spread = [];
  for (let j = 0; j < spreadWindow; j++) {
    const sl = mean(sleeve.map((s) => retAt(universe[s], universe[s].length - 1 - j)));
    const el = mean(elig.map((s) => retAt(universe[s], universe[s].length - 1 - j)));
    spread.push(sl - el);
  }
  const sd = sampleStd(spread) * Math.sqrt(252);
  const w = sd > 0 ? Math.min(1, target / sd) : 1;

  const out = {};
  for (const s of elig) out[s] = (1 - w) / N;
  for (const s of sleeve) out[s] += w / k;
  return out;
}
