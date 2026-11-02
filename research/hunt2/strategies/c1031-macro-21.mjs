export const meta = {
  "id": "c1031-macro-21",
  "name": "Real-yield breakout: after the 10y TIPS yield makes a 126-day low, hold Treasuries, gold and utilities for 30 bars",
  "family": "macro",
  "source": "c1031/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "TLT",
    "GLD",
    "XLU"
  ],
  "holdBars": 30,
  "params": {
    "lookback": 126,
    "hold": 30
  }
};

// M(ctx, id, i, k): macro value known by the close of bar i-k, or null when there is no bar that far back.
function M(ctx, id, i, k) {
  return i - k < 0 ? null : ctx.macro(id, i - k);
}

export function signal(bars, i, ctx) {
  const n = ctx.params.lookback;
  const v0 = M(ctx, "DFII10", i, 0);
  if (v0 === null) return 0;
  let min = Infinity;
  for (let k = 1; k <= n; k++) {
    const v = M(ctx, "DFII10", i, k);
    if (v === null) return 0;
    if (v < min) min = v;
  }
  return v0 < min ? 1 : 0;
}
