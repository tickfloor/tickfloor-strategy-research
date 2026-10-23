// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-61). Frozen before code.
export const meta = {
  id: "c1022-crypto-61",
  name: "Liquidity-improvement momentum: Amihud illiquidity falling",
  family: "momentum",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  holdBars: 10,
  params: { win: 20, hist: 120, z: -1.0, sma: 50, hold: 10 },
};

// amihud = mean over the last `win` bars of |ret| / (close * volume). Its log is pushed into a ring of
// the last `hist` values (current bar included). za = (ln amihud - ring mean) / ring sample std.
// Long iff za <= z AND close > sma(close, sma). Bars with a non-positive or non-finite amihud are skipped.
export function signal(bars, i, ctx) {
  const { win, hist, z } = ctx.params;
  const st = ctx.state;
  if (st.la === undefined) st.la = [];
  if (i < win) return 0;
  let am = 0;
  for (let k = i - win + 1; k <= i; k++) {
    const dv = bars[k].close * bars[k].volume;
    am += Math.abs(bars[k].close / bars[k - 1].close - 1) / dv;
  }
  am /= win;
  if (!(am > 0) || !Number.isFinite(am)) return 0;
  const lv = Math.log(am);
  st.la.push(lv);
  if (st.la.length > hist) st.la.shift();
  if (st.la.length < hist) return 0;
  let mean = 0;
  for (const v of st.la) mean += v;
  mean /= hist;
  let ss = 0;
  for (const v of st.la) ss += (v - mean) * (v - mean);
  const sd = Math.sqrt(ss / (hist - 1));
  if (!(sd > 0)) return 0;
  const za = (lv - mean) / sd;
  return za <= z && bars[i].close > ctx.sma("close", ctx.params.sma, i) ? 1 : 0;
}
