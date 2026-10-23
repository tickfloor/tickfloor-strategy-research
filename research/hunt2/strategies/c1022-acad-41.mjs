// c1022 acad chunk 3. Ariel 1987, JFE 18(1), 161-174 (first-half-of-month effect).
// SPY is holdout -> INDEX_PROXY rule: trade QQQ (and DIA) instead.
export const meta = {
  id: "c1022-acad-41",
  name: "First-half-of-month effect: long QQQ/DIA for the first 9 sessions of each month (Ariel)",
  family: "seasonality",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA"],
  proxyFor: { SPY: "QQQ" },
  params: { sessions: 9 },
};

const DAY = 86400;
function dowOf(t) { return (Math.floor(t / DAY) + 4) % 7; }
function ymdOf(t) {
  const d = new Date(t * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
function nextSession(t) {
  let s = (Math.floor(t / DAY) + 1) * DAY;
  while (dowOf(s) === 0 || dowOf(s) === 6) s += DAY;
  return s;
}

export function signal(bars, i, ctx) {
  const month = ymdOf(bars[i].time).slice(0, 7);
  // k = bars of this calendar month seen so far, including bar i
  let k = 0;
  for (let j = i; j >= 0 && ymdOf(bars[j].time).slice(0, 7) === month; j--) k++;
  if (k <= ctx.params.sessions - 1) return 1;                 // bar i+1 is session 2..9
  return ymdOf(nextSession(bars[i].time)).slice(0, 7) !== month ? 1 : 0; // bar i+1 is session 1 of next month
}
