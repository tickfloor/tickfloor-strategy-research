// Spec: research/hunt2/campaign-1024/prereg-acad3.json (c1024-acad3-08). Goncalves 2021, JFE 141(3), 919-945; Weber 2018, JFE 128(3), 486-503
export const meta = {
  id: "c1024-acad3-08",
  name: "Short-duration premium: long the quintile least hurt by weekly rises in the 10-year real yield, weekly (Goncalves; Weber)",
  family: "macro",
  source: "c1024/acad3",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "weekly",
  params: { weeks: 52, topFrac: 0.2, maxHist: 60, macro: "DFII10" },
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
  const k = Math.floor(p.topFrac * scored.length);
  if (k < 3) return {};
  scored.sort((a, b) => b.beta - a.beta || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const s of scored.slice(0, k)) w[s.sym] = 1 / k;
  return w;
}
