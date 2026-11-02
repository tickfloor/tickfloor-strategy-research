// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-09). Sharpe-ranked ETF rotation with inverse-volatility weights.
// Harness rejects meta with both assets and universe, so the spec's universe 'ETFS_DAILY' is implied by assets.
export const meta = {
  id: "c1031-etfxs-09",
  name: "Sharpe-ranked ETF rotation: top 6 of 25 by 126-day return/volatility, inverse-volatility weights, positive scores only",
  family: "momentum",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ",
    "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  rebalance: "monthly",
  longShort: false,
  params: { window: 126, top: 6, minPicks: 3 },
};

function retsAt(b, off, n) {
  const e = b.length - 1 - off;
  const out = [];
  for (let k = e - n + 1; k <= e; k++) out.push(b[k].close / b[k - 1].close - 1);
  return out;
}

function mean(a) {
  let s = 0;
  for (const x of a) s += x;
  return s / a.length;
}

function sampleStd(a) {
  const m = mean(a);
  let s = 0;
  for (const x of a) s += (x - m) * (x - m);
  return Math.sqrt(s / (a.length - 1));
}

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length > p.window + 1).sort();
  if (syms.length < 10) return {};
  const st = [];
  for (const s of syms) {
    const r = retsAt(universe[s], 0, p.window);
    const sd = sampleStd(r);
    const score = mean(r) / sd;
    if (score > 0) st.push({ s, sd, score });
  }
  st.sort((a, b) => b.score - a.score || (a.s < b.s ? -1 : 1));
  const picks = st.slice(0, p.top);
  if (picks.length < p.minPicks) return {};
  const inv = picks.map((x) => 1 / x.sd);
  const tot = inv.reduce((a, b) => a + b, 0);
  const out = {};
  picks.forEach((x, i) => { out[x.s] = inv[i] / tot; });
  return out;
}
