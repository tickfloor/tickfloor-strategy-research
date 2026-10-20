// Spec: docs/research/hunt-1003/codex/specs.json (h3-etf-mass-index-bulge). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-etf-mass-index-bulge",
  name: "Does the Mass Index reversal bulge work on ETFs?",
  family: "indicator-mass-index",
  source: "https://www.tradingview.com/support/solutions/43000589169-mass-index/",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ","DIA","XLK","XLF","XLE","XLV","XLI","XLP","XLY","XLU","XLB","XLC","VNQ","TLT","IEF","SHY","LQD","HYG","AGG","GLD","SLV","USO","UNG","DBC","UUP"],
  longShort: false,
  params: { emaLength: 9, sumLength: 25, armLevel: 27, releaseLevel: 26.5, warmupBars: 64, maxHoldBars: 20, stopAtr: 2 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, s = ctx.state, n = p.emaLength, a = 2 / (n + 1);
  if (s.pos === undefined) { s.pos = 0; s.armed = false; s.r = []; s.e1 = NaN; s.e1s = []; s.e2 = NaN; s.win = ctx.rolling(p.sumLength); }
  const b = bars[i];
  const range = b.high - b.low;
  // E1: EMA9 of range seeded by mean of first 9 ranges
  if (i < n) { s.r.push(range); if (i === n - 1) s.e1 = s.r.reduce((x, y) => x + y, 0) / n; }
  else s.e1 = s.e1 + a * (range - s.e1);
  // E2: EMA9 of finite E1 seeded by mean of first 9 E1 values
  if (isFinite(s.e1)) {
    if (s.e1s.length < n) { s.e1s.push(s.e1); if (s.e1s.length === n) s.e2 = s.e1s.reduce((x, y) => x + y, 0) / n; }
    else s.e2 = s.e2 + a * (s.e1 - s.e2);
  }
  let mass = NaN, ok = isFinite(s.e2) && s.e2 > 0;
  if (isFinite(s.e2)) {
    if (s.e2 > 0) { s.win.push(s.e1 / s.e2); if (s.win.full()) mass = s.win.sum(); }
    else s.armed = false;
  }
  const atr = ctx.atr(14, i);
  if (s.pos === 1) {
    if (b.close <= s.entry - p.stopAtr * s.eAtr || i - s.eIdx >= p.maxHoldBars) { s.pos = 0; s.armed = false; return 0; }
    return 1;
  }
  if (i < p.warmupBars || !ok || !isFinite(mass) || !isFinite(atr)) return 0;
  if (!s.armed) { if (mass > p.armLevel) s.armed = true; return 0; }
  if (mass <= p.releaseLevel) {
    s.armed = false;
    if (ctx.ema("close", 9, i) < ctx.ema("close", 9, i - 1)) { s.pos = 1; s.entry = b.close; s.eAtr = atr; s.eIdx = i; return 1; }
  }
  return 0;
}
