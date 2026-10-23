// c1022 acad chunk 3. Stivers & Sun 2013, JBF 37(5), 1537-1552 (post-expiration week).
// SPY is holdout -> INDEX_PROXY rule: trade QQQ (and DIA) instead.
export const meta = {
  id: "c1022-acad-43",
  name: "Post-expiration week weakness: flat QQQ/DIA for the 5 sessions after the third Friday (Stivers-Sun)",
  family: "seasonality",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA"],
  proxyFor: { SPY: "QQQ" },
  params: { flatSessions: 5 },
};

const DAY = 86400;
function dowOf(t) { return (Math.floor(t / DAY) + 4) % 7; }
function nextSession(t) {
  let s = (Math.floor(t / DAY) + 1) * DAY;
  while (dowOf(s) === 0 || dowOf(s) === 6) s += DAY;
  return s;
}

export function signal(bars, i, ctx) {
  const ns = nextSession(bars[i].time);
  const d = new Date(ns * 1000);
  const y = d.getUTCFullYear(), m = d.getUTCMonth();
  // third Friday of the month of ns: the Friday on day 15..21
  let F = 0;
  for (let day = 15; day <= 21; day++) {
    const s = Date.UTC(y, m, day) / 1000;
    if (dowOf(s) === 5) F = s;
  }
  // flat if bar i+1 is one of the 5 weekday dates after the expiry Friday (Mon..Fri of the next week)
  const offset = Math.round((ns - F) / DAY);
  return offset >= 3 && offset <= 2 + ctx.params.flatSessions ? 0 : 1;
}
