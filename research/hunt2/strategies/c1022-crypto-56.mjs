// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-56). Frozen before code.
export const meta = {
  id: "c1022-crypto-56",
  name: "Long-term-holder cost-basis proxy: 155-day VWAP reclaim",
  family: "trend",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  params: { win: 155, band: 0.03 },
};

// vwap = sum(close * volume) / sum(volume) over the last win bars ending at bar k.
function vwapAt(bars, k, win) {
  let pv = 0;
  let v = 0;
  for (let j = k - win + 1; j <= k; j++) {
    pv += bars[j].close * bars[j].volume;
    v += bars[j].volume;
  }
  return pv / v;
}

// Hysteresis: enter long above vwap*(1+band), exit below vwap*(1-band), hold in between.
export function signal(bars, i, ctx) {
  const { win, band } = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) st.pos = 0;
  if (i < win - 1) return 0;
  const vw = vwapAt(bars, i, win);
  const c = bars[i].close;
  if (c > vw * (1 + band)) st.pos = 1;
  else if (c < vw * (1 - band)) st.pos = 0;
  return st.pos;
}
