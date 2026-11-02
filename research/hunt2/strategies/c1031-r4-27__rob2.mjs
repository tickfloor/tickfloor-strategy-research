// c1031 round-4 spec c1031-r4-27 (campaign-1031/prereg-r4.json, frozen before code).
// 9-ETF dual momentum: SHY hurdle plus a 20% volatility overlay on the risk holding, remainder in the best bond. Monthly, long-only.
export const meta = {
  id: "c1031-r4-27__rob2",
  name: "9-ETF dual momentum with the SHY hurdle and the 20% volatility overlay together, remainder in the best bond, monthly (+25%)",
  family: "trend",
  source: "c1031/r4",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "GLD", "DBC", "VNQ", "AGG", "IEF", "TLT", "SHY"],
  rebalance: "monthly",
  params: {
    lookback: 315,
    need: 317,
    risk: ["QQQ", "DIA", "GLD", "DBC", "VNQ"],
    bonds: ["AGG", "IEF", "TLT"],
    hurdle: "SHY",
    volWindow: 21,
    targetVar: 0.04,
  },
};

const retAt = (b, k) => b[k].close / b[k - 1].close - 1;
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const mean = (xs) => xs.reduce((p, q) => p + q, 0) / xs.length;

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

// rows: [sym, value] sorted descending, ties by name ascending
function sortDesc(rows) {
  return rows.slice().sort((a, b) => b[1] - a[1] || cmp(a[0], b[0]));
}

export function rank(universe, t, ctx) {
  const { lookback, need, risk, bonds, hurdle, volWindow, targetVar } = ctx.params;
  const scored = (list) => list.filter((s) => universe[s] !== undefined && universe[s].length >= need);
  const R = (s) => {
    const b = universe[s], e = b.length - 1;
    return b[e].close / b[e - lookback].close - 1;
  };
  const best = (list) => {
    const rows = scored(list).map((s) => [s, R(s)]);
    return rows.length ? sortDesc(rows)[0] : null;
  };
  const bestRisk = best(risk);
  const bestBond = best(bonds);
  const hurdleR = scored([hurdle]).length ? R(hurdle) : 0;

  if (bestRisk && bestRisk[1] > hurdleR) {
    const sym = bestRisk[0];
    const b = universe[sym], e = b.length - 1;
    const r = [];
    for (let j = 0; j < volWindow; j++) r.push(retAt(b, e - j));
    const mu = mean(r);
    const v = (r.reduce((p, x) => p + (x - mu) ** 2, 0) / (r.length - 1)) * 252;
    const w = v > 0 ? Math.min(1, targetVar / v) : 1;
    const out = { [sym]: w };
    if (bestBond) out[bestBond[0]] = 1 - w;
    return out;
  }
  if (bestBond) return { [bestBond[0]]: 1 };
  return ew(universe);
}
