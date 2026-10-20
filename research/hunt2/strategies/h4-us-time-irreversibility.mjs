// Spec: docs/research/hunt-1004/codex/specs.json (h4-us-time-irreversibility). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-us-time-irreversibility",
  "name": "Does return time asymmetry identify better stocks?",
  "family": "path-order",
  "source": "retail trading content: time irreversibility lagged third moment stock returns",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "universe": "US_STOCKS_DAILY",
  "rebalance": "monthly",
  "longShort": false,
  "params": {
    "warmupBars": 64,
    "returnWindow": 63,
    "topN": 8
  }
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const n = b.length;
    if (n < p.warmupBars) continue;
    const cl = [];
    let ok = true;
    for (let k = n - p.warmupBars; k < n; k++) {
      const v = b[k].close;
      if (!(Number.isFinite(v) && v > 0)) { ok = false; break; }
      cl.push(v);
    }
    if (!ok) continue;
    const r = [];
    for (let k = 1; k < cl.length; k++) r.push(cl[k] / cl[k - 1] - 1);
    let N = 0, D = 0;
    for (let k = 0; k + 1 < r.length; k++) {
      const a = r[k], c2 = r[k + 1];
      N += a * a * c2 - a * c2 * c2;
      D += Math.abs(a * a * c2) + Math.abs(a * c2 * c2);
    }
    const score = D > 0 && Number.isFinite(N) && Number.isFinite(D) ? N / D : null;
    if (score === null || !Number.isFinite(score)) continue;
    scored.push([sym, score]);
  }
  scored.sort((x, y) => (y[1] - x[1]) || (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0));
  const top = scored.slice(0, Math.min(p.topN, scored.length));
  const w = {};
  for (const [sym] of top) w[sym] = 1 / top.length;
  return w;
}
