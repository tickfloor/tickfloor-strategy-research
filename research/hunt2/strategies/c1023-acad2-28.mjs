// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-28). Signal mode, pre-holiday session.
const DAY = 86400;

// day numbers (days since 1970-01-01 UTC); m is 0-based
function dnum(y, m, d) { return Date.UTC(y, m, d) / (DAY * 1000); } // Date.UTC is in ms
function dowOf(x) { return (x + 4) % 7; } // 0 = Sunday
function nthWeekday(y, m, wd, n) {
  const first = dnum(y, m, 1);
  return first + ((wd - dowOf(first) + 7) % 7) + 7 * (n - 1);
}
function lastWeekday(y, m, wd) {
  const last = dnum(y, m + 1, 0);
  return last - ((dowOf(last) - wd + 7) % 7);
}
// weekend holidays are observed on the nearest weekday (Sat -> Fri, Sun -> Mon)
function observed(x) {
  const w = dowOf(x);
  return w === 6 ? x - 1 : w === 0 ? x + 1 : x;
}
// Anonymous Gregorian computus; returns the day number of Easter Sunday
function easterSunday(Y) {
  const a = Y % 19;
  const b = Math.floor(Y / 100);
  const c = Y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return dnum(Y, month - 1, day);
}

// NYSE holidays 2010-2030 as day numbers
const HOLIDAYS = new Set();
for (let Y = 2010; Y <= 2030; Y++) {
  HOLIDAYS.add(observed(dnum(Y, 0, 1)));              // Jan 1
  HOLIDAYS.add(nthWeekday(Y, 0, 1, 3));               // MLK day, 3rd Monday Jan
  HOLIDAYS.add(nthWeekday(Y, 1, 1, 3));               // Presidents day, 3rd Monday Feb
  HOLIDAYS.add(easterSunday(Y) - 2);                  // Good Friday
  HOLIDAYS.add(lastWeekday(Y, 4, 1));                 // Memorial day, last Monday May
  if (Y >= 2022) HOLIDAYS.add(observed(dnum(Y, 5, 19))); // Juneteenth
  HOLIDAYS.add(observed(dnum(Y, 6, 4)));              // Jul 4
  HOLIDAYS.add(nthWeekday(Y, 8, 1, 1));               // Labor day, 1st Monday Sep
  HOLIDAYS.add(nthWeekday(Y, 10, 4, 4));              // Thanksgiving, 4th Thursday Nov
  HOLIDAYS.add(observed(dnum(Y, 11, 25)));            // Dec 25
}

export const meta = {
  id: "c1023-acad2-28",
  name: "Crypto pre-holiday drift: long all 18 coins over the UTC day before each NYSE holiday (Ariel transfer; Qadan-Aharon-Eichel)",
  family: "seasonality",
  source: "c1023/acad2",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  params: {},
};

export function signal(bars, i, ctx) {
  const D = Math.floor(bars[i].time / DAY) + 1; // UTC day the position holds
  if (dowOf(D) === 0 || dowOf(D) === 6 || HOLIDAYS.has(D)) return 0;
  let x = D + 1;
  while (dowOf(x) === 0 || dowOf(x) === 6) x++; // first weekday after D
  return HOLIDAYS.has(x) ? 1 : 0;
}
