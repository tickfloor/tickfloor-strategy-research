// c1031 round-4 macro spec c1031-macro-33 (frozen in campaign-1031/prereg-macro.json).
// Source: Estrella & Hardouvelis (1991) The term structure as a predictor of real economic activity, JF 46(2); Faber (2007) J. Wealth Mgmt 9(4)

export const meta = {
  "id": "c1031-macro-33",
  "name": "Cyclical sector trend gated by the yield-curve sign: XLF, XLI, XLB, XLE and XLY held above their 100-day average only while 2s10s is positive",
  "family": "trend",
  "source": "c1031/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "XLF",
    "XLI",
    "XLB",
    "XLE",
    "XLY"
  ],
  "params": {
    "sma": 100
  }
};

// M(id,k) = value known by the close of bar i-k; null when i-k < 0 or no value yet.
const M = (ctx, i, id, k) => (i - k < 0 ? null : ctx.macro(id, i - k));

export function signal(bars, i, ctx) {
  const { sma } = ctx.params;
  const curve = M(ctx, i, "T10Y2Y", 0);
  if (curve === null) return 0;
  return bars[i].close > ctx.sma("close", sma, i) && curve > 0 ? 1 : 0;
}
