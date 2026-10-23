// Spec: campaign-1022/prereg-macro.json c1022-macro-60 (signal).
// Macro vote for long bonds (2 of 4 disinflation / flight-to-quality tells). Source: Campbell, Sunderam & Viceira (2017).

export const meta = {
  id: "c1022-macro-60",
  name: "Macro vote for long bonds (2 of 4 disinflation / flight-to-quality tells)",
  family: "macro",
  source: "c1022/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["TLT", "IEF"],
  params: { lookback: 63, minVotes: 2 },
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
  const te = chg(ctx, "T10YIE", i, n);
  const oil = oilRoc(ctx, i, n);
  const dollar = chg(ctx, "DTWEXBGS", i, n);
  const vix = ctx.macro("VIX", i), vix3m = ctx.macro("VIX3M", i);
  const votes = [
    te !== null && te < 0,
    oil !== null && oil < 0,
    dollar !== null && dollar > 0,
    vix != null && vix3m != null && vix > vix3m,
  ].filter(Boolean).length;
  return votes >= ctx.params.minVotes ? 1 : 0;
}
