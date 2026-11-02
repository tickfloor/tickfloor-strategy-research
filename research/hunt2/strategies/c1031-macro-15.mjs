export const meta = {
  "id": "c1031-macro-15",
  "name": "Foreign-revenue stocks when the dollar has weakened over 3 months, domestic-revenue stocks when it has strengthened, monthly",
  "family": "macro",
  "source": "c1031/macro",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "assets": [
    "AAPL",
    "QCOM",
    "TXN",
    "INTC",
    "CAT",
    "MMM",
    "HON",
    "BA",
    "WMT",
    "COST",
    "LOW",
    "UNP",
    "T",
    "UNH",
    "ABT",
    "MCD"
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

const F = ["AAPL", "QCOM", "TXN", "INTC", "CAT", "MMM", "HON", "BA"];
const D = ["WMT", "COST", "LOW", "UNP", "T", "UNH", "ABT", "MCD"];

export function rank(universe, t, ctx) {
  const ALL = [...F, ...D];
  const d = ctx.macro("DTWEXBGS");
  if (d === null) return equalWeight(universe, ALL);
  if (ctx.state.d === undefined) ctx.state.d = [];
  const h = ctx.state.d;
  h.push(d);
  const lag = ctx.params.lagMonths;
  if (h.length < lag + 1) return equalWeight(universe, ALL);
  const chg = d / h[h.length - 1 - lag] - 1;
  return equalWeight(universe, chg < 0 ? F : D);
}
