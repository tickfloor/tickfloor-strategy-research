// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-08). Kritzman et al. 2011 absorption ratio shift gate on sector momentum, IEF defensive.
// Harness rejects meta with both assets and universe, so the spec's universe 'ETFS_DAILY' is implied by assets.
export const meta = {
  id: "c1031-etfxs-08",
  name: "Absorption-ratio shift gate on sector momentum (Kritzman et al.), defensive IEF when the shift z > 1",
  family: "volatility",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "IEF"],
  rebalance: "monthly",
  longShort: false,
  params: { window: 250, samples: 12, zThreshold: 1, top: 3 },
};

function retsAt(b, off, n) {
  const e = b.length - 1 - off;
  const out = [];
  for (let k = e - n + 1; k <= e; k++) out.push(b[k].close / b[k - 1].close - 1);
  return out;
}

function mean(a) {
  let s = 0;
  for (const x of a) s += x;
  return s / a.length;
}

function sampleCov(x, y) {
  const mx = mean(x);
  const my = mean(y);
  let s = 0;
  for (let k = 0; k < x.length; k++) s += (x[k] - mx) * (y[k] - my);
  return s / (x.length - 1);
}

function sampleStd(a) {
  return Math.sqrt(sampleCov(a, a));
}

function matVec(M, v) {
  return M.map((row) => row.reduce((a, x, j) => a + x * v[j], 0));
}

function dot(a, b) {
  return a.reduce((s, x, i) => s + x * b[i], 0);
}

function unit(v) {
  const n = Math.sqrt(dot(v, v));
  return v.map((x) => x / n);
}

// Top two eigenvalues of a symmetric matrix by power iteration (100 steps each), second on the deflated matrix.
function eig2(C) {
  const n = C.length;
  let v = unit(new Array(n).fill(1));
  for (let it = 0; it < 100; it++) v = unit(matVec(C, v));
  const l1 = dot(v, matVec(C, v));
  const D = C.map((row, i) => row.map((x, j) => x - l1 * v[i] * v[j]));
  let u = unit(Array.from({ length: n }, (_, i) => (i % 2 === 0 ? 1 : -1)));
  for (let it = 0; it < 100; it++) u = unit(matVec(D, u));
  const l2 = dot(u, matVec(D, u));
  return [l1, l2];
}

// Absorption ratio at offset `off`: (lambda1 + lambda2) / n of the sectors' correlation matrix over `window` bars.
function absorption(B, off, window) {
  const R = B.map((b) => retsAt(b, off, window));
  const n = R.length;
  const sd = R.map((x) => sampleStd(x));
  const C = R.map((x, i) => R.map((y, j) => sampleCov(x, y) / (sd[i] * sd[j])));
  const [l1, l2] = eig2(C);
  return (l1 + l2) / n;
}

export function rank(universe, t, ctx) {
  const p = ctx.params;
  if (!universe.IEF || universe.IEF.length <= 481) return {};
  const syms = Object.keys(universe).filter((s) => s !== "IEF" && universe[s].length > 481).sort();
  if (syms.length < 8) return {};
  const B = syms.map((s) => universe[s]);
  const ARs = [];
  for (let j = 0; j < p.samples; j++) ARs.push(absorption(B, 21 * j, p.window));
  const m = mean(ARs);
  const z = (ARs[0] - m) / sampleStd(ARs);
  if (z > p.zThreshold) return { IEF: 1 };
  const mom = syms.map((s) => {
    const b = universe[s];
    const e = b.length - 1;
    return { s, v: b[e - 21].close / b[e - 252].close - 1 };
  });
  mom.sort((x, y) => y.v - x.v || (x.s < y.s ? -1 : 1));
  const out = {};
  for (const x of mom.slice(0, p.top)) out[x.s] = 1 / p.top;
  return out;
}
