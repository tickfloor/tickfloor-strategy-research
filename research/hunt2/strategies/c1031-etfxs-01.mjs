// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-01). Maillard, Roncalli & Teiletche 2010 (equal risk contribution).
// Harness rejects meta with both assets and universe, so the spec's universe 'ETFS_DAILY' is implied by assets.
export const meta = {
  id: "c1031-etfxs-01",
  name: "Equal-risk-contribution (true risk parity) across 9 asset-class ETFs, 126-day covariance, monthly",
  family: "volatility",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "TLT", "IEF", "LQD", "HYG", "GLD", "DBC", "VNQ"],
  rebalance: "monthly",
  longShort: false,
  params: { window: 126, iterations: 200 },
};

// Daily returns for the n bars ending at index (e - off), e = last bar of b.
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

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length > p.window + 1).sort();
  const N = syms.length;
  if (N < 5) return {};
  const R = syms.map((s) => retsAt(universe[s], 0, p.window));
  const S = R.map((x) => R.map((y) => sampleCov(x, y)));
  let w = new Array(N).fill(1 / N);
  for (let it = 0; it < p.iterations; it++) {
    const v = S.map((row) => row.reduce((acc, Sij, j) => acc + Sij * w[j], 0));
    const sp2 = w.reduce((acc, wi, i) => acc + wi * v[i], 0);
    const next = w.map((wi, i) => {
      const RC = wi * v[i];
      return RC > 0 ? wi * Math.sqrt((sp2 / N) / RC) : wi;
    });
    const tot = next.reduce((a, b) => a + b, 0);
    w = next.map((x) => x / tot);
  }
  const out = {};
  syms.forEach((s, i) => { out[s] = w[i]; });
  return out;
}
