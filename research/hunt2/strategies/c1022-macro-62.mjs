// Spec: campaign-1022/prereg-macro.json c1022-macro-62 (signal).
// Macro vote for equities (3 of 5 easing tells). Source: Adrian, Boyarchenko & Giannone (2019); Brooks (2017).

export const meta = {
  id: "c1022-macro-62",
  name: "Macro vote for equities (3 of 5 easing tells)",
  family: "macro",
  source: "c1022/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLY", "XLF", "XLI"],
  params: { lookback: 63, minVotes: 3 },
};

function chg(ctx, id, i, n) {
  if (i - n < 0) return null;
  const a = ctx.macro(id, i), b = ctx.macro(id, i - n);
  return a == null || b == null ? null : a - b;
}

function oilRoc(ctx, i, n) {
  if (i - n < 0) return null;
  const a = ctx.macro("DCOILWTICO", i), b = ctx.macro("DCOILWTICO", i - n);
  return a == null || b == null || b === 0 ? null : a / b - 1;
}

export function signal(bars, i, ctx) {
  const n = ctx.params.lookback;
  const curve = chg(ctx, "T10Y2Y", i, n);
  const rr = chg(ctx, "DFII10", i, n);
  const dollar = chg(ctx, "DTWEXBGS", i, n);
  const oil = oilRoc(ctx, i, n);
  const vix = ctx.macro("VIX", i), vix3m = ctx.macro("VIX3M", i);
  const votes = [
    curve !== null && curve > 0,
    rr !== null && rr < 0,
    dollar !== null && dollar < 0,
    vix != null && vix3m != null && vix < vix3m,
    oil !== null && oil < 0,
  ].filter(Boolean).length;
  return votes >= ctx.params.minVotes ? 1 : 0;
}
