// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-26). Frozen before code.
// ADX(14) Wilder (RMA seeded with the sum/mean of the first 14 values). ADX must have been below base
// within the 5 bars before i, then rise for risingBars bars (risingBars=3 gives ADX[i] > ADX[i-1] > ADX[i-2]). Long only.
export const meta = {
  id: "c1022-retail-26",
  name: "ADX turning up from below 20 with +DI leading (Wilder trend-start)",
  family: "trend",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { adx: 14, base: 20, risingBars: 3 },
};

function newAdx() {
  return { cnt: 0, sTR: 0, sP: 0, sM: 0, dxCnt: 0, dxSum: 0, adx: NaN, pdi: [], mdi: [], adxA: [] };
}

// one bar of Wilder ADX; X.pdi[i], X.mdi[i], X.adxA[i] are NaN until seeded
function adxStep(X, bars, i, n) {
  X.pdi.push(NaN); X.mdi.push(NaN); X.adxA.push(NaN);
  if (i === 0) return;
  const b = bars[i], p = bars[i - 1];
  const up = b.high - p.high, dn = p.low - b.low;
  const pdm = up > dn && up > 0 ? up : 0;
  const mdm = dn > up && dn > 0 ? dn : 0;
  const tr = Math.max(b.high - b.low, Math.abs(b.high - p.close), Math.abs(b.low - p.close));
  X.cnt++;
  if (X.cnt <= n) { X.sTR += tr; X.sP += pdm; X.sM += mdm; }
  else { X.sTR = X.sTR - X.sTR / n + tr; X.sP = X.sP - X.sP / n + pdm; X.sM = X.sM - X.sM / n + mdm; }
  if (X.cnt < n) return;
  const pdi = X.sTR > 0 ? (100 * X.sP) / X.sTR : 0;
  const mdi = X.sTR > 0 ? (100 * X.sM) / X.sTR : 0;
  X.pdi[i] = pdi; X.mdi[i] = mdi;
  const ds = pdi + mdi;
  const dx = ds > 0 ? (100 * Math.abs(pdi - mdi)) / ds : 0;
  X.dxCnt++;
  if (X.dxCnt <= n) X.dxSum += dx;
  if (X.dxCnt < n) return;
  X.adx = X.dxCnt === n ? X.dxSum / n : (X.adx * (n - 1) + dx) / n;
  X.adxA[i] = X.adx;
}

export function signal(bars, i, ctx) {
  const p = ctx.params, S = ctx.state;
  if (S.X === undefined) { S.X = newAdx(); S.pos = 0; }
  adxStep(S.X, bars, i, p.adx);
  if (i < 5) return 0;
  const A = S.X.adxA, pd = S.X.pdi, md = S.X.mdi;

  if (S.pos === 1) {
    if (md[i] > pd[i]) S.pos = 0;
    return S.pos;
  }
  // "below base in the 5 bars before i" (window length 5 is fixed by the rule text)
  let wasLow = false;
  for (let k = i - 5; k <= i - 1; k++) if (A[k] < p.base) wasLow = true;
  let rising = true;
  for (let k = 0; k < p.risingBars - 1; k++) if (!(A[i - k] > A[i - k - 1])) rising = false;
  if (wasLow && rising && pd[i] > md[i]) S.pos = 1;
  return S.pos;
}
