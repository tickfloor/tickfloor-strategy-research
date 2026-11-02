// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-13). Faber 2007, JWM 9(4)
// ponytail: universe name used instead of the spec's identical assets list (harness forbids both keys).
export const meta = {
  id: "c1031-overlay-13",
  name: "Faber 10-month rule on single large caps: hold a stock only while it closes above its 210-day average, monthly",
  family: "trend-filter",
  source: "c1031/overlay",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  longShort: false,
  warmup: 231,
  params: { smaWin: 210, need: 210 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L < p.need) continue;
    const e = L - 1;
    let sum = 0;
    for (let k = e - p.smaWin + 1; k <= e; k++) sum += b[k].close;
    scored.push({ sym, x: b[e].close > sum / p.smaWin ? 1 : 0 });
  }
  const N = scored.length;
  if (N === 0) return {};
  const w = {};
  for (const s of scored) w[s.sym] = s.x / N;
  return w;
}
