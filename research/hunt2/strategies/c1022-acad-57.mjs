// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-57). Signal mode, daily crypto.
// Corbet et al. 2020: hold crypto through the UTC day of each US employment report (BLS rule).

export const meta = {
  id: "c1022-acad-57",
  name: "Crypto on US employment-report day: long all 18 for the UTC session of the jobs report (Corbet et al.)",
  family: "seasonality",
  source: "c1022/acad",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  longShort: false,
  params: {},
};

const DAY = 86400;

// is epoch-day `day` an employment-report Friday? Reference month M = previous month of the report:
// R = (Sat of the week containing the 12th of M) + 20 days, and R always falls in month M+1.
function isReportDay(day) {
  const d = new Date(day * DAY * 1000);
  let y = d.getUTCFullYear(), m = d.getUTCMonth() - 1;
  if (m < 0) { m = 11; y--; }
  const d12 = Date.UTC(y, m, 12) / (DAY * 1000);
  const sat = d12 + (6 - ((d12 + 4) % 7));
  return sat + 20 === day;
}

export function signal(bars, i, ctx) {
  // held over the UTC day containing the 13:30 UTC release: bar i is the day before R
  return isReportDay(Math.floor(bars[i].time / DAY) + 1) ? 1 : 0;
}
