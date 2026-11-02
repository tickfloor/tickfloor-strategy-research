// c1031 round-4 spec c1031-r4-33 (campaign-1031/prereg-r4.json, chunk 3, frozen before code).
// Dual momentum with the 3/6/12-month verdict vote and the SHY hurdle (c1024-r3-16 vote, c1024-r3-18 hurdle). Monthly, long-only.
export const meta = {
  id: "c1031-r4-33__rob2",
  name: "9-ETF dual momentum with the 3/6/12-month vote and the SHY hurdle together, monthly (+25%)",
  family: "trend",
  source: "c1031/r4",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "GLD", "DBC", "VNQ", "AGG", "IEF", "TLT", "SHY"],
  rebalance: "monthly",
  params: {
    horizons: [79, 158, 315],
    need: 317,
    risk: ["QQQ", "DIA", "GLD", "DBC", "VNQ"],
    bonds: ["AGG", "IEF", "TLT"],
    hurdle: "SHY",
    tieHorizon: 158,
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
  const { horizons, need, risk, bonds, hurdle, tieHorizon } = ctx.params;
  const scored = (s) => universe[s] !== undefined && universe[s].length >= need;
  const R = (s, h) => {
    const b = universe[s], e = b.length - 1;
    return b[e].close / b[e - h].close - 1;
  };
  const best = (list, h) => {
    const rows = list.filter(scored).map((s) => [s, R(s, h)]);
    return rows.length ? sortRows(rows, true)[0] : null;
  };
  // verdict at horizon h: best risk asset if it beats the SHY hurdle, else best bond, else none
  const verdict = (h) => {
    const bestRisk = best(risk, h), bestBond = best(bonds, h);
    const hurdleR = scored(hurdle) ? R(hurdle, h) : 0;
    if (bestRisk && bestRisk[1] > hurdleR) return bestRisk[0];
    if (bestBond) return bestBond[0];
    return null;
  };

  const counts = new Map();
  for (const h of horizons) {
    const v = verdict(h);
    if (v) counts.set(v, (counts.get(v) || 0) + 1);
  }
  let pick = null;
  for (const [s, c] of counts) {
    if (c >= 2) {
      pick = s;
      break;
    }
  }
  if (pick === null) pick = verdict(tieHorizon);
  if (pick === null) return ew(universe);
  return { [pick]: 1 };
}
