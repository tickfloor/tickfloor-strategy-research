// Spec: research/hunt2/campaign-1024/prereg-r3.json (c1024-r3-17). Portfolio rank, monthly, long-only.
export const meta = {
  id: "c1024-r3-17__rob2",
  name: "9-ETF dual momentum with a 20% volatility-managed overlay on the risk holding, remainder in the best safe ETF, monthly (+25%)",
  family: "trend",
  source: "c1024/r3",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "GLD", "DBC", "VNQ", "AGG", "IEF", "TLT", "SHY"],
  rebalance: "monthly",
  params: { lookback: 315, need: 317, risk: ["QQQ", "DIA", "GLD", "DBC", "VNQ"], safe: ["AGG", "IEF", "TLT", "SHY"], volWindow: 21, targetVar: 0.04 },
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

export function rank(universe, t, ctx) {
  const { lookback, need, risk, safe, volWindow, targetVar } = ctx.params;
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
  const bestRisk = best(risk), bestSafe = best(safe);
  if (bestRisk && bestRisk[1] > 0 && (!bestSafe || bestRisk[1] > bestSafe[1])) {
    const sym = bestRisk[0];
    const b = universe[sym], e = b.length - 1;
    const r = [];
    for (let j = 0; j < volWindow; j++) r.push(retAt(b, e - j));
    const v = sampleStd(r) ** 2 * 252;
    const w = v > 0 ? Math.min(1, targetVar / v) : 1;
    const out = { [sym]: w };
    if (bestSafe && w < 1) out[bestSafe[0]] = 1 - w;
    return out;
  }
  if (bestSafe) return { [bestSafe[0]]: 1 };
  return ew(universe);
}
