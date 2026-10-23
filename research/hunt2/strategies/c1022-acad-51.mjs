// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-51). Signal mode, 1h crypto, long/short.
// Gao et al. 2018: first-hour return of the UTC day predicts the 23:00-00:00 bar.

export const meta = {
  id: "c1022-acad-51",
  name: "Intraday momentum in crypto: first-hour return predicts the last hour of the UTC day (Gao-Han-Li-Zhou)",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: {},
};

const hourOf = (t) => Math.floor(t / 3600) % 24;

export function signal(bars, i, ctx) {
  if (hourOf(bars[i].time) !== 22) return 0;
  const day = Math.floor(bars[i].time / 86400);
  let j = -1;
  // find the hour-0 bar of the same UTC date (prereg: 0 if none exists)
  for (let k = i; k >= 0 && Math.floor(bars[k].time / 86400) === day; k--) {
    if (hourOf(bars[k].time) === 0) { j = k; break; }
  }
  if (j < 0) return 0;
  const f = bars[j].close / bars[j].open - 1;
  return f > 0 ? 1 : f < 0 ? -1 : 0;
}
