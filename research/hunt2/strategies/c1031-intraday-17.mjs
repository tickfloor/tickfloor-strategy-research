// Spec: research/hunt2/campaign-1031/prereg-intraday.json (c1031-intraday-17).
export const meta = {
  id: "c1031-intraday-17",
  name: "Wilder DMI/ADX(14) trend: +DI/-DI cross with ADX above 25",
  family: "trend",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { n: 14, adxMin: 25 },
};

const WARMUP = 200; // spec: ignore signals for the first 200 bars

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.cnt = 0; }
  if (i === 0) return 0;

  // recursive Wilder state, one update per bar k >= 1
  const b = bars[i], q = bars[i - 1];
  const upM = b.high - q.high, dnM = q.low - b.low;
  const pDM = upM > dnM && upM > 0 ? upM : 0;
  const mDM = dnM > upM && dnM > 0 ? dnM : 0;
  const TR = Math.max(b.high - b.low, Math.abs(b.high - q.close), Math.abs(b.low - q.close));
  const a = (p.n - 1) / p.n;
  if (st.cnt === 0) { st.sP = pDM; st.sM = mDM; st.sT = TR; }
  else { st.sP = st.sP * a + pDM / p.n; st.sM = st.sM * a + mDM / p.n; st.sT = st.sT * a + TR / p.n; }
  const pDI = st.sT > 0 ? (100 * st.sP) / st.sT : 0;
  const mDI = st.sT > 0 ? (100 * st.sM) / st.sT : 0;
  const DX = pDI + mDI > 0 ? (100 * Math.abs(pDI - mDI)) / (pDI + mDI) : 0;
  st.adx = st.cnt === 0 ? DX : st.adx * a + DX / p.n;
  st.cnt++;

  const prevP = st.pDI, prevM = st.mDI;
  st.pDI = pDI; st.mDI = mDI;
  if (i < WARMUP) return 0;

  const adx = st.adx;
  const pUp = prevP <= prevM && pDI > mDI;
  const mUp = prevM <= prevP && mDI > pDI;
  if (st.pos === 1) { if (mUp) st.pos = adx > p.adxMin ? -1 : 0; }
  else if (st.pos === -1) { if (pUp) st.pos = adx > p.adxMin ? 1 : 0; }
  else if (pUp && adx > p.adxMin) st.pos = 1;
  else if (mUp && adx > p.adxMin) st.pos = -1;
  return st.pos;
}
