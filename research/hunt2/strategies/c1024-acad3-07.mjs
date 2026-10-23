// Spec: research/hunt2/campaign-1024/prereg-acad3.json (c1024-acad3-07). Fang, Liu & Roussanov 2022, NBER WP 30169
export const meta = {
  id: "c1024-acad3-07",
  name: "Low inflation beta: long the quintile least exposed to weekly changes in 10-year breakeven inflation, weekly (Fang-Liu-Roussanov)",
  family: "macro",
  source: "c1024/acad3",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "weekly",
  longShort: false,
  params: { weeks: 52, bottomFrac: 0.2, maxHist: 60, macro: "T10YIE" },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  if (st.hist === undefined) st.hist = [];
  const close = {};
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    close[sym] = b[b.length - 1].close;
  }
  st.hist.push({ v: ctx.macro(p.macro), close });
  if (st.hist.length > p.maxHist) st.hist.shift();
  const W = p.weeks + 1; // 53 entries give 52 pairs
  const n = st.hist.length;
  if (n < W) return {};
  const win = st.hist.slice(n - W);
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const dv = [], rr = [];
    for (let j = 1; j < W; j++) {
      const a = win[j - 1], c = win[j];
      if (!Number.isFinite(a.v) || !Number.isFinite(c.v)) continue;
      const pa = a.close[sym], pc = c.close[sym];
      if (!Number.isFinite(pa) || !Number.isFinite(pc)) continue;
      dv.push(c.v - a.v);
      rr.push(pc / pa - 1);
    }
    if (dv.length !== p.weeks) continue;
    const md = dv.reduce((x, y) => x + y, 0) / dv.length;
    const mr = rr.reduce((x, y) => x + y, 0) / rr.length;
    let cov = 0, vd = 0;
    for (let j = 0; j < dv.length; j++) { cov += (rr[j] - mr) * (dv[j] - md); vd += (dv[j] - md) * (dv[j] - md); }
    if (!(vd > 0)) continue;
    scored.push({ sym, beta: cov / vd });
  }
  const k = Math.floor(p.bottomFrac * scored.length);
  if (k < 3) return {};
  scored.sort((a, b) => a.beta - b.beta || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const x of scored.slice(0, k)) w[x.sym] = 1 / k;
  return w;
}
