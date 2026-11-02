// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-12). Cross 1973, Financial Analysts Journal 29(6), 67-69; Abraham & Ikenberry 1994, JFQA 29(2), 263-277
export const meta = {
  id: "c1031-acad4-12",
  name: "Friday-to-Monday persistence: take Monday in the direction of Friday's return, 13 equity ETFs (Cross; Abraham-Ikenberry)",
  family: "seasonality",
  source: "c1031/acad4",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  longShort: true,
  params: { fridayDow: 5 },
};

// 0 = Sunday ... 5 = Friday (1970-01-01 was a Thursday)
function dow(t) {
  return (Math.floor(t / 86400) + 4) % 7;
}

export function signal(bars, i, ctx) {
  if (i < 1) return 0;
  if (dow(bars[i].time) !== ctx.params.fridayDow) return 0;
  const r = bars[i].close / bars[i - 1].close - 1;
  return r > 0 ? 1 : r < 0 ? -1 : 0;
}
