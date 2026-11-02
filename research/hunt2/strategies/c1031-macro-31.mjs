// c1031 round-4 macro spec c1031-macro-31 (frozen in campaign-1031/prereg-macro.json).
// Source: Gorton & Rouwenhorst (2006) Facts and fantasies about commodity futures, FAJ 62(2); Bekaert & Wang (2010) Inflation risk and the inflation risk premium, Economic Policy 25(64)

export const meta = {
  "id": "c1031-macro-31",
  "name": "Breakeven breakout: after 10y breakeven inflation makes a 126-day high, hold energy, materials, commodities and gold for 30 bars",
  "family": "macro",
  "source": "c1031/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "XLE",
    "XLB",
    "DBC",
    "GLD"
  ],
  "params": {
    "lookback": 126,
    "hold": 30
  },
  "holdBars": 30
};

// M(id,k) = value known by the close of bar i-k; null when i-k < 0 or no value yet.
const M = (ctx, i, id, k) => (i - k < 0 ? null : ctx.macro(id, i - k));

export function signal(bars, i, ctx) {
  const { lookback } = ctx.params;
  const cur = M(ctx, i, "T10YIE", 0);
  if (cur === null) return 0;
  let mx = -Infinity;
  for (let k = 1; k <= lookback; k++) {
    const v = M(ctx, i, "T10YIE", k);
    if (v === null) return 0;
    if (v > mx) mx = v;
  }
  return cur > mx ? 1 : 0;
}
