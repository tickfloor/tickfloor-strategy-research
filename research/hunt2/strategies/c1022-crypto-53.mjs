// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-53). Frozen before code.
export const meta = {
  id: "c1022-crypto-53",
  name: "Hurst-exponent regime switch (persistence vs anti-persistence)",
  family: "other",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  longShort: true,
  holdBars: 5,
  params: { win: 120, hi: 0.55, lo: 0.45, mom: 20, hold: 5 },
};

// H = OLS slope of ln(avg R/S) on ln(n), n in {30, 60, 120}, over the last `win` daily log returns.
// Each n splits the window into win/n non-overlapping chunks; a chunk with zero std makes H NaN (flat bar).
function hurst(bars, i, win) {
  const rets = [];
  for (let k = i - win + 1; k <= i; k++) rets.push(Math.log(bars[k].close / bars[k - 1].close));
  const xs = [];
  const ys = [];
  for (const n of [30, 60, 120]) {
    const chunks = win / n;
    let sumRS = 0;
    for (let c = 0; c < chunks; c++) {
      const seg = rets.slice(c * n, (c + 1) * n);
      let m = 0;
      for (const x of seg) m += x;
      m /= n;
      let cum = 0;
      let mx = -Infinity;
      let mn = Infinity;
      let ss = 0;
      for (const x of seg) {
        cum += x - m;
        if (cum > mx) mx = cum;
        if (cum < mn) mn = cum;
        ss += (x - m) * (x - m);
      }
      const sd = Math.sqrt(ss / n);
      if (sd === 0) return NaN;
      sumRS += (mx - mn) / sd;
    }
    xs.push(Math.log(n));
    ys.push(Math.log(sumRS / chunks));
  }
  const mxv = (xs[0] + xs[1] + xs[2]) / 3;
  const myv = (ys[0] + ys[1] + ys[2]) / 3;
  let sxy = 0;
  let sxx = 0;
  for (let j = 0; j < 3; j++) {
    sxy += (xs[j] - mxv) * (ys[j] - myv);
    sxx += (xs[j] - mxv) * (xs[j] - mxv);
  }
  return sxy / sxx;
}

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < p.win) return 0;
  const H = hurst(bars, i, p.win);
  if (Number.isNaN(H)) return 0;
  const r = bars[i].close / bars[i - p.mom].close - 1;
  const sg = r > 0 ? 1 : r < 0 ? -1 : 0;
  if (H >= p.hi) return sg;
  if (H <= p.lo) return sg === 0 ? 0 : -sg;
  return 0;
}
