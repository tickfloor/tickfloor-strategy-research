export const meta = {
  "id": "c1031-macro-14",
  "name": "Oil collapse relief: after WTI falls 15% in 20 bars, hold consumer, industrial, Dow and Nasdaq ETFs for 40 bars",
  "family": "macro",
  "source": "c1031/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "XLY",
    "XLI",
    "DIA",
    "QQQ"
  ],
  "holdBars": 40,
  "params": {
    "drop": -0.15,
    "lag": 20,
    "hold": 40
  }
};

// M(ctx, id, i, k): macro value known by the close of bar i-k, or null when there is no bar that far back.
function M(ctx, id, i, k) {
  return i - k < 0 ? null : ctx.macro(id, i - k);
}

export function signal(bars, i, ctx) {
  const { drop, lag } = ctx.params;
  const o0 = M(ctx, "DCOILWTICO", i, 0);
  const o20 = M(ctx, "DCOILWTICO", i, lag);
  if (o0 === null || o20 === null || o20 <= 10 || o0 <= 5) return 0;
  return o0 / o20 - 1 <= drop ? 1 : 0;
}
