// Spec: docs/research/hunt-1003/codex/specs.json (h3-etf-cppi-cushion). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-etf-cppi-cushion",
  name: "Does CPPI portfolio insurance work with QQQ and SHY?",
  family: "allocation-cppi",
  source: "https://arxiv.org/abs/0905.2926",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ","SHY"],
  rebalance: "daily",
  longShort: false,
  params: { floorFraction: 0.8, multiplier: 4, warmupBars: 2, initialNav: 1 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params, s = ctx.state;
  for (const k of ["QQQ", "SHY"]) if (!universe[k] || universe[k].length < p.warmupBars) { s.init = false; return {}; }
  const q = universe.QQQ[universe.QQQ.length - 1], h = universe.SHY[universe.SHY.length - 1];
  const yr = new Date(q.time * 1000).getUTCFullYear();
  if (!s.init) {
    s.init = true; s.V = p.initialNav; s.F = p.floorFraction * s.V; s.yr = yr;
    s.wq = 1 - 0.2; s.ws = 0.2; s.q = q.close; s.h = h.close;
    return { QQQ: s.wq, SHY: s.ws };
  }
  s.V *= 1 + s.wq * (q.close / s.q - 1) + s.ws * (h.close / s.h - 1);
  s.q = q.close; s.h = h.close;
  if (yr !== s.yr) { s.yr = yr; s.F = p.floorFraction * s.V; }
  if (s.V <= 0) { s.wq = 0; s.ws = 1; return { SHY: 1 }; }
  s.wq = Math.min(1, Math.max(0, p.multiplier * (s.V - s.F) / s.V)); s.ws = 1 - s.wq;
  return { QQQ: s.wq, SHY: s.ws };
}
