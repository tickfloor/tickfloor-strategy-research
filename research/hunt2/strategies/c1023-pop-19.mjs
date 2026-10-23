// c1023 pop chunk 2. Elder Triple Screen (Trading for a Living 1993; Come Into My Trading Room 2002).
export const meta = {
  id: "c1023-pop-19",
  name: "Elder Triple Screen on daily stocks: weekly MACD histogram rising, daily 2-day Force Index dip, buy the break of the prior day's high",
  family: "trend",
  source: "c1023/pop",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { macd: [12, 26, 9], ema: 13, forceEma: 2, atr: 14, atrMult: 1, maxBars: 20 },
};

// Weekly tide from COMPLETE weeks only: MACD(12,26,9) histogram rising. Cached per completed-week count.
function weeklyTide(bars, ctx, S) {
  const W = ctx.resample(bars, "1w");
  const n = W.length && !W[W.length - 1].complete ? W.length - 1 : W.length;
  if (n === S.wN) return S.tide;
  S.wN = n;
  S.tide = false;
  const [f, s, g] = ctx.params.macd;
  if (n < s + g) return false; // review fix: warm-up, no tide until the slow EMA and signal line have full history
  const a1 = 2 / (f + 1), a2 = 2 / (s + 1), a3 = 2 / (g + 1);
  let e1 = W[0].close, e2 = W[0].close, sig = 0;
  let hPrev = NaN, hCur = NaN;
  for (let j = 0; j < n; j++) {
    const c = W[j].close;
    if (j > 0) { e1 = a1 * c + (1 - a1) * e1; e2 = a2 * c + (1 - a2) * e2; }
    const line = e1 - e2;
    sig = j === 0 ? line : a3 * line + (1 - a3) * sig;
    hPrev = hCur;
    hCur = line - sig;
  }
  S.tide = hCur > hPrev;
  return S.tide;
}

export function signal(bars, i, ctx) {
  const S = ctx.state;
  const p = ctx.params;
  if (S.pos === undefined) { S.pos = 0; S.entry = -1; S.fi = undefined; S.wN = -1; S.tide = false; }
  // Force Index EMA(2) over (close - prev close) * volume; fiPrev = FI at bar i-1.
  const fiPrev = S.fi;
  if (i >= 1) {
    const raw = (bars[i].close - bars[i - 1].close) * bars[i].volume;
    const a = 2 / (p.forceEma + 1);
    S.fi = S.fi === undefined ? raw : a * raw + (1 - a) * S.fi;
  }
  const tide = weeklyTide(bars, ctx, S);
  const c = bars[i].close;
  if (S.pos === 1) {
    const e = ctx.ema("close", p.ema, i);
    if (!tide || c < e - ctx.atr(p.atr, i) * p.atrMult || i - S.entry >= p.maxBars) { S.pos = 0; return 0; }
    return 1;
  }
  if (i < 1) return 0;
  const e13 = ctx.ema("close", p.ema, i), e13p = ctx.ema("close", p.ema, i - 1);
  if (tide && e13 > e13p && fiPrev < 0 && c > bars[i - 1].high) {
    S.pos = 1; S.entry = i;
    return 1;
  }
  return 0;
}
