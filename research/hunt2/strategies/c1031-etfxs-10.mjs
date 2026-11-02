// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-10). Da (Gurun & Engelberg) frog-in-the-pan: continuity of 12-1 momentum.
// Harness rejects meta with both assets and universe, so the spec's universe 'ETFS_DAILY' is implied by assets.
export const meta = {
  id: "c1031-etfxs-10",
  name: "Frog-in-the-pan continuous momentum on ETFs: among the top 10 by 12-1, hold the 5 with the smoothest path",
  family: "momentum",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ",
    "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  rebalance: "monthly",
  longShort: false,
  params: { top: 10, hold: 5 },
};

function retsAt(b, off, n) {
  const e = b.length - 1 - off;
  const out = [];
  for (let k = e - n + 1; k <= e; k++) out.push(b[k].close / b[k - 1].close - 1);
  return out;
}

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length > 253).sort();
  if (syms.length < 12) return {};
  const scored = [];
  for (const s of syms) {
    const b = universe[s];
    const e = b.length - 1;
    const pret = b[e - 21].close / b[e - 252].close - 1;
    // formation k = e-251 .. e-21 (231 daily returns)
    const r = retsAt(b, 0, 252).slice(0, 231);
    let pos = 0;
    let neg = 0;
    for (const x of r) {
      if (x > 0) pos++;
      else if (x < 0) neg++;
    }
    const ID = Math.sign(pret) * ((neg - pos) / r.length);
    scored.push({ s, pret, ID });
  }
  scored.sort((a, b) => b.pret - a.pret || (a.s < b.s ? -1 : 1));
  const cand = scored.slice(0, p.top).filter((x) => x.pret > 0);
  const m = cand.length;
  if (m < 3) return {};
  const n = m >= p.hold ? p.hold : m;
  cand.sort((a, b) => a.ID - b.ID || (a.s < b.s ? -1 : 1));
  const out = {};
  for (const x of cand.slice(0, n)) out[x.s] = 1 / n;
  return out;
}
