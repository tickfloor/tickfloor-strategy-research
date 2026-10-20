// SSRN run 4: copy of r25-duration-mom-6040 with the fixed 60% equity weight replaced by half-Kelly: w = clamp(0.5 * mu / sigma2, 0, 1).
// mu = trailing 800-day mean daily return of QQQ, sigma2 = EWMA(0.94) one-day variance over the same window (stands in for GARCH(1,1); declared deviation).
// Until 800 days of history exist the weight is the original fixed 60%. The remainder goes to the same best-126-day-return bond sleeve as the original.
export const meta = {
  id: "ssrn-kelly-dur6040",
  name: "Half-Kelly QQQ with a duration-momentum bond sleeve (QQQ + TLT/IEF/SHY)",
  family: "trend",
  source: "Yu et al. via SSRN top-20 #15 (sizing layer only); prereg research/prereg-2026-10-07-ssrn.md run 4",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "TLT", "IEF", "SHY"],
  rebalance: "monthly",
  params: { need: 128, lag: 2, lookback: 126, equity: 0.6, kWin: 800, kFrac: 0.5, lambda: 0.94 },
};

const EQUITY = new Set(["QQQ", "IWM"]);
function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

export function rank(universe, t, ctx) {
  const { need, lag, lookback, equity, kWin, kFrac, lambda } = ctx.params;
  const syms = Object.keys(universe);
  const eq = syms.find((s) => EQUITY.has(s));
  const sleeve = syms.filter((s) => !EQUITY.has(s));
  if (syms.length !== 4 || !eq || sleeve.length !== 3) return ew(universe);
  const q = universe[eq];
  if (q.length < need) return ew(universe);
  const rows = [];
  for (const s of sleeve) {
    const b = universe[s];
    if (b.length < need) return ew(universe);
    const r = b[b.length - lag].close / b[b.length - lag - lookback].close - 1;
    if (!Number.isFinite(r)) return ew(universe);
    rows.push([s, r]);
  }
  rows.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  let w = equity;
  const e = q.length - lag;
  if (e >= kWin) {
    let mu = 0;
    let s2 = 0;
    for (let k = e - kWin + 1; k <= e; k++) {
      const r = q[k].close / q[k - 1].close - 1;
      mu += r;
      s2 = k === e - kWin + 1 ? r * r : lambda * s2 + (1 - lambda) * r * r;
    }
    mu /= kWin;
    if (!Number.isFinite(mu) || !(s2 > 0)) return ew(universe);
    w = Math.min(1, Math.max(0, (kFrac * mu) / s2));
  }
  return { [eq]: w, [rows[0][0]]: 1 - w };
}
