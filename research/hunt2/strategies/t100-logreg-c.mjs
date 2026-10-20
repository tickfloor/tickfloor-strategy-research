// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-logreg-c",
  "name": "Rainbow-style log regression: long below -0.5 sigma of a rolling 730-day log fit, exit above +0.5 sigma (crypto 1d x18)",
  "family": "top100-1006",
  "source": "Bitcoin Rainbow Chart (log-regression bands), crypto-media staple; 730-day rolling form so it is causal",
  "assetClass": "crypto",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "n": 730,
    "enter": -0.5,
    "exit": 0.5
  },
  "warmup": 729
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const N = P.n;
  if (i < N - 1) return 0;
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (let k = 0; k < N; k++) { const y = Math.log(bars[i - N + 1 + k].close); sx += k; sy += y; sxy += k * y; sxx += k * k; }
  const slope = (N * sxy - sx * sy) / (N * sxx - sx * sx), icpt = (sy - slope * sx) / N;
  let ss = 0;
  for (let k = 0; k < N; k++) { const e = Math.log(bars[i - N + 1 + k].close) - (icpt + slope * k); ss += e * e; }
  const sd = Math.sqrt(ss / (N - 2));
  if (!(sd > 0)) return 0;
  const z = (Math.log(b.close) - (icpt + slope * (N - 1))) / sd;
  if (s.pos === undefined) s.pos = 0;
  if (s.pos === 0 && z < P.enter) s.pos = 1; else if (s.pos === 1 && z > P.exit) s.pos = 0;
  return s.pos;
}
