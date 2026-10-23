// c1022 acad chunk 3. Dichev & Janes 2003, J. Private Equity 6(4), 8-29; Yuan, Zheng & Zhu 2006, JEF 13(1).
// SPY is holdout -> INDEX_PROXY rule: trade QQQ (and DIA) instead.
export const meta = {
  id: "c1022-acad-40",
  name: "Lunar cycle: long QQQ/DIA in the week around the new moon, flat around the full moon (Dichev-Janes)",
  family: "seasonality",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA"],
  proxyFor: { SPY: "QQQ" },
  params: { refNewMoonEpoch: 947182440, synodicDays: 29.530588853, halfWindowFrac: 0.125 },
};

// phase of the coming session: 0 = new moon, 0.5 = full moon
export function signal(bars, i, ctx) {
  const { refNewMoonEpoch, synodicDays, halfWindowFrac } = ctx.params;
  const x = ((bars[i].time + 86400) - refNewMoonEpoch) / (synodicDays * 86400);
  const phase = x - Math.floor(x);
  return phase < halfWindowFrac || phase > 1 - halfWindowFrac ? 1 : 0;
}
