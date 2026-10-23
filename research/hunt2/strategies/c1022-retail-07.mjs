// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-07). Frozen before code.
export const meta = {
  id: "c1022-retail-07",
  name: "Hourly RSI 30 reclaim above the 200 EMA (crypto)",
  family: "mean_reversion",
  source: "c1022/retail",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  params: {"rsi": 14, "ema": 200, "entry": 30, "exit": 60, "maxHold": 48},
};

export function signal(bars, i, ctx) {
  const s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.entry = 0; }
  const c = bars[i].close;
  const e = ctx.ema("close", 200, i);
  const r = ctx.rsi(14, i);
  const rp = i > 0 ? ctx.rsi(14, i - 1) : NaN;
  if (s.pos === 1) {
    if (r > 60 || c < e || i - s.entry >= 48) s.pos = 0;
  } else if (c > e && rp < 30 && r >= 30) {
    s.pos = 1; s.entry = i;
  }
  return s.pos;
}
