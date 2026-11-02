export const meta = {
  id: "c1031-macro-09__rob1",
  name: "Nominal-yield trend duration: hold Treasury and credit-duration ETFs while the 10y yield proxy is below its 100-day mean (-25%)",
  family: "trend",
  source: "c1031/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["TLT", "IEF", "AGG", "LQD"],
  params: { window: 75 },
};

// M(ctx, id, i, k) = ctx.macro(id) known by the close of bar i-k; null if i-k < 0 or no value yet.
function M(ctx, id, i, k) {
  return i - k < 0 ? null : ctx.macro(id, i - k);
}

// y(k) = 10y real yield + 10y breakeven = nominal 10y yield proxy, in %; null if either is missing.
function Y(ctx, i, k) {
  const a = M(ctx, "DFII10", i, k);
  const b = M(ctx, "T10YIE", i, k);
  return a === null || b === null ? null : a + b;
}

export function signal(bars, i, ctx) {
  const n = ctx.params.window;
  const y0 = Y(ctx, i, 0);
  if (y0 === null) return 0;
  let sum = 0;
  for (let k = 0; k < n; k++) {
    const y = Y(ctx, i, k);
    if (y === null) return 0;
    sum += y;
  }
  return y0 < sum / n ? 1 : 0;
}
