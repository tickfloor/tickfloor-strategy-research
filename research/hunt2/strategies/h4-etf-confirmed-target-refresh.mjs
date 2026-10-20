// Spec: docs/research/hunt-1004/codex/specs.json (h4-etf-confirmed-target-refresh). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-etf-confirmed-target-refresh",
  "name": "Does confirming the whole ETF target portfolio reduce false rotations?",
  "family": "rebalance-control",
  "source": "retail trading content: debounce whole target portfolio five day confirmation ETF rebalancing",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "XLK",
    "XLF",
    "XLE",
    "XLV",
    "XLI",
    "XLP",
    "XLY",
    "XLU",
    "XLB",
    "XLC",
    "VNQ"
  ],
  "longShort": false,
  "rebalance": "daily",
  "params": {
    "warmupBars": 128,
    "returnWindow": 126,
    "topN": 3,
    "confirmationCalls": 5,
    "signalLagBars": 1
  }
};

const lt = (x, y) => (x < y ? -1 : x > y ? 1 : 0);
// ranked = [[sym, score]] descending, ascending-symbol ties; null if fewer than topN qualify
function ranked(universe, P) {
  const rows = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < P.warmupBars) continue;
    let good = true;
    for (let k = b.length - P.warmupBars; k < b.length; k++) if (!(Number.isFinite(b[k].close) && b[k].close > 0)) { good = false; break; }
    if (!good) continue;
    const now = b.length - 1;
    rows.push([sym, b[now - 1].close / b[now - P.returnWindow - 1].close - 1]);
  }
  if (rows.length < P.topN) return null;
  rows.sort((x, y) => y[1] - x[1] || lt(x[0], y[0]));
  return rows;
}
function eq(list, P) {
  const w = {};
  for (const s of list) w[s] = 1 / P.topN;
  return w;
}

export function rank(universe, t, ctx) {
  const P = ctx.params, S = ctx.state;
  const rows = ranked(universe, P);
  if (!rows) { S.inc = null; S.key = null; S.streak = 0; return {}; }
  const order = rows.map((r) => r[0]);
  const cand = order.slice(0, P.topN);
  const key = cand.slice().sort().join(",");
  if (!S.inc) { S.inc = cand; S.key = key; S.streak = 1; return eq(S.inc, P); }
  if (key === S.key) S.streak++; else { S.key = key; S.streak = 1; }
  const gone = S.inc.some((s) => !order.includes(s));
  if (gone || S.streak >= P.confirmationCalls) S.inc = cand;
  return eq(S.inc, P);
}
