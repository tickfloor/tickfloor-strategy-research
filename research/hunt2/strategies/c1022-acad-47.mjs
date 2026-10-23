// c1022 acad chunk 3. Hale, Krishnamurthy, Kudlyak & Shultz 2018, FRBSF Economic Letter 2018-12.
export const meta = {
  id: "c1022-acad-47",
  name: "CME expiry drag: short crypto for the 3 sessions into the last Friday of each month",
  family: "seasonality",
  source: "c1022/acad",
  assetClass: "crypto",
  timeframe: "1d",
  assets: [
    "BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT",
    "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT",
  ],
  longShort: true,
  params: { sessionsBefore: 3 },
};

const DAY = 86400;
function dowOf(t) { return (Math.floor(t / DAY) + 4) % 7; }

export function signal(bars, i, ctx) {
  const t = bars[i].time;
  const d = new Date(t * 1000);
  const y = d.getUTCFullYear(), m = d.getUTCMonth();
  // last Friday of the month of t
  let lf = Date.UTC(y, m + 1, 0) / 1000;
  while (dowOf(lf) !== 5) lf -= DAY;
  const daysBefore = Math.round((lf - Math.floor(t / DAY) * DAY) / DAY);
  return daysBefore >= 1 && daysBefore <= ctx.params.sessionsBefore ? -1 : 0;
}
