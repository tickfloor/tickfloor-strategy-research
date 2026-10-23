export const meta = {
  "id": "c1022-macro-47",
  "name": "Keller BAA-lite: 13612W canary with offensive/defensive sleeves",
  "family": "momentum",
  "source": "c1022/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "QQQ",
    "DIA",
    "AGG",
    "XLK",
    "XLY",
    "VNQ",
    "GLD",
    "DBC",
    "SHY",
    "IEF",
    "TLT",
    "LQD"
  ],
  "rebalance": "monthly",
  "proxyFor": {
    "SPY": "QQQ"
  },
  "params": {
    "topN": 3
  }
};

// c1022 macro chunk 3 (spec: campaign-1022/prereg-macro.json, frozen before code). Rule per spec `rule`.
// Keller BAA-lite (rank mode, monthly). Canary QQQ/DIA/AGG; any m<=0 -> defensive top 3, else offensive top 3, 1/3 each.
// FILL (not ready: any of the 12 listed symbols missing or <253 bars) = equal weight over all 12.
const CANARY = ["QQQ", "DIA", "AGG"];
const DEFENSIVE = ["DBC", "SHY", "IEF", "TLT", "LQD", "AGG"];
const OFFENSIVE = ["QQQ", "DIA", "XLK", "XLY", "VNQ", "GLD"];
const ALL = ["QQQ", "DIA", "AGG", "XLK", "XLY", "VNQ", "GLD", "DBC", "SHY", "IEF", "TLT", "LQD"];

function mom(b) {
  const L = b.length;
  const r = (k) => b[L - 1].close / b[L - 1 - k].close - 1;
  return (12 * r(21) + 4 * r(63) + 2 * r(126) + r(252)) / 19;
}

function basket(universe, syms, total) {
  const present = syms.filter((s) => universe[s]);
  const w = {};
  for (const s of present) w[s] = total / present.length;
  return w;
}

export function rank(universe, t, ctx) {
  if (!ALL.every((s) => universe[s] && universe[s].length >= 253)) return basket(universe, ALL, 1);
  const m = {};
  for (const s of ALL) m[s] = mom(universe[s]);
  const pick = (list) => {
    const top = list.filter((x) => universe[x]).sort((x, y) => m[y] - m[x]).slice(0, 3);
    const w = {};
    for (const s of top) w[s] = 1 / 3;
    return w;
  };
  if (CANARY.some((s) => m[s] <= 0)) return pick(DEFENSIVE);
  return pick(OFFENSIVE);
}
