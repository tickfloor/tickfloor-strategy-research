// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-18). Frozen before code.
// Cloud under bar i = Senkou A/B computed at bar i-shift. Future cloud and Chikou use bar i. Long only.
export const meta = {
  id: "c1022-retail-18",
  name: "Ichimoku full five-line confirmation (price, TK, cloud, future cloud, Chikou)",
  family: "trend",
  source: "c1022/retail",
  assetClass: "crypto",
  timeframe: "1d",
  params: { tenkan: 9, kijun: 26, senkou: 52, shift: 26 },
};

function mid(ctx, n, j) {
  const r = ctx.donchian(n, j);
  return (r.upper + r.lower) / 2;
}

export function signal(bars, i, ctx) {
  const p = ctx.params, S = ctx.state, c = bars[i].close;
  if (S.pos === undefined) S.pos = 0;
  const j = i - p.shift;
  if (j < p.senkou - 1) return 0;

  const tenkan = mid(ctx, p.tenkan, i), kijun = mid(ctx, p.kijun, i);
  const futA = (tenkan + kijun) / 2, futB = mid(ctx, p.senkou, i);
  const cloudA = (mid(ctx, p.tenkan, j) + mid(ctx, p.kijun, j)) / 2, cloudB = mid(ctx, p.senkou, j);
  const top = Math.max(cloudA, cloudB), bot = Math.min(cloudA, cloudB);

  if (S.pos === 1) {
    if (c < kijun || c < bot) S.pos = 0;
    return S.pos;
  }
  if (c > top && tenkan > kijun && futA > futB && c > bars[i - p.shift].close) S.pos = 1;
  return S.pos;
}
