// c1022 acad chunk 3. Savor & Wilson 2014, JFE 113(2), 171-201 (announcement-day beta).
export const meta = {
  id: "c1022-acad-38",
  name: "Announcement-day beta: high-beta on employment-report and FOMC days, low-beta otherwise (Savor-Wilson)",
  family: "seasonality",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "daily",
  params: { betaBars: 252, frac: 0.2 },
};

// FOMC decision dates, copied verbatim from research/hunt2/strategies/calendar-fomc-drift.mjs (imports are banned).
const FOMC_DATES = [
  "2016-01-27","2016-03-16","2016-04-27","2016-06-15","2016-07-27","2016-09-21","2016-11-02","2016-12-14",
  "2017-02-01","2017-03-15","2017-05-03","2017-06-14","2017-07-26","2017-09-20","2017-11-01","2017-12-13",
  "2018-01-31","2018-03-21","2018-05-02","2018-06-13","2018-08-01","2018-09-26","2018-11-08","2018-12-19",
  "2019-01-30","2019-03-20","2019-05-01","2019-06-19","2019-07-31","2019-09-18","2019-10-30","2019-12-11",
  "2020-01-29","2020-03-03","2020-03-15","2020-04-29","2020-06-10","2020-07-29","2020-09-16","2020-11-05","2020-12-16",
  "2021-01-27","2021-03-17","2021-04-28","2021-06-16","2021-07-28","2021-09-22","2021-11-03","2021-12-15",
  "2022-01-26","2022-03-16","2022-05-04","2022-06-15","2022-07-27","2022-09-21","2022-11-02","2022-12-14",
  "2023-02-01","2023-03-22","2023-05-03","2023-06-14","2023-07-26","2023-09-20","2023-11-01","2023-12-13",
  "2024-01-31","2024-03-20","2024-05-01","2024-06-12","2024-07-31","2024-09-18","2024-11-07","2024-12-18",
  "2025-01-29","2025-03-19",
];

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
// Employment-report day R for release month M (0-based m): 3rd Friday after the Sun-Sat week containing the 12th.
function reportDayOf(y, m) {
  const d12 = Date.UTC(y, m, 12) / 1000;
  const sat = d12 + (6 - dowOf(d12)) * DAY;
  return ymdOf(sat + 20 * DAY);
}
// R of month M falls in month M+1, so a date in month m can only be the R of month m-1.
function isReportDay(ds) {
  const y = Number(ds.slice(0, 4)), m = Number(ds.slice(5, 7)) - 1;
  return reportDayOf(y, m - 1) === ds || reportDayOf(y, m) === ds;
}

// Equal-weight the names at one end of the sort; hold cash if fewer than 3 are picked.
function pickEqual(scores, frac, lowest) {
  const n = Math.floor(scores.length * frac);
  if (n < 3) return {};
  scores.sort((a, b) => (lowest ? a[1] - b[1] : b[1] - a[1]) || (a[0] < b[0] ? -1 : 1));
  const w = {};
  for (const [sym] of scores.slice(0, n)) w[sym] = 1 / n;
  return w;
}

// beta_i = cov(ret_i, EW market) / var(EW market) over the last n bars (EW market time-aligned).
function betas(universe, eligible, n) {
  const sums = new Map();
  const rets = {};
  for (const sym of eligible) {
    const b = universe[sym];
    const m = new Map();
    for (let k = b.length - n; k < b.length; k++) {
      const r = b[k].close / b[k - 1].close - 1;
      m.set(b[k].time, r);
      const a = sums.get(b[k].time) || [0, 0];
      a[0] += r; a[1] += 1;
      sums.set(b[k].time, a);
    }
    rets[sym] = m;
  }
  const out = [];
  for (const sym of eligible) {
    const m = rets[sym];
    if (m.size < n) continue;
    const xs = [], ys = [];
    for (const [tm, r] of m) {
      const a = sums.get(tm);
      xs.push(r);
      ys.push(a[0] / a[1]);
    }
    const mx = xs.reduce((a, x) => a + x, 0) / n;
    const my = ys.reduce((a, x) => a + x, 0) / n;
    let cov = 0, vy = 0;
    for (let j = 0; j < n; j++) {
      cov += (xs[j] - mx) * (ys[j] - my);
      vy += (ys[j] - my) ** 2;
    }
    if (vy > 0 && Number.isFinite(cov / vy)) out.push([sym, cov / vy]);
  }
  return out;
}

export function rank(universe, t, ctx) {
  const { betaBars, frac } = ctx.params;
  const eligible = Object.keys(universe).filter((s) => universe[s].length > 260);
  if (eligible.length === 0) return {};
  const ns = ymdOf(nextSession(t));
  const announce = isReportDay(ns) || FOMC_DATES.includes(ns);
  // announcement day: own high beta; otherwise own low beta
  return pickEqual(betas(universe, eligible, betaBars), frac, !announce);
}
