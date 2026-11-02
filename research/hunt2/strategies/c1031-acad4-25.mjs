// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-25). Oil-beta rank on wide US stocks, weekly, top 20%
export const meta = {
  id: "c1031-acad4-25",
  name: "Oil-beta rank: long the top 20% of wide US stocks by weekly sensitivity to WTI changes",
  family: "macro",
  source: "c1031/acad4",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "weekly",
  longShort: false,
  params: { weeks: 52, topFrac: 0.2, macro: "DCOILWTICO", maxHist: 60 },
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
  const raw = ctx.macro(p.macro);
  st.hist.push({ v: raw === null ? NaN : raw, close });
  if (st.hist.length > p.maxHist) st.hist.shift();

  const H = st.hist;
  const n = H.length;
  const need = p.weeks + 1;
  if (n < need) return {};

  const scored = [];
  for (const sym of Object.keys(universe)) {
    const dv = [], r = [];
    let ok = true;
    for (let j = n - p.weeks; j < n && ok; j++) {
      const a = H[j - 1], c = H[j];
      const ca = a.close[sym], cc = c.close[sym];
      if (!Number.isFinite(a.v) || !Number.isFinite(c.v) || typeof ca !== "number" || typeof cc !== "number") { ok = false; break; }
      dv.push(c.v - a.v);
      r.push(cc / ca - 1);
    }
    if (!ok || dv.length !== p.weeks) continue;
    const mdv = dv.reduce((s, x) => s + x, 0) / dv.length;
    const mr = r.reduce((s, x) => s + x, 0) / r.length;
    let sxy = 0, sxx = 0;
    for (let q = 0; q < dv.length; q++) { sxy += (dv[q] - mdv) * (r[q] - mr); sxx += (dv[q] - mdv) ** 2; }
    if (!(sxx > 0)) continue;
    scored.push({ sym, beta: sxy / sxx });
  }
  if (scored.length < 3) return {};
  const k = Math.floor(p.topFrac * scored.length);
  if (k === 0) return {};
  scored.sort((x, y) => y.beta - x.beta || (x.sym < y.sym ? -1 : 1));
  const w = {};
  for (const s of scored.slice(0, k)) w[s.sym] = 1 / k;
  return w;
}
