// Spec: research/hunt2/campaign-1024/prereg-acad3.json (c1024-acad3-17). De Bondt & Thaler 1985, JF 40(3), 793-805; Asness, Moskowitz & Pedersen 2013, JF 68(3), 929-985
export const meta = {
  id: "c1024-acad3-17",
  name: "Sector long-term reversal: hold the 3 of 11 sector ETFs with the worst 36-to-1-month return, monthly (De Bondt-Thaler; AMP value)",
  family: "mean_reversion",
  source: "c1024/acad3",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  rebalance: "monthly",
  params: { long: 756, skip: 21, top: 3 },
};

export function rank(universe, t, ctx) {
  const { long, skip, top } = ctx.params;
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L <= long + 1) continue; // eligible if L > 757
    scored.push({ sym, score: b[L - 1 - skip].close / b[L - 1 - long].close - 1 });
  }
  if (scored.length < top) return {};
  scored.sort((a, b) => a.score - b.score || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const s of scored.slice(0, top)) w[s.sym] = 1 / top;
  return w;
}
