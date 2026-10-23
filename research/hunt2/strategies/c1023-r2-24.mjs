// Spec: research/hunt2/campaign-1023/prereg-r2.json (c1023-r2-24). Portfolio rank, monthly, long-only.
// Idea: r27-qqq-gld-agg-dualmom extended to nine ETFs: absolute plus relative momentum, one holding.

export const meta = {
  id: "c1023-r2-24",
  name: "Dual momentum across five risk ETFs (QQQ, DIA, GLD, DBC, VNQ) versus four safe ETFs (AGG, IEF, TLT, SHY), monthly",
  family: "trend",
  source: "c1023/r2",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "GLD", "DBC", "VNQ", "AGG", "IEF", "TLT", "SHY"],
  rebalance: "monthly",
  params: { lookback: 252, need: 254, risk: ["QQQ", "DIA", "GLD", "DBC", "VNQ"], safe: ["AGG", "IEF", "TLT", "SHY"] },
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
  const { lookback, need, risk, safe } = ctx.params;
  const R = (s) => {
    const b = universe[s], e = b.length - 1;
    return b[e].close / b[e - lookback].close - 1;
  };
  // best scored symbol of a list as [sym, R], or null
  const best = (list) => {
    const rows = list
      .filter((s) => universe[s] !== undefined && universe[s].length >= need)
      .map((s) => [s, R(s)]);
    return rows.length ? sortRows(rows, true)[0] : null;
  };
  const bestRisk = best(risk), bestSafe = best(safe);
  if (bestRisk && bestRisk[1] > 0 && (!bestSafe || bestRisk[1] > bestSafe[1])) return { [bestRisk[0]]: 1 };
  if (bestSafe) return { [bestSafe[0]]: 1 };
  return ew(universe);
}
