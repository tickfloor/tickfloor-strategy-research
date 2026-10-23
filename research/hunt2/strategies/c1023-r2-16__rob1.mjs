// Spec: research/hunt2/campaign-1023/prereg-r2.json (c1023-r2-16). Portfolio rank, monthly, long-only.
// Idea: r24b-mom-12-7 restricted to the more liquid half by 63-day dollar volume.

export const meta = {
  id: "c1023-r2-16__rob1",
  name: "12-7 momentum restricted to the top-half dollar-volume names (wide US stocks), monthly (-25%)",
  family: "momentum",
  source: "c1023/r2",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { formationWindow: 189, endpoint: 110, dvWindow: 63, need: 191, minNames: 50, minHoldings: 10, fraction: 0.2 },
};

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}
// rows: [sym, value]; ties broken by symbol name ascending
function sortRows(rows, desc) {
  return rows.sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}
const topN = (rows, n) => sortRows(rows, true).slice(0, n).map((x) => x[0]);

export function rank(universe, t, ctx) {
  const { formationWindow, endpoint, dvWindow, need, minNames, minHoldings, fraction } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length >= need);
  const M = elig.length;
  if (M < minNames) return ew(universe);

  const dv = elig.map((s) => {
    const b = universe[s], e = b.length - 1;
    let sum = 0;
    for (let k = e - dvWindow + 1; k <= e; k++) sum += b[k].close * b[k].volume;
    return [s, sum / dvWindow];
  });
  const liquid = topN(dv, Math.ceil(M / 2));

  const N = Math.max(minHoldings, Math.round(fraction * M));
  const mom = liquid.map((s) => {
    const b = universe[s], e = b.length - 1;
    return [s, b[e - endpoint].close / b[e - formationWindow].close - 1];
  });
  const out = {};
  for (const s of topN(mom, N)) out[s] = 1 / N;
  return out;
}
