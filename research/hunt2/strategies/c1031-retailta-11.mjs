// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-11). Wilder (1978) Parabolic SAR; MACD histogram per spec.
// ponytail: flip conditions use the standard Wilder recursion (bullish flip when high >= SAR, bearish when low <= SAR); the spec's literal "low > SAR" for bullish would almost never fire.
export const meta = {
  id: "c1031-retailta-11",
  name: "Parabolic SAR flip confirmed by the MACD histogram within three bars",
  family: "trend",
  source: "c1031/retailta",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  params: { af: 0.02, afMax: 0.2, macd: [12, 26, 9], window: 3 },
};

export function signal(bars, i, ctx) {
  const { af: afStep, afMax, window } = ctx.params;
  const [fast, slow, sig] = ctx.params.macd;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.flipUp = -1e9; st.sarInit = false; st.msCnt = 0; st.msSum = 0; st.msEma = NaN; }
  const b = bars[i];

  // Wilder parabolic SAR
  if (!st.sarInit) {
    st.sarInit = true;
    st.bull = true;
    st.sar = b.low;
    st.ep = b.high;
    st.af = afStep;
  } else {
    const p1 = bars[i - 1];
    const p2 = i >= 2 ? bars[i - 2] : p1;
    if (st.bull) {
      let ns = st.sar + st.af * (st.ep - st.sar);
      ns = Math.min(ns, p1.low, p2.low);
      if (b.low < ns) {
        st.bull = false; st.sar = st.ep; st.ep = b.low; st.af = afStep;
      } else {
        if (b.high > st.ep) { st.ep = b.high; st.af = Math.min(st.af + afStep, afMax); }
        st.sar = ns;
      }
    } else {
      let ns = st.sar + st.af * (st.ep - st.sar);
      ns = Math.max(ns, p1.high, p2.high);
      if (b.high > ns) {
        st.bull = true; st.sar = st.ep; st.ep = b.high; st.af = afStep; st.flipUp = i;
      } else {
        if (b.low < st.ep) { st.ep = b.low; st.af = Math.min(st.af + afStep, afMax); }
        st.sar = ns;
      }
    }
  }

  // MACD histogram: signal = EMA9 of the MACD line (seeded with its SMA)
  const macd = ctx.ema("close", fast, i) - ctx.ema("close", slow, i);
  let hist = NaN;
  if (Number.isFinite(macd)) {
    st.msCnt++;
    if (st.msCnt < sig) st.msSum += macd;
    else if (st.msCnt === sig) { st.msSum += macd; st.msEma = st.msSum / sig; hist = macd - st.msEma; }
    else { st.msEma += (2 / (sig + 1)) * (macd - st.msEma); hist = macd - st.msEma; }
  }

  if (st.pos === 1) {
    if (!st.bull) st.pos = 0;
  } else if (st.bull && i - st.flipUp <= window - 1 && hist > 0) {
    st.pos = 1;
  }
  return st.pos;
}
