// Spec: docs/research/hunt-1004/codex/specs.json (h4-us-tail-arrival-clustering). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-us-tail-arrival-clustering",
  "name": "Does avoiding clustered shock days improve stock selection?",
  "family": "tail-arrival",
  "source": "retail trading content: extreme return arrival clustering stock selection tail events",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "rebalance": "monthly",
  "params": {
    "warmupBars": 127,
    "returnWindow": 126,
    "tailQuantile": 0.9,
    "topN": 8
  }
};

export function rank(universe, t, ctx) {
  const P = ctx.params;
  const rows = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < P.returnWindow + 1) continue;
    const c = b.slice(b.length - P.returnWindow - 1).map((x) => x.close);
    if (!c.every((x) => Number.isFinite(x) && x > 0)) continue;
    const a = [];
    for (let k = 1; k < c.length; k++) a.push(Math.abs(c[k] / c[k - 1] - 1));
    const q = a.slice().sort((x, y) => x - y)[112];
    const e = a.map((x) => (x >= q ? 1 : 0));
    const n = e.reduce((s, x) => s + x, 0);
    if (n === 0) continue;
    let A = 0;
    for (let k = 1; k < e.length; k++) A += e[k - 1] * e[k];
    const score = -(A / (e.length - 1) - (n / e.length) ** 2);
    if (Number.isFinite(score)) rows.push([sym, score]);
  }
  rows.sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0));
  const top = rows.slice(0, Math.min(P.topN, rows.length));
  const w = {};
  for (const [s] of top) w[s] = 1 / top.length;
  return w;
}
