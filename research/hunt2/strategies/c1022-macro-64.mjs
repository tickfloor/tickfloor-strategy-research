// Spec: campaign-1022/prereg-macro.json c1022-macro-64 (signal, crypto daily, default universe).
// Crypto in the debasement regime: dollar and real yields both falling. Source: Erb & Harvey (2013); Liu & Tsyvinski (2021).

export const meta = {
  id: "c1022-macro-64",
  name: "Crypto in the debasement regime: dollar and real yields both falling",
  family: "macro",
  source: "c1022/macro",
  assetClass: "crypto",
  timeframe: "1d",
  params: { lookback: 63 },
};

function chg(ctx, id, i, n) {
  if (i - n < 0) return null;
  const a = ctx.macro(id, i), b = ctx.macro(id, i - n);
  return a == null || b == null ? null : a - b;
}

export function signal(bars, i, ctx) {
  const n = ctx.params.lookback;
  const dollar = chg(ctx, "DTWEXBGS", i, n);
  const rr = chg(ctx, "DFII10", i, n);
  if (dollar === null || rr === null) return 0;
  return dollar < 0 && rr < 0 ? 1 : 0;
}
