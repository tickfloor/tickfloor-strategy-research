// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-23)
export const meta = {
  id: "c1031-etfxs-23",
  name: "Up/down capture ratio sectors: hold the 4 of 11 with the best 252-day up-capture over down-capture versus the sector average",
  family: "other",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  rebalance: "monthly",
  longShort: false,
  params: { window: 252, top: 4, floor: 0.05 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const W = p.window;
  const elig = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length > 253) elig.push({ sym, b, e: b.length - 1 });
  }
  if (elig.length < 8) return {};
  // r_s(k) for k = e-251..e, aligned by offset back from each symbol's rebalance-day bar
  for (const s of elig) {
    s.r = [];
    for (let j = 0; j < W; j++) {
      const k = s.e - (W - 1) + j;
      s.r.push(s.b[k].close / s.b[k - 1].close - 1);
    }
  }
  const M = [];
  for (let j = 0; j < W; j++) M.push(elig.reduce((acc, s) => acc + s.r[j] / elig.length, 0));
  let sUp = 0, nUp = 0, sDn = 0, nDn = 0;
  for (const m of M) {
    if (m > 0) { sUp += m; nUp++; } else if (m < 0) { sDn += m; nDn++; }
  }
  const mUp = sUp / nUp, mDn = sDn / nDn;
  for (const s of elig) {
    let rU = 0, rD = 0;
    for (let j = 0; j < W; j++) {
      if (M[j] > 0) rU += s.r[j];
      else if (M[j] < 0) rD += s.r[j];
    }
    const up = (rU / nUp) / mUp;
    const dn = (rD / nDn) / mDn;
    s.ratio = up / Math.max(dn, p.floor);
  }
  elig.sort((x, y) => y.ratio - x.ratio || (x.sym < y.sym ? -1 : 1));
  const w = {};
  for (const s of elig.slice(0, p.top)) w[s.sym] = 1 / p.top;
  return w;
}
