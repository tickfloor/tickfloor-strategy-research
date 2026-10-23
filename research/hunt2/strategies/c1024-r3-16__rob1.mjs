// Spec: research/hunt2/campaign-1024/prereg-r3.json (c1024-r3-16). Portfolio rank, monthly, long-only.
export const meta = {
  id: "c1024-r3-16__rob1",
  name: "9-ETF dual momentum with the lookback decided by a 3/6/12-month majority vote (QQQ, DIA, GLD, DBC, VNQ vs AGG, IEF, TLT, SHY), monthly (-25%)",
  family: "trend",
  source: "c1024/r3",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "GLD", "DBC", "VNQ", "AGG", "IEF", "TLT", "SHY"],
  rebalance: "monthly",
  params: { horizons: [47, 95, 189], need: 191, risk: ["QQQ", "DIA", "GLD", "DBC", "VNQ"], safe: ["AGG", "IEF", "TLT", "SHY"], tieHorizon: 95 },
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
  const { horizons, need, risk, safe, tieHorizon } = ctx.params;
  // c1023-r2-24 verdict at one lookback: best risk asset if it beats 0 and the best safe asset, else best safe asset
  const verdict = (h) => {
    const R = (s) => {
      const b = universe[s], e = b.length - 1;
      return b[e].close / b[e - h].close - 1;
    };
    const best = (list) => {
      const rows = list
        .filter((s) => universe[s] !== undefined && universe[s].length >= need)
        .map((s) => [s, R(s)]);
      return rows.length ? sortRows(rows, true)[0] : null;
    };
    const bestRisk = best(risk), bestSafe = best(safe);
    if (bestRisk && bestRisk[1] > 0 && (!bestSafe || bestRisk[1] > bestSafe[1])) return bestRisk[0];
    return bestSafe ? bestSafe[0] : null;
  };
  const votes = horizons.map(verdict);
  const count = {};
  for (const v of votes) if (v) count[v] = (count[v] || 0) + 1;
  const majority = Object.keys(count).find((s) => count[s] >= 2);
  // no majority: the fixed tie horizon's verdict (may be null)
  const pick = majority !== undefined ? majority : votes[horizons.indexOf(tieHorizon)];
  return pick ? { [pick]: 1 } : ew(universe);
}
