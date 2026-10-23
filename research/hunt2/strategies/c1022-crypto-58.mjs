// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-58). Frozen before code.
export const meta = {
  id: "c1022-crypto-58",
  name: "Time-under-water regime: cash after 60 days without a 100-day high",
  family: "other",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  params: { high: 100, maxDays: 60, reentry: 50 },
};

// daysSince = bars since the latest close equal to the highest close of the trailing `high` bars.
// Above maxDays -> flat (bear). Re-enter long on a close above the prior `reentry` closes.
// Starts long on the first bar with a full history (unless already in a bear regime).
export function signal(bars, i, ctx) {
  const { high, maxDays, reentry } = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) {
    st.pos = 0;
    st.started = false;
  }
  if (i < high - 1) return 0;
  let mx = -Infinity;
  let at = i;
  for (let k = i - high + 1; k <= i; k++) {
    if (bars[k].close >= mx) {
      mx = bars[k].close;
      at = k;
    }
  }
  const daysSince = i - at;
  if (!st.started) {
    st.started = true;
    st.pos = 1;
  }
  if (daysSince > maxDays) {
    st.pos = 0;
    return 0;
  }
  let prior = -Infinity;
  for (let k = i - reentry; k <= i - 1; k++) if (bars[k].close > prior) prior = bars[k].close;
  if (bars[i].close > prior) st.pos = 1;
  return st.pos;
}
