// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-16). 12-1 momentum walked down the ranking, skipping any ETF correlated above the cap with a holding.
export const meta = {
  id: "c1031-etfxs-16",
  name: "Correlation-capped diversified momentum: walk down the 12-1 ranking, skip any ETF with 126-day correlation > 0.7 to a holding",
  family: "momentum",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  rebalance: "monthly",
  params: { corrCap: 0.7, corrWindow: 126, picks: 5 },
};

const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const corr = (x, y) => {
  const mx = mean(x);
  const my = mean(y);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < x.length; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  return sxy / Math.sqrt(sxx * syy);
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const mom = {};
  const R = {};
  for (const s of Object.keys(universe)) {
    const b = universe[s];
    if (b.length <= 253) continue;
    const e = b.length - 1;
    mom[s] = b[e - 21].close / b[e - 252].close - 1;
    const r = [];
    for (let k = e - p.corrWindow + 1; k <= e; k++) r.push(b[k].close / b[k - 1].close - 1);
    R[s] = r;
  }
  const syms = Object.keys(mom);
  if (syms.length < 12) return {};
  const ranked = syms.filter((s) => mom[s] > 0).sort((x, y) => mom[y] - mom[x] || (x < y ? -1 : 1));
  const sel = [];
  for (const s of ranked) {
    if (sel.length >= p.picks) break;
    if (sel.every((h) => corr(R[s], R[h]) <= p.corrCap)) sel.push(s);
  }
  if (sel.length < 3) return {};
  const w = {};
  for (const s of sel) w[s] = 1 / sel.length;
  return w;
}
