export const meta = {
  id: "c1022-acad-23",
  name: "CTA-style MACD ensemble trend, vol-targeted, wide US stocks (Baz et al.)",
  family: "trend",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "weekly",
  params: { pairs: [[8, 24], [16, 48], [32, 96]], priceVolBars: 63, normBars: 252, volBars: 60, targetVol: 0.2, maxWeight: 0.05 },
};

function emaSeries(c, n) {
  const out = new Array(c.length).fill(NaN);
  if (c.length < n) return out;
  let sma = 0;
  for (let k = 0; k < n; k++) sma += c[k];
  out[n - 1] = sma / n;
  const a = 2 / (n + 1);
  for (let k = n; k < c.length; k++) out[k] = a * c[k] + (1 - a) * out[k - 1];
  return out;
}

function stdArr(xs) {
  const n = xs.length;
  let m = 0;
  for (const x of xs) m += x;
  m /= n;
  let s = 0;
  for (const x of xs) s += (x - m) * (x - m);
  return Math.sqrt(s / (n - 1));
}

// Raw vol-targeted long-only trend weight for one name (before the 1/N split and the caps).
function ctaRaw(b, p) {
  const c = b.map((x) => x.close);
  const T = c.length - 1;
  const P1 = [0];
  const P2 = [0];
  for (let k = 0; k < c.length; k++) {
    P1.push(P1[k] + c[k]);
    P2.push(P2[k] + c[k] * c[k]);
  }
  const pstd = (a, e) => {
    const m = e - a + 1;
    const s1 = P1[e + 1] - P1[a];
    const s2 = P2[e + 1] - P2[a];
    return Math.sqrt(Math.max(0, (s2 - (s1 * s1) / m) / (m - 1)));
  };
  let acc = 0;
  for (const [S, L] of p.pairs) {
    const es = emaSeries(c, S);
    const el = emaSeries(c, L);
    const ys = [];
    for (let k = T - p.normBars + 1; k <= T; k++) ys.push((es[k] - el[k]) / pstd(k - p.priceVolBars + 1, k));
    const z = ys[ys.length - 1] / stdArr(ys);
    acc += (z * Math.exp((-z * z) / 4)) / 0.89;
  }
  const sig = Math.max(0, acc / p.pairs.length);
  const rets = [];
  for (let k = T - p.volBars + 1; k <= T; k++) rets.push(c[k] / c[k - 1] - 1);
  const vol = stdArr(rets) * Math.sqrt(252);
  const r = sig * (p.targetVol / vol);
  return Number.isFinite(r) ? r : 0;
}

// Weights = sig * (0.20 / vol) / N_eligible, rescaled if the sum exceeds 1, then each name capped at maxWeight (no renormalisation after the cap).
export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length > 400);
  const N = syms.length;
  if (N === 0) return {};
  const raw = {};
  let sum = 0;
  for (const s of syms) {
    raw[s] = ctaRaw(universe[s], p) / N;
    sum += raw[s];
  }
  const scale = sum > 1 ? 1 / sum : 1;
  const w = {};
  for (const s of syms) w[s] = Math.min(p.maxWeight, raw[s] * scale);
  return w;
}
