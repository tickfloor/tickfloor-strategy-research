// c1022 acad chunk 3. Savor & Wilson 2013, JFQA 48(2), 343-375 (employment-report day premium).
// SPY is holdout -> INDEX_PROXY rule: trade QQQ (and DIA) instead.
export const meta = {
  id: "c1022-acad-39",
  name: "Employment-report day premium: long QQQ/DIA into the monthly jobs report only (Savor-Wilson)",
  family: "seasonality",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA"],
  proxyFor: { SPY: "QQQ" },
  params: {},
};

const DAY = 86400;
function dowOf(t) { return (Math.floor(t / DAY) + 4) % 7; }
function ymdOf(t) {
  const d = new Date(t * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
// Employment-report day R for release month M (0-based m): 3rd Friday after the Sun-Sat week containing the 12th.
function reportDayOf(y, m) {
  const d12 = Date.UTC(y, m, 12) / 1000;
  const sat = d12 + (6 - dowOf(d12)) * DAY;
  return ymdOf(sat + 20 * DAY);
}
function isReportDay(ds) {
  const y = Number(ds.slice(0, 4)), m = Number(ds.slice(5, 7)) - 1;
  return reportDayOf(y, m - 1) === ds || reportDayOf(y, m) === ds;
}

// Return 1 on the Thursday bar, so the position runs Thursday close through Friday close.
export function signal(bars, i, ctx) {
  return isReportDay(ymdOf(bars[i].time + DAY)) ? 1 : 0;
}
