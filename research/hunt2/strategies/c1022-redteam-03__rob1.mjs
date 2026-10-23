// Spec: research/hunt2/campaign-1022/prereg-redteam.json (c1022-redteam-03). Frozen before code.
export const meta = {
  id: "c1022-redteam-03__rob1",
  name: "Low beta to the equal-weight crypto index (ex self), bottom half, 70th-percentile hold buffer (-25%)",
  family: "equity-factors",
  source: "c1022/redteam",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "monthly",
  params: { window: 68, need: 70, minNames: 8, holdPct: 0.7, selectPct: 0.5 },
};

// ret over the last w bars ending at the latest bar, oldest first.
function endRets(b, w) {
  const L = b.length, out = [];
  for (let k = L - w; k < L; k++) out.push(b[k].close / b[k - 1].close - 1);
  return out;
}

export function rank(universe, t, ctx) {
  const { window, need, minNames, holdPct, selectPct } = ctx.params;
  const syms = Object.keys(universe).sort();
  const ew = () => { const w = {}; for (const s of syms) w[s] = 1 / syms.length; return w; };
  const q = syms.filter((s) => universe[s].length >= need);
  if (ctx.state.H === undefined) ctx.state.H = {};
  const n = q.length;
  if (n < minNames) { ctx.state.H = {}; return ew(); }

  const rets = {};
  for (const s of q) rets[s] = endRets(universe[s], window);
  const beta = {};
  for (const s of q) {
    const others = q.filter((o) => o !== s);
    const idx = [];
    for (let m = 0; m < window; m++) {
      let sum = 0;
      for (const o of others) sum += rets[o][m];
      idx.push(sum / others.length);
    }
    const rs = rets[s];
    const mr = rs.reduce((a, b) => a + b, 0) / window;
    const mi = idx.reduce((a, b) => a + b, 0) / window;
    let cov = 0, vr = 0;
    for (let m = 0; m < window; m++) {
      cov += (rs[m] - mr) * (idx[m] - mi);
      vr += (idx[m] - mi) ** 2;
    }
    beta[s] = cov / vr;
  }

  const order = q.slice().sort((a, b) => beta[a] - beta[b] || (a < b ? -1 : 1));
  const p = {};
  order.forEach((s, i) => { p[s] = i / (n - 1); });

  const H = ctx.state.H;
  for (const s of Object.keys(H)) {
    if (p[s] === undefined || p[s] > holdPct) delete H[s];
  }
  const target = Math.ceil(selectPct * n);
  let size = Object.keys(H).length;
  for (const s of order) {
    if (size >= target) break;
    if (!H[s]) { H[s] = true; size++; }
  }

  const keys = Object.keys(H);
  const w = {};
  for (const s of keys) w[s] = 1 / keys.length;
  return w;
}
