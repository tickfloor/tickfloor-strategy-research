// Spec: docs/research/hunt-1004/codex/specs.json (h4-etf-one-replacement). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-etf-one-replacement",
  "name": "Does limiting an ETF rotation to one replacement work?",
  "family": "rebalance-control",
  "source": "retail trading content: turnover constrained ETF momentum portfolio one replacement per rebalance",
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
  "rebalance": "weekly",
  "params": {
    "warmupBars": 128,
    "returnWindow": 126,
    "topN": 3,
    "maxReplacementsPerCall": 1,
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
  if (!S.inc) { S.inc = cand; return eq(S.inc, P); }
  let inc = S.inc.filter((s) => order.includes(s));
  const vac = P.topN - inc.length;
  if (vac > P.maxReplacementsPerCall) {
    inc = cand;
  } else if (vac === 1) {
    inc.push(order.find((s) => !inc.includes(s)));
  } else if (vac === 0) {
    const nonInc = order.find((s) => !inc.includes(s));
    let low = inc[0];
    for (const s of inc) if (order.indexOf(s) > order.indexOf(low)) low = s;
    if (nonInc !== undefined && order.indexOf(nonInc) < order.indexOf(low)) inc = inc.map((s) => (s === low ? nonInc : s));
  }
  S.inc = inc;
  return eq(inc, P);
}
