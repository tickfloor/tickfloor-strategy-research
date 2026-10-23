export const meta = {
  "id": "c1022-macro-37__rob1",
  "name": "Cross-asset risk breadth: how many risk assets are above their 200d (-25%)",
  "family": "other",
  "source": "c1022/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "QQQ",
    "DIA",
    "HYG",
    "XLY",
    "VNQ",
    "DBC",
    "TLT",
    "IEF"
  ],
  "rebalance": "weekly",
  "params": {
    "sma": 150,
    "minCount": 4
  }
};

// c1022 macro chunk 3 (spec: campaign-1022/prereg-macro.json, frozen before code). Rule per spec `rule`.
// Rank-mode breadth: count of 6 risk assets above SMA200 >= 4 -> QQQ+DIA, else TLT+IEF.
// FILL (not ready) = equal weight across all present listed symbols (DEFS; benchmark-neutral).
function smaClose(b, n) {
  let s = 0;
  for (let k = 0; k < n; k++) s += b[b.length - 1 - k].close;
  return s / n;
}
function basket(universe, syms, total) {
  const present = syms.filter((s) => universe[s]);
  const w = {};
  for (const s of present) w[s] = total / present.length;
  return w;
}

const RISK = ["QQQ", "DIA", "HYG", "XLY", "VNQ", "DBC"];
const LISTED = [...RISK, "TLT", "IEF"];

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const ready = LISTED.every((s) => universe[s]) && RISK.every((s) => universe[s].length >= p.sma);
  if (!ready) return basket(universe, LISTED, 1);
  let n = 0;
  for (const s of RISK) {
    const b = universe[s];
    if (b[b.length - 1].close > smaClose(b, p.sma)) n++;
  }
  return n >= p.minCount ? basket(universe, ["QQQ", "DIA"], 1) : basket(universe, ["TLT", "IEF"], 1);
}
