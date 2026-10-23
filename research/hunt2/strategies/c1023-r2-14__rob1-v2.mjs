// Spec: research/hunt2/campaign-1023/prereg-r2.json (c1023-r2-14). Portfolio rank, monthly, long-only.
// Idea: r27-wide-trend-chop with the reversal leg replaced by equal weight; momentum leg unchanged.

export const meta = {
  id: "c1023-r2-14__rob1-v2",
  name: "Top-decile 12-1 momentum held only while the EW universe is above its 200-day SMA, equal weight otherwise (wide US stocks) (-25%)",
  family: "momentum",
  source: "c1023/r2",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { form: 189, skip: 21, fraction: 0.1, minHoldings: 10, need: 202, minNames: 50, smaDays: 200 },
};

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}
const mean = (xs) => xs.reduce((p, q) => p + q, 0) / xs.length;
// rows: [sym, value]; ties broken by symbol name ascending
function sortRows(rows, desc) {
  return rows.sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}
const topN = (rows, n) => sortRows(rows, true).slice(0, n).map((x) => x[0]);
const retAt = (b, k) => b[k].close / b[k - 1].close - 1;

export function rank(universe, t, ctx) {
  const { form, skip, fraction, minHoldings, need, minNames, smaDays } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length >= need);
  const M = elig.length;
  if (M < minNames) return ew(universe);

  // EW index over elig, Lv starts at 1 on bar e-smaDays; levels[] holds Lv for k = e-smaDays+1..e
  let lv = 1;
  const levels = [];
  for (let d = smaDays - 1; d >= 0; d--) {
    lv *= 1 + mean(elig.map((s) => { const b = universe[s]; return retAt(b, b.length - 1 - d); }));
    levels.push(lv);
  }
  const on = levels[levels.length - 1] >= mean(levels);

  if (on) {
    const N = Math.max(minHoldings, Math.round(fraction * M));
    const rows = elig.map((s) => {
      const b = universe[s], e = b.length - 1;
      return [s, b[e - skip].close / b[e - form].close - 1];
    });
    const out = {};
    for (const s of topN(rows, N)) out[s] = 1 / N;
    return out;
  }
  const out = {};
  for (const s of elig) out[s] = 1 / M;
  return out;
}
