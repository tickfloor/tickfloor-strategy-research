// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-15). Kaufman 1995 Smarter Trading; Kaufman 2013 Trading Systems and Methods 5th ed.
export const meta = {
  id: "c1031-overlay-15",
  name: "Kaufman efficiency-ratio trend filter on crypto: hold a coin only if it is above its 100-day average and its 30-day efficiency ratio is at least 0.20",
  family: "trend-filter",
  source: "c1031/overlay",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  longShort: false,
  params: { smaWin: 100, erWin: 30, erMin: 0.2 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < 100) return 0;
  const m = ctx.sma("close", p.smaWin, i);
  if (!Number.isFinite(m)) return 0;
  const c = bars[i].close;
  const num = Math.abs(c - bars[i - p.erWin].close);
  let den = 0;
  for (let k = i - p.erWin + 1; k <= i; k++) den += Math.abs(bars[k].close - bars[k - 1].close);
  const er = den > 0 ? num / den : 0;
  return c > m && er >= p.erMin ? 1 : 0;
}
