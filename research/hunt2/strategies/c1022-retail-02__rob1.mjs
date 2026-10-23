// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-02). Frozen before code.
export const meta = {
  id: "c1022-retail-02__rob1",
  name: "RSI 60/40 range-shift hysteresis (Cardwell) (-25%)",
  family: "trend",
  source: "c1022/retail",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  params: {"rsi": 14, "enter": 60, "exit": 40},
};

export function signal(bars, i, ctx) {
  const s = ctx.state;
  if (s.pos === undefined) s.pos = 0;
  const r = ctx.rsi(11, i);
  const rp = i > 0 ? ctx.rsi(11, i - 1) : NaN;
  if (rp <= 60 && r > 60) s.pos = 1;
  else if (r < 40) s.pos = 0;
  return s.pos;
}
