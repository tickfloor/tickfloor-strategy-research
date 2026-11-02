// c1031 round-4 macro spec c1031-macro-29 (frozen in campaign-1031/prereg-macro.json).
// Source: Bekaert, Hoerova & Lo Duca (2013) Risk, uncertainty and monetary policy, JME 60(7); Fleming, Kirby & Ostdiek (2001) JF 56(1)

export const meta = {
  "id": "c1031-macro-29__rob2",
  "name": "Rate-volatility gate on bonds (MOVE proxy): flat Treasury and credit ETFs when 20-day yield volatility is above its 75th percentile of the past year (+25%)",
  "family": "volatility",
  "source": "c1031/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "TLT",
    "IEF",
    "LQD",
    "AGG"
  ],
  "params": {
    "volN": 20,
    "pctWindow": 315,
    "pct": 0.75
  }
};

// M(id,k) = value known by the close of bar i-k; null when i-k < 0 or no value yet.
const M = (ctx, i, id, k) => (i - k < 0 ? null : ctx.macro(id, i - k));

export function signal(bars, i, ctx) {
  const { volN, pctWindow, pct } = ctx.params;
  if (i < 343) return 0;
  const last = pctWindow - 1 + volN; // newest y index needed (271)
  const y = [];
  for (let k = 0; k <= last; k++) {
    const r = M(ctx, i, "DFII10", k);
    const b = M(ctx, i, "T10YIE", k);
    if (r === null || b === null) return 0;
    y.push(r + b);
  }
  const dy = [];
  for (let k = 0; k < last; k++) dy.push(y[k] - y[k + 1]);
  // rv(j): sample std (n-1) of dy(j..j+volN-1)
  const rv = (j) => {
    let s = 0;
    for (let t = j; t < j + volN; t++) s += dy[t];
    const m = s / volN;
    let ss = 0;
    for (let t = j; t < j + volN; t++) ss += (dy[t] - m) * (dy[t] - m);
    return Math.sqrt(ss / (volN - 1));
  };
  const A = [];
  for (let j = 0; j < pctWindow; j++) A.push(rv(j));
  A.sort((p, q) => p - q);
  const pos = pct * (pctWindow - 1);
  const lo = Math.floor(pos);
  const q = A[lo] + (pos - lo) * (A[lo + 1] - A[lo]);
  return rv(0) < q ? 1 : 0;
}
