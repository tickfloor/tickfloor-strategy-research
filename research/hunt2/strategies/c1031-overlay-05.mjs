// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-05). Engle (1982) Econometrica 50(4); Bollerslev (1986) J. Econometrics 31(3)
export const meta = {
  id: "c1031-overlay-05",
  name: "Crypto volatility-expansion brake: a coin goes to cash while its 10-day volatility is more than twice its 60-day volatility",
  family: "volatility",
  source: "c1031/overlay",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "daily",
  longShort: false,
  params: { shortWin: 10, longWin: 60, ratioMax: 2, need: 61 },
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
  const rets = (b, from, to) => {
    const out = [];
    for (let k = from; k <= to; k++) out.push(b[k].close / b[k - 1].close - 1);
    return out;
  };
  const w = {};
  for (const s of syms) {
    const b = universe[s];
    const e = b.length - 1;
    const sig10 = sampleStd(rets(b, e - p.shortWin + 1, e));
    const sig60 = sampleStd(rets(b, e - p.longWin + 1, e));
    const expanded = sig60 !== 0 && sig10 > p.ratioMax * sig60;
    w[s] = (expanded ? 0 : 1) / N;
  }
  return w;
}
