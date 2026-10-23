export const meta = {
  "id": "c1022-macro-44",
  "name": "Long-bond trend taken only in disinflation (breakevens not rising)",
  "family": "trend",
  "source": "c1022/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "TLT",
    "IEF"
  ],
  "params": {
    "sma": 100,
    "lookback": 63
  }
};

// c1022 macro chunk 3 (spec: campaign-1022/prereg-macro.json, frozen before code). Rule per spec `rule`.
// Long-bond trend taken only in disinflation (signal mode, TLT/IEF). Null breakeven change -> 0.
function chg(ctx, id, i, n) {
  if (i - n < 0) return null;
  const a = ctx.macro(id, i);
  const b = ctx.macro(id, i - n);
  if (a == null || b == null) return null;
  return a - b;
}

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const s = ctx.sma("close", p.sma, i);
  if (Number.isNaN(s)) return 0;
  const be = chg(ctx, "T10YIE", i, p.lookback);
  if (be === null) return 0;
  return bars[i].close > s && be <= 0 ? 1 : 0;
}
