// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-16). Frozen before code.
export const meta = {
  id: "c1022-retail-16",
  name: "Stochastic pop (Bernstein/Steckler): buy %K crossing above 80",
  family: "momentum",
  source: "c1022/retail",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  params: {"stochK": 14, "stochSmooth": 3, "popLevel": 80, "exitLevel": 70, "adx": 14, "adxMax": 20},
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

// Stoch(14,3,3) helpers at arbitrary bar k (NaN until valid).
function fastK(bars, k) {
  if (k < 13) return NaN;
  let hh = -Infinity, ll = Infinity;
  for (let j = k - 13; j <= k; j++) {
    if (bars[j].high > hh) hh = bars[j].high;
    if (bars[j].low < ll) ll = bars[j].low;
  }
  return hh === ll ? 50 : (100 * (bars[k].close - ll)) / (hh - ll);
}
function slowK(bars, k) { return (fastK(bars, k) + fastK(bars, k - 1) + fastK(bars, k - 2)) / 3; }
function dLine(bars, k) { return (slowK(bars, k) + slowK(bars, k - 1) + slowK(bars, k - 2)) / 3; }

export function signal(bars, i, ctx) {
  const s = ctx.state;
  if (s.pos === undefined) s.pos = 0;
  const adx = adxAt(ctx, bars, i);
  if (s.pos === 1) {
    if (slowK(bars, i) < 70) s.pos = 0;
    return s.pos;
  }
  if (i < 1) return 0;
  if (slowK(bars, i - 1) <= 80 && slowK(bars, i) > 80 && adx < 20) s.pos = 1;
  return s.pos;
}
