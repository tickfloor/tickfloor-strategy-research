// Spec: docs/research/hunt-1004/codex/specs.json (h4-us-permutation-entropy). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-us-permutation-entropy",
  "name": "Does choosing stocks with orderly return sequences work?",
  "family": "path-order",
  "source": "retail trading content: permutation entropy financial returns stock selection",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "universe": "US_STOCKS_DAILY",
  "rebalance": "monthly",
  "longShort": false,
  "params": {
    "warmupBars": 64,
    "returnWindow": 63,
    "patternLength": 3,
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
    const cnt = {};
    let m = 0;
    for (let k = 0; k + 2 < r.length; k++) {
      const idx = [0, 1, 2].sort((a, c) => (r[k + a] - r[k + c]) || (a - c));
      const key = idx.join("");
      cnt[key] = (cnt[key] || 0) + 1; m++;
    }
    let H = 0;
    for (const key of Object.keys(cnt)) { const q = cnt[key] / m; H -= q * Math.log(q); }
    const score = -(H / Math.log(6));
    if (score === null || !Number.isFinite(score)) continue;
    scored.push([sym, score]);
  }
  scored.sort((x, y) => (y[1] - x[1]) || (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0));
  const top = scored.slice(0, Math.min(p.topN, scored.length));
  const w = {};
  for (const [sym] of top) w[sym] = 1 / top.length;
  return w;
}
