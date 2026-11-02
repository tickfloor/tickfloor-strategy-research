// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-07). Murphy (1999) Technical Analysis of the Financial Markets; Bulkowski (2005) Encyclopedia of Chart Patterns 2nd ed.
export const meta = {
  id: "c1031-overlay-07",
  name: "Reversal-bar stand-down: an ETF goes to cash for 3 bars after a wide-range bar that closes at its low",
  family: "stop-exit",
  source: "c1031/overlay",
  assetClass: "etf",
  timeframe: "1d",
  universe: "ETFS_DAILY",
  rebalance: "daily",
  longShort: false,
  params: { atrWin: 20, rangeMult: 2, closeFrac: 0.2, standDownBars: 3, need: 25 },
};

// true range of bar j (needs bar j-1)
function trueRange(b, j) {
  const x = b[j];
  const pc = b[j - 1].close;
  return Math.max(x.high - x.low, Math.abs(x.high - pc), Math.abs(x.low - pc));
}

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length >= p.need);
  const N = syms.length;
  if (N === 0) return {};
  const w = {};
  for (const s of syms) {
    const b = universe[s];
    const e = b.length - 1;
    let flush = false;
    for (let k = e - p.standDownBars + 1; k <= e && !flush; k++) {
      let sum = 0;
      for (let j = k - p.atrWin; j <= k - 1; j++) sum += trueRange(b, j);
      const atr = sum / p.atrWin;
      const x = b[k];
      const range = x.high - x.low;
      if (range > p.rangeMult * atr && x.close <= x.low + p.closeFrac * range && x.close < b[k - 1].close) flush = true;
    }
    w[s] = (flush ? 0 : 1) / N;
  }
  return w;
}
