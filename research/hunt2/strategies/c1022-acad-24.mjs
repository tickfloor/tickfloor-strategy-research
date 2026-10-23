export const meta = {
  id: "c1022-acad-24",
  name: "Momentum turning points: slow 12-month + fast 1-month state machine, 25 ETFs (Goulding-Harvey-Mazzoleni)",
  family: "trend",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  rebalance: "monthly",
  params: { slow: 252, fast: 21, bull: 1, correction: 0.5, rebound: 0.5, bear: 0 },
};

// Four states from the sign of the slow (252) and fast (21) trailing returns; each name gets stateWeight / N_eligible.
export function rank(universe, t, ctx) {
  const { slow, fast, bull, correction, rebound, bear } = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length > 253);
  const N = syms.length;
  if (N === 0) return {};
  const w = {};
  for (const s of syms) {
    const b = universe[s];
    const L = b.length - 1;
    const slowUp = b[L].close / b[L - slow].close - 1 > 0;
    const fastUp = b[L].close / b[L - fast].close - 1 > 0;
    const sw = slowUp ? (fastUp ? bull : correction) : fastUp ? rebound : bear;
    w[s] = sw / N;
  }
  return w;
}
