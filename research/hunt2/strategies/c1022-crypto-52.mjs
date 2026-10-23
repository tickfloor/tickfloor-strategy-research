// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-52). Signal mode, long-only.

export const meta = {
  id: "c1022-crypto-52",
  name: "Trend-strength regime by R-squared of the log-price fit: trend-follow when linear, fade when not",
  family: "other",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  params: { win: 90, hiR2: 0.7, loR2: 0.3, sma: 50, rsi: 2, rsiBuy: 10, rsiExit: 60 },
};

export function signal(bars, i, ctx) {
  const { win, hiR2, loR2, sma, rsi, rsiBuy, rsiExit } = ctx.params;
  const s = ctx.state;
  if (s.pos === undefined) s.pos = 0;
  if (i < win - 1) return 0;
  // OLS of ln(close) on bar index over the last win bars
  let sx = 0;
  let sy = 0;
  for (let k = 0; k < win; k++) { sx += k; sy += Math.log(bars[i - win + 1 + k].close); }
  const mx = sx / win;
  const my = sy / win;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let k = 0; k < win; k++) {
    const dx = k - mx;
    const dy = Math.log(bars[i - win + 1 + k].close) - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  const slope = sxy / sxx;
  const r2 = (sxy * sxy) / (sxx * syy);

  if (r2 >= hiR2) {
    s.pos = slope > 0 && bars[i].close > ctx.sma("close", sma, i) ? 1 : 0;
  } else if (r2 <= loR2) {
    const r = ctx.rsi(rsi, i);
    if (s.pos === 0 && r < rsiBuy) s.pos = 1;
    else if (s.pos === 1 && r > rsiExit) s.pos = 0;
  }
  // between the thresholds the prior position is kept
  return s.pos;
}
