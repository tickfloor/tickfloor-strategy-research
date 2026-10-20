// Spec: docs/research/hunt-1003/codex/specs.json (h3-etf-laguerre-rsi). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-etf-laguerre-rsi",
  name: "Does Laguerre RSI work on ETFs?",
  family: "indicator-laguerre",
  source: "retail trading content: John Ehlers Laguerre RSI gamma 0.5 strategy",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ","DIA","XLK","XLF","XLE","XLV","XLI","XLP","XLY","XLU","XLB","XLC","VNQ","TLT","IEF","SHY","LQD","HYG","AGG","GLD","SLV","USO","UNG","DBC","UUP"],
  longShort: false,
  params: { gamma: 0.5, entryLevel: 0.2, exitLevel: 0.8, warmupBars: 64, maxHoldBars: 20 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, s = ctx.state, g = p.gamma, c = bars[i].close;
  if (s.pos === undefined) { s.pos = 0; s.L = [c, c, c, c]; s.lr = NaN; }
  let lr = s.lr;
  if (i > 0) {
    const o = s.L, L0 = (1 - g) * c + g * o[0];
    const L1 = -g * L0 + o[0] + g * o[1];
    const L2 = -g * L1 + o[1] + g * o[2];
    const L3 = -g * L2 + o[2] + g * o[3];
    s.L = [L0, L1, L2, L3];
    let cu = 0, cd = 0;
    for (let k = 0; k < 3; k++) { const d = s.L[k] - s.L[k + 1]; if (d >= 0) cu += d; else cd -= d; }
    lr = cu + cd === 0 ? 0.5 : cu / (cu + cd);
  }
  const prev = s.lr;
  s.lr = lr;
  if (i < p.warmupBars) return 0;
  if (s.pos === 1) {
    if (lr >= p.exitLevel || i - s.eIdx >= p.maxHoldBars) { s.pos = 0; return 0; }
    return 1;
  }
  if (prev <= p.entryLevel && lr > p.entryLevel) { s.pos = 1; s.eIdx = i; return 1; }
  return 0;
}
