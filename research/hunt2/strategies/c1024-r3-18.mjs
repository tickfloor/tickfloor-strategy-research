// Spec: research/hunt2/campaign-1024/prereg-r3.json (c1024-r3-18). Portfolio rank, monthly, long-only.
export const meta = {
  id: "c1024-r3-18",
  name: "9-ETF dual momentum with the absolute-momentum hurdle set to SHY's 12-month return (textbook GEM), monthly",
  family: "trend",
  source: "c1024/r3",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "GLD", "DBC", "VNQ", "AGG", "IEF", "TLT", "SHY"],
  rebalance: "monthly",
  params: { lookback: 252, need: 254, risk: ["QQQ", "DIA", "GLD", "DBC", "VNQ"], bonds: ["AGG", "IEF", "TLT"], hurdle: "SHY" },
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
  const R = (s) => {
    const b = universe[s], e = b.length - 1;
    return b[e].close / b[e - lookback].close - 1;
  };
  const best = (list) => {
    const rows = list
      .filter((s) => universe[s] !== undefined && universe[s].length >= need)
      .map((s) => [s, R(s)]);
    return rows.length ? sortRows(rows, true)[0] : null;
  };
  const bestRisk = best(risk), bestBond = best(bonds);
  const hurdleR = universe[hurdle] !== undefined && universe[hurdle].length >= need ? R(hurdle) : 0;
  if (bestRisk && bestRisk[1] > hurdleR) return { [bestRisk[0]]: 1 };
  if (bestBond) return { [bestBond[0]]: 1 };
  return ew(universe);
}
