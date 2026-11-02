// c1031 round-4 spec c1031-r4-30 (campaign-1031/prereg-r4.json, chunk 3, frozen before code).
// Dual momentum (c1024-r3-18 structure) on a second 9-ETF set: risk XLK XLV XLE GLD VNQ, bonds AGG IEF TLT, hurdle SHY. Monthly, long-only.
export const meta = {
  id: "c1031-r4-30__rob2",
  name: "Second 9-ETF dual momentum: XLK, XLV, XLE, GLD, VNQ vs AGG, IEF, TLT with the SHY hurdle, monthly (+25%)",
  family: "trend",
  source: "c1031/r4",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLV", "XLE", "GLD", "VNQ", "AGG", "IEF", "TLT", "SHY"],
  rebalance: "monthly",
  params: {
    lookback: 315,
    need: 317,
    risk: ["XLK", "XLV", "XLE", "GLD", "VNQ"],
    bonds: ["AGG", "IEF", "TLT"],
    hurdle: "SHY",
  },
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

export function rank(universe, t, ctx) {
  const { lookback, need, risk, bonds, hurdle } = ctx.params;
  const scored = (s) => universe[s] !== undefined && universe[s].length >= need;
  const R = (s) => {
    const b = universe[s], e = b.length - 1;
    return b[e].close / b[e - lookback].close - 1;
  };
  const best = (list) => {
    const rows = list.filter(scored).map((s) => [s, R(s)]);
    return rows.length ? sortRows(rows, true)[0] : null;
  };
  const bestRisk = best(risk), bestBond = best(bonds);
  const hurdleR = scored(hurdle) ? R(hurdle) : 0;
  if (bestRisk && bestRisk[1] > hurdleR) return { [bestRisk[0]]: 1 };
  if (bestBond) return { [bestBond[0]]: 1 };
  return ew(universe);
}
