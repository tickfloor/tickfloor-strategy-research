// Spec: docs/research/hunt-1003/codex/specs.json (h3-etf-four-asset-bands). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-etf-four-asset-bands",
  name: "Does 10% band rebalancing work for a four-asset ETF portfolio?",
  family: "allocation-rebalancing",
  source: "retail trading content: permanent portfolio relative rebalance bands stocks gold bonds cash",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ","TLT","GLD","SHY"],
  rebalance: "daily",
  longShort: false,
  params: { targetWeight: 0.25, relativeBand: 0.1, warmupBars: 2 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params, s = ctx.state, syms = ["QQQ", "TLT", "GLD", "SHY"];
  for (const k of syms) if (!universe[k] || universe[k].length < p.warmupBars) { s.init = false; return {}; }
  const px = {};
  for (const k of syms) px[k] = universe[k][universe[k].length - 1].close;
  if (!s.init) {
    s.init = true; s.sl = {}; for (const k of syms) s.sl[k] = p.targetWeight;
  } else {
    let sum = 0;
    for (const k of syms) { s.sl[k] *= px[k] / s.px[k]; sum += s.sl[k]; }
    for (const k of syms) s.sl[k] /= sum;
    const lo = p.targetWeight * (1 - p.relativeBand), hi = p.targetWeight * (1 + p.relativeBand);
    if (syms.some((k) => s.sl[k] < lo || s.sl[k] > hi)) for (const k of syms) s.sl[k] = p.targetWeight;
  }
  s.px = px;
  return { ...s.sl };
}
