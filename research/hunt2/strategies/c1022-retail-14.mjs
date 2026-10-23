// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-14). Frozen before code.
export const meta = {
  id: "c1022-retail-14",
  name: "Bollinger lower-band dip gated by ADX < 20 (range-only mean reversion)",
  family: "mean_reversion",
  source: "c1022/retail",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  params: {"len": 20, "mult": 2, "adx": 14, "adxRange": 20, "adxTrend": 30, "maxHold": 15},
};

function rma(store, key, x, n) {
  const o = store[key] || (store[key] = { sum: 0, cnt: 0, val: NaN });
  o.cnt++;
  if (o.cnt <= n) { o.sum += x; if (o.cnt === n) o.val = o.sum / n; }
  else o.val += (x - o.val) / n;
  return o.val;
}
// Wilder ADX(14), processes bar i once (signal is called for i = 0, 1, ... in order).
function adxAt(ctx, bars, i) {
  const s = ctx.state;
  if (s.adxI === undefined) { s.adxI = 0; s.adx = {}; }
  if (i >= 1 && s.adxI < i) {
    s.adxI = i;
    const b = bars[i], p = bars[i - 1];
    const tr = Math.max(b.high - b.low, Math.abs(b.high - p.close), Math.abs(b.low - p.close));
    const up = b.high - p.high, dn = p.low - b.low;
    const pdm = up > dn && up > 0 ? up : 0;
    const mdm = dn > up && dn > 0 ? dn : 0;
    const sTR = rma(s.adx, "tr", tr, 14), sP = rma(s.adx, "p", pdm, 14), sM = rma(s.adx, "m", mdm, 14);
    if (!Number.isNaN(sTR) && sTR > 0) {
      const pdi = (100 * sP) / sTR, mdi = (100 * sM) / sTR;
      const den = pdi + mdi;
      const dx = den > 0 ? (100 * Math.abs(pdi - mdi)) / den : 0;
      s.adx.last = rma(s.adx, "adx", dx, 14);
    }
  }
  return s.adx.last === undefined ? NaN : s.adx.last;
}

export function signal(bars, i, ctx) {
  const s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.entry = 0; }
  const adx = adxAt(ctx, bars, i);
  const c = bars[i].close;
  const mid = ctx.sma("close", 20, i), sd = ctx.rollingStd("close", 20, i);
  const lower = mid - 2 * sd;
  if (s.pos === 1) {
    if (c >= mid || adx > 30 || i - s.entry >= 15) s.pos = 0;
  } else if (adx < 20 && c < lower) {
    s.pos = 1; s.entry = i;
  }
  return s.pos;
}
