// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-20). Wilder 1978 (ATR); Jegadeesh 1990, JF 45(3)
// ponytail: universe name used instead of the spec's identical assets list (harness forbids both keys).
export const meta = {
  id: "c1031-overlay-20",
  name: "ATR extension trim: a large cap is held at half weight while it closes more than 4 ATR above its 50-day average",
  family: "stop-exit",
  source: "c1031/overlay",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "daily",
  longShort: false,
  params: { smaWin: 50, atrWin: 14, extAtr: 4, trimTo: 0.5, need: 52 },
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
    const sma = sum / p.smaWin;
    let trSum = 0;
    for (let j = e - p.atrWin + 1; j <= e; j++) {
      const pc = b[j - 1].close;
      trSum += Math.max(b[j].high - b[j].low, Math.abs(b[j].high - pc), Math.abs(b[j].low - pc));
    }
    const atr = trSum / p.atrWin;
    scored.push({ sym, x: b[e].close > sma + p.extAtr * atr ? p.trimTo : 1 });
  }
  const N = scored.length;
  if (N === 0) return {};
  const w = {};
  for (const s of scored) w[s.sym] = s.x / N;
  return w;
}
