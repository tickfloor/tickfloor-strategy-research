// c1031 round-4 spec c1031-r4-31 (campaign-1031/prereg-r4.json, frozen before code).
// Second 9-ETF set: 63/126/252-day verdicts with the SHY hurdle; hold the symbol named by at least two verdicts,
// else the 6-month verdict. Monthly, long-only.
export const meta = {
  id: "c1031-r4-31__rob2",
  name: "Second 9-ETF set with the 3/6/12-month vote and the SHY hurdle together, monthly (+25%)",
  family: "trend",
  source: "c1031/r4",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLV", "XLE", "GLD", "VNQ", "AGG", "IEF", "TLT", "SHY"],
  rebalance: "monthly",
  params: {
    horizons: [79, 158, 315],
    need: 317,
    risk: ["XLK", "XLV", "XLE", "GLD", "VNQ"],
    bonds: ["AGG", "IEF", "TLT"],
    hurdle: "SHY",
    tieHorizon: 158,
  },
};

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

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
  const { horizons, need, risk, bonds, hurdle, tieHorizon } = ctx.params;
  const scored = (s) => universe[s] !== undefined && universe[s].length >= need;
  const R = (s, h) => {
    const b = universe[s], e = b.length - 1;
    return b[e].close / b[e - h].close - 1;
  };
  const best = (list, h) => {
    const rows = list.filter(scored).map((s) => [s, R(s, h)]);
    return rows.length ? sortDesc(rows)[0] : null;
  };

  const verdicts = new Map();
  for (const h of horizons) {
    const bestRisk = best(risk, h);
    const bestBond = best(bonds, h);
    const hurdleR = scored(hurdle) ? R(hurdle, h) : 0;
    let v = null;
    if (bestRisk && bestRisk[1] > hurdleR) v = bestRisk[0];
    else if (bestBond) v = bestBond[0];
    verdicts.set(h, v);
  }

  const counts = new Map();
  for (const v of verdicts.values()) if (v !== null) counts.set(v, (counts.get(v) || 0) + 1);
  let pick = null;
  for (const [s, c] of counts) if (c >= 2) pick = s;
  if (pick === null) pick = verdicts.get(tieHorizon);
  if (pick === null) return ew(universe);
  return { [pick]: 1 };
}
