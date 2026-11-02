// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-31). Source: Heston, Korajczyk & Sadka 2010, 'Intraday patterns in the cross-section of stock returns',
export const meta = {
  id: "c1031-acad4-31",
  name: "Same-hour return seasonality: trade the next hour in the sign of its mean return at the same hour over the last 20 days when t>=1.5, hourly crypto (Heston-Korajczyk-Sadka transfer)",
  family: "seasonality",
  source: "c1031/acad4",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { days: 20, tCut: 1.5 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const H = 24 * p.days;
  if (i < H + 1) return 0;
  if (bars[i].time - bars[i - H].time !== 86400 * p.days) return 0;
  const xs = [];
  for (let k = 1; k <= p.days; k++) xs.push(bars[i + 1 - 24 * k].close / bars[i - 24 * k].close - 1);
  const n = xs.length;
  let m = 0;
  for (const x of xs) m += x;
  m /= n;
  let ss = 0;
  for (const x of xs) ss += (x - m) ** 2;
  const sd = Math.sqrt(ss / (n - 1));
  if (sd === 0) return 0;
  const t = m / (sd / Math.sqrt(n));
  if (t >= p.tCut) return 1;
  if (t <= -p.tCut) return -1;
  return 0;
}
