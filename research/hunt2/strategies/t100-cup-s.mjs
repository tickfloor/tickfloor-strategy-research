// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-cup-s",
  "name": "Cup and handle: 12-35% cup, handle in the upper half, buy the handle-high break, 20-day hold (US stocks 1d x40)",
  "family": "top100-1006",
  "source": "O'Neil / CAN SLIM pattern content; TikTok/YouTube chart-pattern videos",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "w": 120,
    "handle": 10,
    "minDepth": 0.12,
    "maxDepth": 0.35,
    "hold": 20
  },
  "warmup": 129
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  if (s.pos === undefined) s.pos = 0;
  if (s.pos === 1) { s.held++; if (b.close < s.stop || s.held >= P.hold) s.pos = 0; return s.pos; }
  const W = P.w, HB = P.handle;
  if (i < W + HB) return 0;
  let H = -Infinity, hx = 0;
  for (let k = i - W; k <= i - HB - 20; k++) if (bars[k].close > H) { H = bars[k].close; hx = k; }
  let B = Infinity, bx = 0;
  for (let k = hx + 1; k <= i - HB; k++) if (bars[k].close < B) { B = bars[k].close; bx = k; }
  const depth = (H - B) / H;
  if (depth < P.minDepth || depth > P.maxDepth) return 0;
  const span = i - HB - hx, pos = (bx - hx) / span;
  if (pos < 0.3 || pos > 0.7) return 0;
  let rim = -Infinity;
  for (let k = bx; k <= i - HB; k++) if (bars[k].close > rim) rim = bars[k].close;
  if (rim < H * 0.93) return 0;
  let hi = -Infinity, lo = Infinity;
  for (let k = i - HB; k < i; k++) { if (bars[k].high > hi) hi = bars[k].high; if (bars[k].low < lo) lo = bars[k].low; }
  if (hi > H * 1.03 || lo < B + 0.5 * (H - B) || (hi - lo) / hi > 0.15) return 0;
  if (b.close > hi && b.close >= 0.97 * H) { s.pos = 1; s.stop = lo; s.held = 0; }
  return s.pos;
}
