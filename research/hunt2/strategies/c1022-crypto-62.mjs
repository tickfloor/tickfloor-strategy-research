// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-62). Frozen before code.
export const meta = {
  id: "c1022-crypto-62",
  name: "Orderly deleveraging: OI down sharply while price holds",
  family: "mean_reversion",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  holdBars: 10,
  params: { win: 7, oiDrop: -0.15, priceFloor: -0.05, hold: 10 },
};

// oic(k) = ctx.openInterest(k) / close[k] (coin-denominated OI). d = oic(i)/oic(i-win) - 1; r = close[i]/close[i-win] - 1.
// Long iff d <= oiDrop AND r >= priceFloor. Any null OI value makes the bar return 0.
export function signal(bars, i, ctx) {
  const { win, oiDrop, priceFloor } = ctx.params;
  if (i < win) return 0;
  const oi1 = ctx.openInterest(i);
  const oi0 = ctx.openInterest(i - win);
  if (!Number.isFinite(oi1) || !Number.isFinite(oi0)) return 0;
  const c1 = bars[i].close;
  const c0 = bars[i - win].close;
  const d = (oi1 / c1) / (oi0 / c0) - 1;
  const r = c1 / c0 - 1;
  return d <= oiDrop && r >= priceFloor ? 1 : 0;
}
