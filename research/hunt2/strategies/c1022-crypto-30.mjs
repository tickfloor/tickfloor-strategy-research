// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-30). Frozen before code.
export const meta = {
  id: "c1022-crypto-30",
  name: "Hourly wide-range bar closing at its extreme: continuation",
  family: "volatility",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  holdBars: 6,
  params: { atr: 24, mult: 3, closePos: 0.2, hold: 6 },
};

export function signal(bars, i, ctx) {
  const { atr, mult, closePos } = ctx.params;
  if (i < 1) return 0;
  const b = bars[i];
  const rng = b.high - b.low;
  if (!(rng > 0)) return 0;
  const wide = rng >= mult * ctx.atr(atr, i - 1);
  const pos = (b.close - b.low) / rng;
  if (wide && pos >= 1 - closePos) return 1;
  if (wide && pos <= closePos) return -1;
  return 0;
}
