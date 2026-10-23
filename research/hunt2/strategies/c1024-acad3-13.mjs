// Spec: research/hunt2/campaign-1024/prereg-acad3.json (c1024-acad3-13). Siegel 2014 (ch. 19); Lakonishok & Smidt 1988, RFS 1(4), 403-425
export const meta = {
  id: "c1024-acad3-13",
  name: "September effect: flat 13 US equity ETFs for the sessions of September, long otherwise",
  family: "seasonality",
  source: "c1024/acad3",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  params: { flatMonth: 9 },
};

export function signal(bars, i, ctx) {
  // month (1-12) of the UTC calendar day of the next session
  const month = new Date((bars[i].time + 86400) * 1000).getUTCMonth() + 1;
  return month === ctx.params.flatMonth ? 0 : 1;
}
