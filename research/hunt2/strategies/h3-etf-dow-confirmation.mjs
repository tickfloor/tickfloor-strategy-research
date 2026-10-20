// Spec: docs/research/hunt-1003/codex/specs.json (h3-etf-dow-confirmation). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-etf-dow-confirmation",
  name: "Does Dow Theory confirmation using DIA and XLI work?",
  family: "confirmation-dow",
  source: "retail trading content: Dow Theory industrial ETF confirmation DIA XLI",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["DIA","XLI","SHY"],
  rebalance: "daily",
  longShort: false,
  params: { entryLookbackBars: 20, exitLookbackBars: 10, confirmationWindowBars: 5, warmupBars: 21 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params, s = ctx.state, syms = ["DIA", "XLI", "SHY"];
  if (s.defensive === undefined) { s.defensive = true; s.callIndex = -1; s.conf = { DIA: null, XLI: null }; }
  for (const k of syms) if (!universe[k] || universe[k].length < p.warmupBars) return {};
  s.callIndex++;
  let exitHit = false;
  for (const k of ["DIA", "XLI"]) {
    const b = universe[k], n = b.length, c = b[n - 1].close;
    let hi = -Infinity, lo = Infinity;
    for (let j = n - 1 - p.entryLookbackBars; j <= n - 2; j++) hi = Math.max(hi, b[j].high);
    for (let j = n - 1 - p.exitLookbackBars; j <= n - 2; j++) lo = Math.min(lo, b[j].low);
    if (c > hi) s.conf[k] = s.callIndex;
    if (c < lo) exitHit = true;
  }
  if (s.defensive) {
    const d = s.conf.DIA, x = s.conf.XLI, W = p.confirmationWindowBars - 1;
    if (d !== null && x !== null && s.callIndex - d >= 0 && s.callIndex - d <= W && s.callIndex - x >= 0 && s.callIndex - x <= W) {
      s.defensive = false;
      return { DIA: 0.5, XLI: 0.5 };
    }
    return { SHY: 1 };
  }
  if (exitHit) { s.defensive = true; s.conf = { DIA: null, XLI: null }; return { SHY: 1 }; }
  return { DIA: 0.5, XLI: 0.5 };
}
