// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-33). Sell-in-May style calendar filter: flat in Jul-Sep, long otherwise, 13 equity ETFs
export const meta = {
  id: "c1031-acad4-33",
  name: "Calendar filter: long equity ETFs except in July to September (UTC month of the next session)",
  family: "seasonality",
  source: "c1031/acad4",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  longShort: false,
  params: { flatMonths: [7, 8, 9] },
};

export function signal(bars, i, ctx) {
  const m = new Date((bars[i].time + 86400) * 1000).getUTCMonth() + 1;
  return ctx.params.flatMonths.includes(m) ? 0 : 1;
}
