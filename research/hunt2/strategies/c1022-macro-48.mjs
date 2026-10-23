export const meta = {
  "id": "c1022-macro-48",
  "name": "Accelerating dual momentum (1+3+6 month) across QQQ, DIA, GLD with TLT fallback",
  "family": "momentum",
  "source": "c1022/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "QQQ",
    "DIA",
    "GLD",
    "TLT"
  ],
  "rebalance": "monthly",
  "proxyFor": {
    "SPY": "QQQ"
  },
  "params": {}
};

// c1022 macro chunk 3 (spec: campaign-1022/prereg-macro.json, frozen before code). Rule per spec `rule`.
// Accelerating dual momentum (rank mode, monthly) over QQQ/DIA/GLD, TLT fallback.
// FILL (not ready: any of QQQ, DIA, GLD, TLT missing or <127 bars) = equal weight over the four.
const RISK = ["QQQ", "DIA", "GLD"];
const SAFE = "TLT";
const LISTED = [...RISK, SAFE];

function score(b) {
  const L = b.length;
  const r = (k) => b[L - 1].close / b[L - 1 - k].close - 1;
  return r(21) + r(63) + r(126);
}

function basket(universe, syms, total) {
  const present = syms.filter((s) => universe[s]);
  const w = {};
  for (const s of present) w[s] = total / present.length;
  return w;
}

export function rank(universe, t, ctx) {
  if (!LISTED.every((s) => universe[s] && universe[s].length >= 127)) return basket(universe, LISTED, 1);
  let best = null;
  let bs = -Infinity;
  for (const s of RISK) {
    const sc = score(universe[s]);
    if (sc > bs) { bs = sc; best = s; }
  }
  if (bs > 0) return { [best]: 1 };
  return { [SAFE]: 1 };
}
