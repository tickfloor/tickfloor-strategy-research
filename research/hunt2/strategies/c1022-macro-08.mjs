export const meta = {
  id: "c1022-macro-08",
  name: "VIX risk-off ladder: equities, then IG credit, then Treasuries",
  family: "other",
  source: "c1022/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "LQD", "IEF"],
  rebalance: "daily",
  params: { lo: 20, hi: 30 },
};

const LISTED = ["QQQ", "DIA", "LQD", "IEF"];

export function rank(universe, t, ctx) {
  const present = LISTED.filter((s) => Object.hasOwn(universe, s));
  if (present.length < LISTED.length) {
    // prereg fix (mixed history): equal weight across present listed symbols
    const out = {};
    for (const s of present) out[s] = 1 / present.length;
    return out;
  }
  const v = ctx.macro("VIX");
  if (v === null) return {};
  if (v < ctx.params.lo) return { QQQ: 0.5, DIA: 0.5 };
  if (v < ctx.params.hi) return { LQD: 1 };
  return { IEF: 1 };
}
