export const meta = {
  "id": "c1022-macro-45__rob2",
  "name": "Defensive sectors instead of cash when the index loses its 200d (+25%)",
  "family": "trend",
  "source": "c1022/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "QQQ",
    "XLP",
    "XLU",
    "XLV"
  ],
  "rebalance": "weekly",
  "proxyFor": {
    "SPY": "QQQ"
  },
  "params": {
    "sma": 250
  }
};

// c1022 macro chunk 3 (spec: campaign-1022/prereg-macro.json, frozen before code). Rule per spec `rule`.
// Rank-mode weekly: QQQ above SMA200 -> QQQ 1.0, else XLP/XLU/XLV equal.
// Interpretation: FILL (not ready) = equal weight over QQQ, XLP, XLU, XLV (all listed, all holdable).
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

const DEF = ["XLP", "XLU", "XLV"];

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const listed = ["QQQ", ...DEF];
  if (!listed.every((s) => universe[s]) || universe.QQQ.length < p.sma) return basket(universe, listed, 1);
  const q = universe.QQQ;
  if (q[q.length - 1].close > smaClose(q, p.sma)) return { QQQ: 1 };
  return basket(universe, DEF, 1);
}
