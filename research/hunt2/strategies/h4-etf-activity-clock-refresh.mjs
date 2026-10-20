// Spec: docs/research/hunt-1004/codex/specs.json (h4-etf-activity-clock-refresh). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-etf-activity-clock-refresh",
  "name": "Does market activity give a better ETF rebalance clock?",
  "family": "rebalance-control",
  "source": "retail trading content: quadratic variation business time ETF portfolio rebalance clock",
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
    "activityBudget": 0.001,
    "maxCallsBetweenRefresh": 21,
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
  if (!rows) { S.inc = null; return {}; }
  const order = rows.map((r) => r[0]);
  const cand = order.slice(0, P.topN);
  if (!S.inc) { S.inc = cand; S.clock = 0; S.calls = 0; return eq(S.inc, P); }
  let sq = 0;
  for (const s of order) {
    const b = universe[s];
    const r = b[b.length - 1].close / b[b.length - 2].close - 1;
    sq += r * r;
  }
  S.clock += sq / order.length;
  S.calls++;
  const gone = S.inc.some((s) => !order.includes(s));
  if (gone || S.clock >= P.activityBudget || S.calls >= P.maxCallsBetweenRefresh) {
    S.inc = cand; S.clock = 0; S.calls = 0;
  }
  return eq(S.inc, P);
}
