// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-17). Frozen before code.
// Pair: L1 = previous confirmed fractal low, L2 = newest (confirmed at L2+2). A divergence arms a pending
// entry; a newer divergence replaces an unexpired one. Long only.
export const meta = {
  id: "c1022-retail-17",
  name: "Stochastic bullish divergence (price lower low, %K higher low)",
  family: "mean_reversion",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { stochK: 14, stochSmooth: 3, oversold: 20, minGap: 10, maxGap: 40, exitK: 80, maxHold: 15, entryWindow: 10 },
};

// mean of arr[i-n+1..i]; NaN unless all n values exist
function avgLast(arr, i, n) {
  if (i < n - 1) return NaN;
  let s = 0;
  for (let k = i - n + 1; k <= i; k++) {
    if (!Number.isFinite(arr[k])) return NaN;
    s += arr[k];
  }
  return s / n;
}

export function signal(bars, i, ctx) {
  const p = ctx.params, S = ctx.state, b = bars[i];
  if (S.fk === undefined) {
    S.fk = []; S.sk = []; S.d = [];
    S.lastF = -1; S.pendL2 = -1; S.pos = 0; S.entry = -1; S.tradeL2 = -1;
  }
  let fk = NaN;
  if (i >= p.stochK - 1) {
    const r = ctx.donchian(p.stochK, i);
    fk = r.upper === r.lower ? 50 : (100 * (b.close - r.lower)) / (r.upper - r.lower);
  }
  S.fk.push(fk);
  S.sk.push(avgLast(S.fk, i, p.stochSmooth));
  S.d.push(avgLast(S.sk, i, p.stochSmooth));

  // fractal low at k = i-2 (uses bars k-2..k+2, all <= i), confirmed on bar i
  const k = i - 2;
  if (k >= 2) {
    const lo = (j) => bars[j].low;
    if (lo(k) < lo(k - 1) && lo(k) < lo(k - 2) && lo(k) < lo(k + 1) && lo(k) < lo(k + 2)) {
      const L1 = S.lastF;
      S.lastF = k;
      const gap = k - L1;
      if (L1 >= 0 && gap >= p.minGap && gap <= p.maxGap && lo(k) < lo(L1) &&
          S.sk[k] > S.sk[L1] && S.sk[L1] < p.oversold) S.pendL2 = k;
    }
  }
  if (S.pendL2 >= 0 && i > S.pendL2 + 2 + p.entryWindow) S.pendL2 = -1;

  if (S.pos === 1) {
    if (S.sk[i] > p.exitK || b.close < bars[S.tradeL2].low || i - S.entry >= p.maxHold) S.pos = 0;
    return S.pos;
  }
  const cross = S.sk[i - 1] <= S.d[i - 1] && S.sk[i] > S.d[i];
  if (S.pendL2 >= 0 && cross) {
    S.pos = 1; S.entry = i; S.tradeL2 = S.pendL2; S.pendL2 = -1;
  }
  return S.pos;
}
