// Spec: docs/research/hunt-1004/codex/specs.json (h4-us-partial-profit-harvest). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-us-partial-profit-harvest",
  "name": "Does taking half the stock profit position early work?",
  "family": "profit-disposition",
  "source": "retail trading content: sell half after five percent profit stock position harvesting",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "rebalance": "daily",
  "params": {
    "warmupBars": 64,
    "cycleCalls": 21,
    "maxHoldCalls": 20,
    "harvestGain": 0.05,
    "remainingFraction": 0.5
  }
};

export function rank(universe, t, ctx) {
  const P = ctx.params, S = ctx.state;
  if (S.day === undefined) { S.day = -1; S.recs = null; }
  S.day++;
  if (S.day < P.warmupBars - 1) return {};
  const age = (S.day - (P.warmupBars - 1)) % P.cycleCalls;
  const ok = (b, n) => {
    if (b.length < n) return false;
    for (let k = b.length - n; k < b.length; k++) if (!(Number.isFinite(b[k].close) && b[k].close > 0)) return false;
    return true;
  };
  if (age === 0) {
    const names = Object.keys(universe).filter((s) => ok(universe[s], P.warmupBars)).sort();
    if (names.length === 0) { S.recs = null; return {}; }
    S.recs = {};
    for (const s of names) {
      const b = universe[s];
      S.recs[s] = { entry: b[b.length - 1].close, base: 1 / names.length, harvested: false };
    }
  }
  if (age >= P.maxHoldCalls) { S.recs = null; return {}; }
  if (!S.recs) return {};
  const w = {};
  for (const s of Object.keys(S.recs)) {
    const r = S.recs[s];
    const b = universe[s];
    const c = b && b.length ? b[b.length - 1].close : NaN;
    if (!(Number.isFinite(c) && c > 0)) { delete S.recs[s]; continue; }
    if (age > 0 && !r.harvested && c >= (1 + P.harvestGain) * r.entry) r.harvested = true;
    w[s] = r.harvested ? r.base * P.remainingFraction : r.base;
  }
  return w;
}
