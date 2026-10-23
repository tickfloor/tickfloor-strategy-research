// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-55). Frozen before code.
export const meta = {
  id: "c1022-crypto-55",
  name: "Realised-price proxy: 90-day VWAP as cost basis",
  family: "trend",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  params: { win: 90, slopeLb: 10 },
};

// vwap at bar k = sum(close * volume) / sum(volume) over bars k-win+1..k.
function vwapAt(bars, k, win) {
  let pv = 0;
  let v = 0;
  for (let j = k - win + 1; j <= k; j++) {
    pv += bars[j].close * bars[j].volume;
    v += bars[j].volume;
  }
  return pv / v;
}

// Long iff close > vwap AND vwap is higher than it was slopeLb bars ago.
export function signal(bars, i, ctx) {
  const { win, slopeLb } = ctx.params;
  if (i < win - 1 + slopeLb) return 0;
  const vw = vwapAt(bars, i, win);
  return bars[i].close > vw && vw > vwapAt(bars, i - slopeLb, win) ? 1 : 0;
}
