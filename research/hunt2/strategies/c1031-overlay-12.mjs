// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-12). George & Hwang 2004, JF 59(5)
// ponytail: universe name used instead of the spec's identical assets list (harness forbids both keys).
export const meta = {
  id: "c1031-overlay-12",
  name: "52-week-high proximity gate: hold a large cap only while it closes within 15% of its 252-day closing high, weekly",
  family: "drawdown-control",
  source: "c1031/overlay",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "weekly",
  longShort: false,
  warmup: 257,
  params: { peakWin: 252, minRatio: 0.85, need: 252 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L < p.need) continue;
    const e = L - 1;
    let peak = -Infinity;
    for (let k = e - p.peakWin + 1; k <= e; k++) if (b[k].close > peak) peak = b[k].close;
    scored.push({ sym, x: b[e].close >= p.minRatio * peak ? 1 : 0 });
  }
  const N = scored.length;
  if (N === 0) return {};
  const w = {};
  for (const s of scored) w[s.sym] = s.x / N;
  return w;
}
