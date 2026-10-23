// c1022 acad chunk 3. Kamstra, Kramer, Levi & Wermers 2017, JFQA 52(1), 71-109 (seasonal affective bond demand).
export const meta = {
  id: "c1022-acad-45",
  name: "Seasonal-affective bond demand: long Treasury/aggregate bond ETFs September to November (Kamstra-Kramer-Levi-Wermers)",
  family: "seasonality",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["TLT", "IEF", "AGG", "LQD", "SHY"],
  params: { months: [9, 10, 11] },
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
