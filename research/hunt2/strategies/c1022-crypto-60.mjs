// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-60). Frozen before code.
export const meta = {
  id: "c1022-crypto-60",
  name: "Up-volume to down-volume ratio (volume flow) over 20 days",
  family: "momentum",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  longShort: true,
  params: { win: 20, hi: 1.5, lo: 0.67 },
};

// up / down = summed volume on days the close rose / fell over the last `win` days.
// Long iff up/down >= hi; short iff up/down <= lo; else flat.
export function signal(bars, i, ctx) {
  const { win, hi, lo } = ctx.params;
  if (i < win) return 0;
  let up = 0;
  let down = 0;
  for (let k = i - win + 1; k <= i; k++) {
    const d = bars[k].close - bars[k - 1].close;
    if (d > 0) up += bars[k].volume;
    else if (d < 0) down += bars[k].volume;
  }
  const ratio = up / down;
  if (ratio >= hi) return 1;
  if (ratio <= lo) return -1;
  return 0;
}
