// Spec: research/hunt2/campaign-1024/prereg-acad3.json (c1024-acad3-19). Ariel 1987, JFE 18(1), 161-174; Kaiser 2019, Finance Research Letters 31, 232-238
export const meta = {
  id: "c1024-acad3-19",
  name: "Crypto first-half-of-month: long all 18 coins from the month-end close through the 15th, flat in the second half (Ariel transfer; Kaiser)",
  family: "seasonality",
  source: "c1024/acad3",
  assetClass: "crypto",
  timeframe: "1d",
  params: { lastLongDay: 15 },
};

export function signal(bars, i, ctx) {
  // UTC day-of-month of the next session
  const day = new Date((bars[i].time + 86400) * 1000).getUTCDate();
  return day <= ctx.params.lastLongDay ? 1 : 0;
}
