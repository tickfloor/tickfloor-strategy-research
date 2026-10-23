// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-22). Signal mode, cycle-week parity.
// Cycle-week definition verbatim from r27-qqq-agg-fomc-cycle.mjs. FOMC list = calendar-fomc-drift.mjs
// minus the unscheduled 2020-03-03 and 2020-03-15 entries (as the spec says).
const FOMC_DATES = [
  "2016-01-27","2016-03-16","2016-04-27","2016-06-15","2016-07-27","2016-09-21","2016-11-02","2016-12-14",
  "2017-02-01","2017-03-15","2017-05-03","2017-06-14","2017-07-26","2017-09-20","2017-11-01","2017-12-13",
  "2018-01-31","2018-03-21","2018-05-02","2018-06-13","2018-08-01","2018-09-26","2018-11-08","2018-12-19",
  "2019-01-30","2019-03-20","2019-05-01","2019-06-19","2019-07-31","2019-09-18","2019-10-30","2019-12-11",
  "2020-01-29","2020-04-29","2020-06-10","2020-07-29","2020-09-16","2020-11-05","2020-12-16",
  "2021-01-27","2021-03-17","2021-04-28","2021-06-16","2021-07-28","2021-09-22","2021-11-03","2021-12-15",
  "2022-01-26","2022-03-16","2022-05-04","2022-06-15","2022-07-27","2022-09-21","2022-11-02","2022-12-14",
  "2023-02-01","2023-03-22","2023-05-03","2023-06-14","2023-07-26","2023-09-20","2023-11-01","2023-12-13",
  "2024-01-31","2024-03-20","2024-05-01","2024-06-12","2024-07-31","2024-09-18","2024-11-07","2024-12-18",
  "2025-01-29","2025-03-19",
];

function dayNum(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
}
const FOMC_DAYS = FOMC_DATES.map(dayNum);
const NEUTRAL_DAY = dayNum("2016-01-26");

// epoch day 0 = Thursday; weekday iff ((x + 4) % 7) is 1..5
function isWeekday(x) {
  const w = ((x % 7) + 7 + 4) % 7;
  return w >= 1 && w <= 5;
}
function firstWeekdayAfter(T) {
  let x = T + 1;
  while (!isWeekday(x)) x++;
  return x;
}
// wd(a, b) = count of weekdays x with a < x <= b
function wd(a, b) {
  let n = 0;
  for (let x = a + 1; x <= b; x++) if (isWeekday(x)) n++;
  return n;
}

export const meta = {
  id: "c1023-acad2-22",
  name: "Crypto FOMC-cycle weeks: long all 18 coins in even FOMC-cycle weeks, flat in odd weeks (Cieslak-Morse-Vissing-Jorgensen transfer)",
  family: "seasonality",
  source: "c1023/acad2",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  params: {},
};

export function signal(bars, i, ctx) {
  const T = Math.floor(bars[i].time / 86400); // day number of the bar's own UTC date
  if (T < NEUTRAL_DAY) return 0;
  const D = firstWeekdayAfter(T);
  let week;
  let dn = -1;
  for (const f of FOMC_DAYS) if (f >= D) { dn = f; break; }
  if (dn !== -1 && wd(D, dn) === 1) {
    week = 0;
  } else {
    let dp = -1;
    for (const f of FOMC_DAYS) if (f <= D) dp = f;
    const k = D === dp ? 0 : wd(dp, D);
    week = k <= 3 ? 0 : 1 + Math.floor((k - 4) / 5);
  }
  return week % 2 === 0 ? 1 : 0;
}
