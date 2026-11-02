export const meta = {
  "id": "c1031-macro-16",
  "name": "Long-duration versus short-duration stock baskets switched by the 3-month change in the 10y real yield, monthly",
  "family": "macro",
  "source": "c1031/macro",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "assets": [
    "NVDA",
    "TSLA",
    "AMD",
    "ADBE",
    "CRM",
    "NFLX",
    "AMZN",
    "META",
    "XOM",
    "CVX",
    "JPM",
    "BAC",
    "T",
    "PFE",
    "MRK",
    "MMM"
  ],
  "rebalance": "monthly",
  "params": {
    "lagMonths": 3
  }
};

function equalWeight(universe, syms) {
  const present = syms.filter((s) => Object.hasOwn(universe, s));
  const w = {};
  for (const s of present) w[s] = 1 / present.length;
  return w;
}

const L = ["NVDA", "TSLA", "AMD", "ADBE", "CRM", "NFLX", "AMZN", "META"];
const S = ["XOM", "CVX", "JPM", "BAC", "T", "PFE", "MRK", "MMM"];

export function rank(universe, t, ctx) {
  const ALL = [...L, ...S];
  const r = ctx.macro("DFII10");
  if (r === null) return equalWeight(universe, ALL);
  if (ctx.state.r === undefined) ctx.state.r = [];
  const h = ctx.state.r;
  h.push(r);
  const lag = ctx.params.lagMonths;
  if (h.length < lag + 1) return equalWeight(universe, ALL);
  const chg = r - h[h.length - 1 - lag];
  return equalWeight(universe, chg <= 0 ? L : S);
}
