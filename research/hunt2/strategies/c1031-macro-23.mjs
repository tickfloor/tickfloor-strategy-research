// c1031 round-4 macro spec c1031-macro-23 (frozen in campaign-1031/prereg-macro.json).
// Source: Weber (2018) JFE 128(3); Lettau & Wachter (2007) JF 62(1)

export const meta = {
  "id": "c1031-macro-23",
  "name": "Yield-peak rollover: after the 10y yield proxy drops 25bp from a recent peak, buy growth equities for 20 bars",
  "family": "macro",
  "source": "c1031/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "QQQ",
    "XLK",
    "XLY"
  ],
  "params": {
    "window": 63,
    "minRange": 0.3,
    "pullback": 0.25,
    "peakWithin": 10,
    "hold": 20
  },
  "holdBars": 20
};

// M(id,k) = value known by the close of bar i-k; null when i-k < 0 or no value yet.
const M = (ctx, i, id, k) => (i - k < 0 ? null : ctx.macro(id, i - k));

// y(k): nominal 10y yield proxy = DFII10 + T10YIE.
const yAt = (ctx, i, k) => {
  const r = M(ctx, i, "DFII10", k);
  const b = M(ctx, i, "T10YIE", k);
  return r === null || b === null ? null : r + b;
};

export function signal(bars, i, ctx) {
  const { window, minRange, pullback, peakWithin } = ctx.params;
  let H = -Infinity;
  let kH = -1;
  let Lo = Infinity;
  let y0 = null;
  for (let k = 0; k < window; k++) {
    const y = yAt(ctx, i, k);
    if (y === null) return 0;
    if (k === 0) y0 = y;
    if (y > H) { H = y; kH = k; }
    if (y < Lo) Lo = y;
  }
  return H - Lo >= minRange && H - y0 >= pullback && kH <= peakWithin ? 1 : 0;
}
