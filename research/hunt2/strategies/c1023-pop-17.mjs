// c1023 pop chunk 2. Wyckoff spring (Pruden 2007; StockCharts 'Wyckoff Method').
export const meta = {
  id: "c1023-pop-17",
  name: "Wyckoff spring: undercut of the 30-day low on sub-1.5x volume, close back inside within 3 bars, target the range top",
  family: "mean_reversion",
  source: "c1023/pop",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { range: 30, recoverBars: 3, volMult: 1.5, volSma: 50, maxBars: 30 },
};

export function signal(bars, i, ctx) {
  const S = ctx.state;
  const p = ctx.params;
  if (S.pos === undefined) { S.pos = 0; S.entry = -1; S.stop = 0; S.target = 0; }
  if (S.pos === 1) {
    const c = bars[i].close;
    if (c < S.stop || c >= S.target || i - S.entry >= p.maxBars) { S.pos = 0; return 0; }
    return 1;
  }
  // flat: spring bar s must be in {i-2, i-1, i}; first qualifying s wins
  for (let s = i - p.recoverBars + 1; s <= i; s++) {
    if (s - p.range < 0) continue;
    let L = Infinity, H = -Infinity;
    for (let k = s - p.range; k < s; k++) {
      if (bars[k].low < L) L = bars[k].low;
      if (bars[k].high > H) H = bars[k].high;
    }
    if (!(bars[s].low < L)) continue;
    const vs = ctx.sma("volume", p.volSma, s - 1);
    if (!(bars[s].volume < p.volMult * vs)) continue;
    if (!(bars[i].close > L)) continue;
    let ok = true;
    for (let k = s; k < i; k++) if (bars[k].close > L) { ok = false; break; }
    if (!ok) continue;
    let mn = Infinity;
    for (let k = s; k <= i; k++) if (bars[k].low < mn) mn = bars[k].low;
    if (mn !== bars[s].low) continue;
    S.pos = 1; S.entry = i; S.stop = bars[s].low; S.target = H;
    return 1;
  }
  return 0;
}
