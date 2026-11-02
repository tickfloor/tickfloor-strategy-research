// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-04). Engle (1982) Econometrica 50(4); Schwert (1989) JF 44(5)
export const meta = {
  id: "c1031-overlay-04",
  name: "Own down-shock stand-down: a large cap that falls more than 3 sigma in a day is held at zero for the next 5 bars",
  family: "stop-exit",
  source: "c1031/overlay",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "daily",
  longShort: false,
  params: { sigmaWindow: 63, shockSigmas: 3, standDownBars: 5, need: 70 },
};

function sampleStd(xs) {
  const n = xs.length;
  let m = 0;
  for (const x of xs) m += x;
  m /= n;
  let v = 0;
  for (const x of xs) v += (x - m) * (x - m);
  return Math.sqrt(v / (n - 1));
}

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length >= p.need);
  const N = syms.length;
  if (N === 0) return {};
  const ret = (b, k) => b[k].close / b[k - 1].close - 1;
  const w = {};
  for (const s of syms) {
    const b = universe[s];
    const e = b.length - 1;
    let shock = false;
    for (let k = e - p.standDownBars + 1; k <= e && !shock; k++) {
      const past = [];
      for (let j = k - p.sigmaWindow; j <= k - 1; j++) past.push(ret(b, j));
      if (ret(b, k) < -p.shockSigmas * sampleStd(past)) shock = true;
    }
    w[s] = (shock ? 0 : 1) / N;
  }
  return w;
}
