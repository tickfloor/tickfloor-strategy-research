// Spec: research/hunt2/campaign-1023/prereg-r2.json (c1023-r2-23). Portfolio rank, monthly, long-only.
// Idea: r27-etf20-xsmom top 5 by 12-1 momentum with a Moreira-Muir volatility-managed overlay.

export const meta = {
  id: "c1023-r2-23",
  name: "Top 5 of 20 ETFs by 12-1 momentum with a 20% volatility-managed overlay (remainder in AGG/IEF)",
  family: "momentum",
  source: "c1023/r2",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "LQD", "HYG", "AGG", "GLD", "SLV"],
  rebalance: "monthly",
  params: { lookback: 252, skip: 21, need: 254, top: 5, minNames: 10, volWindow: 21, targetVar: 0.04 },
};

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}
const mean = (xs) => xs.reduce((p, q) => p + q, 0) / xs.length;
function sampleStd(xs) {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((p, q) => p + (q - m) ** 2, 0) / (xs.length - 1));
}
// rows: [sym, value]; ties broken by symbol name ascending
function sortRows(rows, desc) {
  return rows.sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}
const topN = (rows, n) => sortRows(rows, true).slice(0, n).map((x) => x[0]);
const retAt = (b, k) => b[k].close / b[k - 1].close - 1;

export function rank(universe, t, ctx) {
  const { lookback, skip, need, top, minNames, volWindow, targetVar } = ctx.params;
  const scored = Object.keys(universe)
    .filter((s) => universe[s].length >= need)
    .map((s) => {
      const b = universe[s], e = b.length - 1;
      return [s, b[e - skip].close / b[e - lookback].close - 1];
    });
  if (scored.length < minNames) return ew(universe);

  const picks = topN(scored, top);
  const p = [];
  for (let j = 0; j < volWindow; j++) {
    p.push(mean(picks.map((s) => { const b = universe[s]; return retAt(b, b.length - 1 - j); })));
  }
  const v = sampleStd(p) ** 2 * 252;
  const w = v > 0 ? Math.min(1, targetVar / v) : 1;

  const out = {};
  for (const s of picks) out[s] = w / top;
  const rem = 1 - w;
  if (rem > 0) {
    if (universe.AGG !== undefined && !picks.includes("AGG")) out.AGG = rem;
    else if (universe.IEF !== undefined && !picks.includes("IEF")) out.IEF = rem;
  }
  return out;
}
