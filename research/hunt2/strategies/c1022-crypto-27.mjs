// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-27). Frozen before code.
export const meta = {
  id: "c1022-crypto-27",
  name: "Keltner channel breakout (EMA20 +/- 2 ATR10)",
  family: "volatility",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  params: { ema: 20, atr: 10, mult: 2 },
};

export function signal(bars, i, ctx) {
  const { ema, atr, mult } = ctx.params;
  const s = ctx.state;
  if (s.pos === undefined) s.pos = 0;
  const e = ctx.ema("close", ema, i);
  const upper = e + mult * ctx.atr(atr, i);
  if (s.pos === 0 && bars[i].close > upper) s.pos = 1;
  else if (s.pos === 1 && bars[i].close < e) s.pos = 0;
  return s.pos;
}
