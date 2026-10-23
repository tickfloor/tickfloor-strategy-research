// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-19). Frozen before code.
// Uptrend = close above the cloud (cloud at bar i = Senkou A/B from bar i-shift) and Tenkan > Kijun. Long only.
export const meta = {
  id: "c1022-retail-19",
  name: "Ichimoku Kijun-sen bounce in an uptrend",
  family: "momentum",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { tenkan: 9, kijun: 26, senkou: 52, shift: 26, touchTol: 0.005, stopTol: 0.01, maxHold: 20 },
};

function mid(ctx, n, j) {
  const r = ctx.donchian(n, j);
  return (r.upper + r.lower) / 2;
}

export function signal(bars, i, ctx) {
  const p = ctx.params, S = ctx.state, b = bars[i];
  if (S.pos === undefined) { S.pos = 0; S.entry = -1; }
  const j = i - p.shift;
  if (j < p.senkou - 1) return 0;

  const tenkan = mid(ctx, p.tenkan, i), kijun = mid(ctx, p.kijun, i);
  const cloudA = (mid(ctx, p.tenkan, j) + mid(ctx, p.kijun, j)) / 2, cloudB = mid(ctx, p.senkou, j);
  const top = Math.max(cloudA, cloudB), bot = Math.min(cloudA, cloudB);

  if (S.pos === 1) {
    if (b.close < kijun * (1 - p.stopTol) || b.close < bot || i - S.entry >= p.maxHold) S.pos = 0;
    return S.pos;
  }
  const uptrend = b.close > top && tenkan > kijun;
  const low3 = Math.min(bars[i - 2].low, bars[i - 1].low, b.low);
  if (uptrend && low3 <= kijun * (1 + p.touchTol) && b.close > kijun && b.close > bars[i - 1].close) {
    S.pos = 1; S.entry = i;
  }
  return S.pos;
}
