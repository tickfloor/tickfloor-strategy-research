// Spec: docs/research/hunt-1004/codex/specs.json (h4-us-volume-move-concentration). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-us-volume-move-concentration",
  "name": "Does volume spread across small and large moves improve stock selection?",
  "family": "volume-concentration",
  "source": "retail trading content: volume concentration across absolute return size buckets stock portfolio",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "universe": "US_STOCKS_DAILY",
  "rebalance": "monthly",
  "longShort": false,
  "params": {
    "warmupBars": 64,
    "window": 63,
    "buckets": 5,
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
    const rec = [];
    for (let k = 1; k < cl.length; k++) {
      const bar = b[n - p.warmupBars + k];
      const vol = bar.volume;
      if (!(Number.isFinite(vol) && vol >= 0)) { ok = false; break; }
      rec.push([Math.abs(cl[k] / cl[k - 1] - 1), cl[k] * vol, k]);
    }
    if (!ok) continue;
    rec.sort((x, y) => (x[0] - y[0]) || (x[2] - y[2]));
    const bv = new Array(p.buckets).fill(0);
    let V = 0;
    for (let j = 0; j < rec.length; j++) { bv[Math.floor(p.buckets * j / rec.length)] += rec[j][1]; V += rec[j][1]; }
    if (!(V > 0)) continue;
    let s = 0;
    for (const x of bv) s += (x / V) * (x / V);
    const score = -s;
    if (score === null || !Number.isFinite(score)) continue;
    scored.push([sym, score]);
  }
  scored.sort((x, y) => (y[1] - x[1]) || (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0));
  const top = scored.slice(0, Math.min(p.topN, scored.length));
  const w = {};
  for (const [sym] of top) w[sym] = 1 / top.length;
  return w;
}
