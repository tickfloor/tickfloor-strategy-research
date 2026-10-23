// Spec: research/hunt2/campaign-1024/prereg-acad3.json (c1024-acad3-21). Fang, Liu & Roussanov 2022, NBER Working Paper 30169
export const meta = {
  id: "c1024-acad3-21",
  name: "Low inflation-beta sectors: hold the 4 of 11 sector ETFs least exposed to weekly breakeven-inflation changes, weekly (Fang-Liu-Roussanov)",
  family: "macro",
  source: "c1024/acad3",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  rebalance: "weekly",
  params: { weeks: 52, top: 4, maxHist: 60, macro: "T10YIE" },
};

const mean = (x) => x.reduce((s, v) => s + v, 0) / x.length;
const fin = (x) => typeof x === "number" && Number.isFinite(x);

export function rank(universe, t, ctx) {
  const p = ctx.params;
  if (ctx.state.hist === undefined) ctx.state.hist = [];
  const close = {};
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    close[sym] = b[b.length - 1].close;
  }
  ctx.state.hist.push({ v: ctx.macro(p.macro), close });
  if (ctx.state.hist.length > p.maxHist) ctx.state.hist.shift();
  const H = ctx.state.hist;
  const n = p.weeks + 1; // 53 entries -> 52 pairs
  if (H.length < n) return {};
  const first = H.length - n;
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const dv = [];
    const rr = [];
    for (let j = first + 1; j < H.length; j++) {
      const a = H[j - 1];
      const c = H[j];
      if (!fin(a.v) || !fin(c.v)) continue;
      if (a.close[sym] === undefined || c.close[sym] === undefined) continue;
      dv.push(c.v - a.v);
      rr.push(c.close[sym] / a.close[sym] - 1);
    }
    if (dv.length !== p.weeks) continue;
    const md = mean(dv);
    const mr = mean(rr);
    let sxy = 0;
    let sxx = 0;
    for (let j = 0; j < dv.length; j++) {
      sxy += (dv[j] - md) * (rr[j] - mr);
      sxx += (dv[j] - md) ** 2;
    }
    if (!(sxx > 0)) continue;
    scored.push({ sym, beta: sxy / sxx });
  }
  if (scored.length < p.top) return {};
  scored.sort((a, b) => a.beta - b.beta || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const s of scored.slice(0, p.top)) w[s.sym] = 1 / p.top;
  return w;
}
