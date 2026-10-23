// c1022 acad chunk 3. Baur 2013, Research in Int. Business and Finance 27(1), 1-11 (autumn effect in gold).
export const meta = {
  id: "c1022-acad-44",
  name: "Autumn effect in gold: long GLD/SLV only during September and November (Baur)",
  family: "seasonality",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["GLD", "SLV"],
  params: { months: [9, 11] },
};

const DAY = 86400;
function dowOf(t) { return (Math.floor(t / DAY) + 4) % 7; }
function nextSession(t) {
  let s = (Math.floor(t / DAY) + 1) * DAY;
  while (dowOf(s) === 0 || dowOf(s) === 6) s += DAY;
  return s;
}

export function signal(bars, i, ctx) {
  const mo = new Date(nextSession(bars[i].time) * 1000).getUTCMonth() + 1; // 1..12 month of the coming session
  return ctx.params.months.includes(mo) ? 1 : 0;
}
