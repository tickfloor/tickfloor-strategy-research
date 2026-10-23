export const meta = {
  "id": "c1022-macro-40",
  "name": "Financial-conditions count gate on crypto",
  "family": "macro",
  "source": "c1022/macro",
  "assetClass": "crypto",
  "timeframe": "1d",
  "params": {
    "lookback": 63,
    "bp": 0.25,
    "maxFlags": 1
  }
};

// c1022 macro chunk 3 (spec: campaign-1022/prereg-macro.json, frozen before code). Rule per spec `rule`.
// Financial-conditions count gate: flat when 2+ of 4 flags fire (crypto, signal mode).
function chg(ctx, id, i, n) {
  if (i - n < 0) return null;
  const a = ctx.macro(id, i);
  const b = ctx.macro(id, i - n);
  if (a == null || b == null) return null;
  return a - b;
}

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const vix = ctx.macro("VIX", i);
  const vix3 = ctx.macro("VIX3M", i);
  const f1 = vix !== null && vix3 !== null && vix > vix3;
  const f2c = chg(ctx, "DTWEXBGS", i, p.lookback);
  const f2 = f2c !== null && f2c > 0;
  const f3c = chg(ctx, "DFII10", i, p.lookback);
  const f3 = f3c !== null && f3c > p.bp;
  const y = ctx.macro("T10Y2Y", i);
  const f4 = y !== null && y < 0;
  const count = [f1, f2, f3, f4].filter(Boolean).length;
  return count > p.maxFlags ? 0 : 1;
}
