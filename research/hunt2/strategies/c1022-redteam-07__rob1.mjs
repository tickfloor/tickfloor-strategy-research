// Spec: research/hunt2/campaign-1022/prereg-redteam.json (c1022-redteam-07). Frozen before code.
export const meta = {
  id: "c1022-redteam-07__rob1",
  name: "Double sort: bottom-half BTC-beta intersected with top-half 4-week momentum (-25%)",
  family: "equity-factors",
  source: "c1022/redteam",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "monthly",
  params: { betaWindow: 68, momLookback: 28, need: 70, minNames: 8, minHold: 3 },
};

// ret over the last w bars ending at the latest bar, oldest first.
function endRets(b, w) {
  const L = b.length, out = [];
  for (let k = L - w; k < L; k++) out.push(b[k].close / b[k - 1].close - 1);
  return out;
}

export function rank(universe, t, ctx) {
  const { betaWindow, momLookback, need, minNames, minHold } = ctx.params;
  const syms = Object.keys(universe).sort();
  const ew = () => { const w = {}; for (const s of syms) w[s] = 1 / syms.length; return w; };
  const q = syms.filter((s) => universe[s].length >= need);
  const n = q.length;
  if (n < minNames) return ew();

  const ref = endRets(universe.BTCUSDT, betaWindow);
  const mr = ref.reduce((a, b) => a + b, 0) / betaWindow;
  let vr = 0;
  for (const r of ref) vr += (r - mr) ** 2;

  const beta = {}, mom = {};
  for (const s of q) {
    const rs = endRets(universe[s], betaWindow);
    const ms = rs.reduce((a, b) => a + b, 0) / betaWindow;
    let cov = 0;
    for (let m = 0; m < betaWindow; m++) cov += (rs[m] - ms) * (ref[m] - mr);
    beta[s] = cov / vr;
    const b = universe[s], e = b.length - 1;
    mom[s] = b[e].close / b[e - momLookback].close - 1;
  }

  const byBeta = q.slice().sort((a, b) => beta[a] - beta[b] || (a < b ? -1 : 1));
  const byMom = q.slice().sort((a, b) => mom[b] - mom[a] || (a < b ? -1 : 1));
  const LB = new Set(byBeta.slice(0, Math.floor(n / 2)));
  const HM = new Set(byMom.slice(0, Math.ceil(n / 2)));
  let H = [...LB].filter((s) => HM.has(s));
  if (H.length < minHold) H = [...LB];

  const w = {};
  for (const s of H) w[s] = 1 / H.length;
  return w;
}
