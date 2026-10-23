// Spec: campaign-1022/prereg-macro.json c1022-macro-61 (signal).
// Macro vote for precious metals (2 of 4 debasement tells). Source: Erb & Harvey (2013); Baur & Lucey (2010).

export const meta = {
  id: "c1022-macro-61",
  name: "Macro vote for precious metals (2 of 4 debasement tells)",
  family: "macro",
  source: "c1022/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["GLD", "SLV"],
  params: { lookback: 63, minVotes: 2 },
};

function chg(ctx, id, i, n) {
  if (i - n < 0) return null;
  const a = ctx.macro(id, i), b = ctx.macro(id, i - n);
  return a == null || b == null ? null : a - b;
}

export function signal(bars, i, ctx) {
  const n = ctx.params.lookback;
  const rr = chg(ctx, "DFII10", i, n);
  const dollar = chg(ctx, "DTWEXBGS", i, n);
  const te = chg(ctx, "T10YIE", i, n);
  const vix = ctx.macro("VIX", i), vix3m = ctx.macro("VIX3M", i);
  const votes = [
    rr !== null && rr < 0,
    dollar !== null && dollar < 0,
    vix != null && vix3m != null && vix > vix3m,
    te !== null && te > 0,
  ].filter(Boolean).length;
  return votes >= ctx.params.minVotes ? 1 : 0;
}
