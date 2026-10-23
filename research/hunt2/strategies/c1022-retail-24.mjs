// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-24). Frozen before code.
// ADX(14) Wilder: RMA seeded with the sum/mean of the first 14 values. Long only.
export const meta = {
  id: "c1022-retail-24",
  name: "Turtle 20/10 Donchian breakout gated by ADX >= 25",
  family: "trend",
  source: "c1022/retail",
  assetClass: "crypto",
  timeframe: "1d",
  params: { entry: 20, exit: 10, adx: 14, adxMin: 25 },
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
  const p = ctx.params, S = ctx.state, b = bars[i];
  if (S.X === undefined) { S.X = newAdx(); S.pos = 0; }
  adxStep(S.X, bars, i, p.adx);
  if (i < p.entry + 1) return 0;
  const adx = S.X.adxA[i], pdi = S.X.pdi[i], mdi = S.X.mdi[i];

  if (S.pos === 1) {
    if (b.close < ctx.donchian(p.exit, i - 1).lower) S.pos = 0;
    return S.pos;
  }
  if (b.close > ctx.donchian(p.entry, i - 1).upper && adx >= p.adxMin && pdi > mdi) S.pos = 1;
  return S.pos;
}
