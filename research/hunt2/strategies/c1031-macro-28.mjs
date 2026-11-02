// c1031 round-4 macro spec c1031-macro-28 (frozen in campaign-1031/prereg-macro.json).
// Source: Whaley (2000) J. Portfolio Mgmt 26(3); Bollen & Whaley (2004) Does net buying pressure affect the shape of implied volatility functions?, JF 59(2)

export const meta = {
  "id": "c1031-macro-28",
  "name": "Hedging-demand warning: stand aside for 5 bars when an index rises over 5 days while the VIX also rises more than 10%",
  "family": "volatility",
  "source": "c1031/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "QQQ",
    "DIA",
    "XLK",
    "XLF"
  ],
  "params": {
    "lag": 5,
    "vixRise": 0.1,
    "flatBars": 5
  }
};

// M(id,k) = value known by the close of bar i-k; null when i-k < 0 or no value yet.
const M = (ctx, i, id, k) => (i - k < 0 ? null : ctx.macro(id, i - k));

export function signal(bars, i, ctx) {
  const { lag, vixRise, flatBars } = ctx.params;
  if (ctx.state.flatLeft === undefined) ctx.state.flatLeft = 0;
  if (i < lag) return 0;
  const V0 = M(ctx, i, "VIXCLS", 0);
  const V5 = M(ctx, i, "VIXCLS", lag);
  if (V0 === null || V5 === null) return 0;
  const up = bars[i].close / bars[i - lag].close - 1 > 0;
  if (up && V0 / V5 - 1 > vixRise) ctx.state.flatLeft = flatBars;
  if (ctx.state.flatLeft > 0) {
    ctx.state.flatLeft -= 1;
    return 0;
  }
  return 1;
}
