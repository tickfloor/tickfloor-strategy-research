// SSRN run 4: copy of r25-qqq-agg-volmanaged with the equity weight replaced by half-Kelly: w = clamp(0.5 * mu / sigma2, 0, 1).
// mu = trailing 800-day mean daily return of the equity ETF, sigma2 = EWMA(0.94) one-day variance over the same window (stands in for the paper's GARCH(1,1); declared deviation).
// Until 800 days of history exist the weight is the original volatility-target rule, so the two differ only once the Kelly input is defined. Remainder in the bond ETF.
export const meta = {
  id: "ssrn-kelly-qqq-agg__rob1",
  name: "Half-Kelly QQQ with the remainder in AGG (2005+) (-25%)",
  family: "volatility",
  source: "Yu et al. via SSRN top-20 #15 (sizing layer only); prereg research/prereg-2026-10-07-ssrn.md run 4",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "AGG"],
  rebalance: "monthly",
  params: { need: 18, lag: 2, window: 16, targetVar: 0.04, kWin: 800, kFrac: 0.5, lambda: 0.94 },
};

const EQUITY = new Set(["QQQ", "IWM"]);
function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

export function rank(universe, t, ctx) {
  const { need, lag, window, targetVar, kWin, kFrac, lambda } = ctx.params;
  const syms = Object.keys(universe);
  const eq = syms.find((s) => EQUITY.has(s));
  const bd = syms.find((s) => !EQUITY.has(s));
  if (syms.length !== 2 || !eq || !bd) return ew(universe);
  const b = universe[eq];
  if (b.length < need) return ew(universe);
  const e = b.length - lag;
  let w;
  if (e >= kWin) {
    let mu = 0;
    let s2 = 0;
    for (let k = e - kWin + 1; k <= e; k++) {
      const r = b[k].close / b[k - 1].close - 1;
      mu += r;
      s2 = k === e - kWin + 1 ? r * r : lambda * s2 + (1 - lambda) * r * r;
    }
    mu /= kWin;
    if (!Number.isFinite(mu) || !(s2 > 0)) return ew(universe);
    w = Math.min(1, Math.max(0, (kFrac * mu) / s2));
  } else {
    const r = [];
    for (let k = e - window + 1; k <= e; k++) r.push(b[k].close / b[k - 1].close - 1);
    const m = r.reduce((p, q) => p + q, 0) / r.length;
    const v = (r.reduce((p, q) => p + (q - m) ** 2, 0) / (r.length - 1)) * 252;
    if (!Number.isFinite(v)) return ew(universe);
    w = v > 0 ? Math.min(1, targetVar / v) : 1;
  }
  return { [eq]: w, [bd]: 1 - w };
}
