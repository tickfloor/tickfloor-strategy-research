// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-17). Source: Asness, Frazzini & Pedersen 2012, 'Leverage aversion and risk parity', Financial Analysts 
export const meta = {
  id: "c1031-acad4-17",
  name: "Unlevered risk parity across 7 asset-class ETFs: inverse 1-year volatility weights, monthly (Asness-Frazzini-Pedersen)",
  family: "volatility",
  source: "c1031/acad4",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "TLT", "IEF", "GLD", "DBC", "VNQ"],
  rebalance: "monthly",
  longShort: false,
  params: { window: 252, minAssets: 4 },
};

function mean(a) { let s = 0; for (const x of a) s += x; return s / a.length; }

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const inv = {};
  let sumInv = 0;
  let n = 0;
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L < p.window + 1) continue;
    const r = [];
    for (let k = L - p.window; k <= L - 1; k++) r.push(b[k].close / b[k - 1].close - 1);
    const m = mean(r);
    let ss = 0;
    for (const x of r) ss += (x - m) ** 2;
    const sd = Math.sqrt(ss / (r.length - 1));
    if (!(sd > 0)) continue;
    inv[sym] = 1 / sd;
    sumInv += 1 / sd;
    n++;
  }
  if (n < p.minAssets) return {};
  const w = {};
  for (const sym of Object.keys(inv)) w[sym] = inv[sym] / sumInv;
  return w;
}
