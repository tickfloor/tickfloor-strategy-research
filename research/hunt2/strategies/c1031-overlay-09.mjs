// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-09), frozen before code.
export const meta = {
  id: "c1031-overlay-09",
  name: "Crypto correlation-spike halving: cut every coin to half weight when the 30-day average pairwise correlation exceeds 0.70",
  family: "stop-exit",
  source: "c1031/overlay",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { corrWin: 30, corrMax: 0.7, minNames: 6, need: 31 },
};

const rets = (b) => {
  const r = new Array(b.length).fill(NaN);
  for (let k = 1; k < b.length; k++) r[k] = b[k].close / b[k - 1].close - 1;
  return r;
};

const pearson = (x, y) => {
  const n = x.length;
  const mx = x.reduce((a, v) => a + v, 0) / n;
  const my = y.reduce((a, v) => a + v, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let k = 0; k < n; k++) {
    const dx = x[k] - mx, dy = y[k] - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  return sxy / Math.sqrt(sxx * syy);
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length >= p.need);
  const N = syms.length;
  if (N === 0) return {};
  const w = {};
  if (N < p.minNames) {
    for (const s of syms) w[s] = 1 / N;
    return w;
  }
  // ponytail: a pair with zero variance over the window has no correlation (NaN); it is skipped.
  const R = syms.map((s) => rets(universe[s]).slice(-p.corrWin));
  let sum = 0, cnt = 0;
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const c = pearson(R[i], R[j]);
      if (Number.isFinite(c)) { sum += c; cnt++; }
    }
  }
  const avgCorr = sum / cnt;
  const m = avgCorr > p.corrMax ? 0.5 : 1;
  for (const s of syms) w[s] = m / N;
  return w;
}
