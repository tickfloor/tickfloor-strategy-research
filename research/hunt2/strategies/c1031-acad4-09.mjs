// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-09). Li & Yu 2012, Journal of Financial Economics 104(2), 401-419
export const meta = {
  id: "c1031-acad4-09",
  name: "Nearness to the 52-week high predicts the index: hold QQQ/DIA only when within 5% of the 252-day closing high (Li-Yu)",
  family: "momentum",
  source: "c1031/acad4",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA"],
  longShort: false,
  params: { window: 252, cut: 0.95 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < p.window - 1) return 0;
  let H = -Infinity;
  for (let k = i - p.window + 1; k <= i; k++) if (bars[k].close > H) H = bars[k].close;
  return bars[i].close / H >= p.cut ? 1 : 0;
}
