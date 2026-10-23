// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-57). Frozen before code.
export const meta = {
  id: "c1022-crypto-57",
  name: "Monthly market structure: higher high and higher low on completed monthly bars",
  family: "trend",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  params: { lookback: 2 },
};

// Monthly bars restricted to complete months. Long when the last complete month makes a higher high
// AND a higher low than the one before; exit when its low breaks the prior low; otherwise keep the position.
export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) st.pos = 0;
  const M = ctx.resample(bars, "1M").filter((m) => m.complete);
  if (M.length < 3) return 0;
  const last = M[M.length - 1];
  const prev = M[M.length - 2];
  if (last.high > prev.high && last.low > prev.low) st.pos = 1;
  else if (last.low < prev.low) st.pos = 0;
  return st.pos;
}
