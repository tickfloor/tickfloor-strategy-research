// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-21). Signal mode on 1h bars.
// FOMC list = calendar-fomc-drift.mjs copied verbatim, minus the unscheduled 2020-03-03 and 2020-03-15 entries.
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
const FOMC = new Set(FOMC_DATES);
const HOUR = 3600;

function ymd(sec) {
  return new Date(sec * 1000).toISOString().slice(0, 10);
}

export const meta = {
  id: "c1023-acad2-21",
  name: "Crypto pre-FOMC drift: long the 8 hourly coins from 19:00 UTC the day before an FOMC decision to 18:00 UTC on the decision day (Lucca-Moench; Pyo-Lee)",
  family: "seasonality",
  source: "c1023/acad2",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  params: { startHourPrev: 19, endHour: 18 },
};

export function signal(bars, i, ctx) {
  const { startHourPrev, endHour } = ctx.params;
  const n = bars[i].time + HOUR; // open of the bar the position will hold
  const hour = Math.floor(n / HOUR) % 24;
  if (FOMC.has(ymd(n + 86400)) && hour >= startHourPrev) return 1; // ymd(n) is the day before an FOMC date
  if (FOMC.has(ymd(n)) && hour < endHour) return 1; // ymd(n) is an FOMC date
  return 0;
}
