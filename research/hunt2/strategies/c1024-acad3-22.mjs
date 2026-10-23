// Spec: research/hunt2/campaign-1024/prereg-acad3.json (c1024-acad3-22). Frieder & Subrahmanyam 2004, FAJ 60(4), 29-34
export const meta = {
  id: "c1024-acad3-22",
  name: "'Sell Rosh Hashanah, buy Yom Kippur': flat 13 US equity ETFs between the two holidays, long otherwise (Frieder-Subrahmanyam)",
  family: "seasonality",
  source: "c1024/acad3",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  longShort: false,
  params: {
    windows: [
      ["2016-10-03", "2016-10-12"], ["2017-09-21", "2017-09-30"], ["2018-09-10", "2018-09-19"],
      ["2019-09-30", "2019-10-09"], ["2020-09-19", "2020-09-28"], ["2021-09-07", "2021-09-16"],
      ["2022-09-26", "2022-10-05"], ["2023-09-16", "2023-09-25"], ["2024-10-03", "2024-10-12"],
    ],
  },
};

export function signal(bars, i, ctx) {
  if (ctx.state.w === undefined) {
    ctx.state.w = ctx.params.windows.map(([a, b]) => [Date.parse(a + "T00:00:00Z") / 86400000, Date.parse(b + "T00:00:00Z") / 86400000]);
  }
  // session the returned position is held over = calendar day after bar i
  const d = Math.floor(bars[i].time / 86400) + 1;
  for (const [lo, hi] of ctx.state.w) if (d >= lo && d <= hi) return 0;
  return 1;
}
