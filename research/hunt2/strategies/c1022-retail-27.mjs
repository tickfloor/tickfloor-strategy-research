// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-27). Frozen before code.
// Entry = DI cross with ADX > adxMin. ADX peak exit (ADX > peak and falling) blocks re-entry until ADX < adxMin.
// A DI-cross exit does not block. Long only.
export const meta = {
  id: "c1022-retail-27",
  name: "DI-cross trend with ADX peak exit (exhaustion above 40)",
  family: "trend",
  source: "c1022/retail",
  assetClass: "crypto",
  timeframe: "1d",
  params: { adx: 14, adxMin: 25, peak: 40 },
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
  if (S.X === undefined) { S.X = newAdx(); S.pos = 0; S.blocked = false; }
  adxStep(S.X, bars, i, p.adx);
  const A = S.X.adxA, pdi = S.X.pdi[i], mdi = S.X.mdi[i], adx = A[i];
  if (Number.isFinite(adx) && adx < p.adxMin) S.blocked = false;

  if (S.pos === 1) {
    if (adx > p.peak && adx < A[i - 1]) { S.pos = 0; S.blocked = true; }
    else if (mdi > pdi) S.pos = 0;
    return S.pos;
  }
  if (!S.blocked && pdi > mdi && adx > p.adxMin) S.pos = 1;
  return S.pos;
}
