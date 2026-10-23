// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-15). Source: Savor & Wilson 2013, 'How much do investors care about macroeconomic risk? Evidence from scheduled economic announcements', JFQA 48(2), 343-375
export const meta = {
  id: "c1023-acad2-15",
  name: "Announcement-day Treasuries: long TLT/IEF only over employment-report and FOMC sessions (Savor-Wilson)",
  family: "seasonality",
  source: "c1023/acad2",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["TLT","IEF"],
  params: {},
};

const DAY = 86400;
function dow(d) { return (d + 4) % 7; } // 0 = Sunday
function dn(y, m, d) { return Date.UTC(y, m, d) / (DAY * 1000); } // m is 0-based, result is epoch day number (Date.UTC is ms)
function yearOf(d) { return new Date(d * DAY * 1000).getUTCFullYear(); }
function monthOf(d) { return new Date(d * DAY * 1000).getUTCMonth() + 1; }
function nextWeekday(d) { let x = d + 1; const w = dow(x); if (w === 6) x += 2; else if (w === 0) x += 1; return x; }
function nthWd(y, m, wd, n) { const f = dn(y, m, 1); return f + ((wd - dow(f) + 7) % 7) + 7 * (n - 1); }
function lastWd(y, m, wd) { const l = dn(y, m + 1, 0); return l - ((dow(l) - wd + 7) % 7); }

const FOMC = new Set(["2016-01-27","2016-03-16","2016-04-27","2016-06-15","2016-07-27","2016-09-21","2016-11-02","2016-12-14","2017-02-01","2017-03-15","2017-05-03","2017-06-14","2017-07-26","2017-09-20","2017-11-01","2017-12-13","2018-01-31","2018-03-21","2018-05-02","2018-06-13","2018-08-01","2018-09-26","2018-11-08","2018-12-19","2019-01-30","2019-03-20","2019-05-01","2019-06-19","2019-07-31","2019-09-18","2019-10-30","2019-12-11","2020-01-29","2020-04-29","2020-06-10","2020-07-29","2020-09-16","2020-11-05","2020-12-16","2021-01-27","2021-03-17","2021-04-28","2021-06-16","2021-07-28","2021-09-22","2021-11-03","2021-12-15","2022-01-26","2022-03-16","2022-05-04","2022-06-15","2022-07-27","2022-09-21","2022-11-02","2022-12-14","2023-02-01","2023-03-22","2023-05-03","2023-06-14","2023-07-26","2023-09-20","2023-11-01","2023-12-13","2024-01-31","2024-03-20","2024-05-01","2024-06-12","2024-07-31","2024-09-18","2024-11-07","2024-12-18","2025-01-29","2025-03-19"].map((s) => { const [y, m, d] = s.split("-").map(Number); return dn(y, m - 1, d); }));
const BLS = new Set(); // employment-report Fridays: 3rd Friday after the Sun-Sat week containing the 12th
for (let y = 2015; y <= 2026; y++) for (let m = 0; m < 12; m++) { const d12 = dn(y, m, 12); BLS.add(d12 + (6 - dow(d12)) + 20); }

export function signal(bars, i, ctx) {
  const nd = Math.floor(bars[i].time / DAY) + 1;
  return BLS.has(nd) || FOMC.has(nd) ? 1 : 0;
}
