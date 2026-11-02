// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-32)
export const meta = {
  id: "c1031-etfxs-32",
  name: "Beta-hedged sector momentum: long the top 3 sectors by 12-1, short QQQ for their beta, monthly (relative strength only)",
  family: "momentum",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "QQQ"],
  rebalance: "monthly",
  longShort: true,
  params: { top: 3, longEach: 0.14, window: 252 },
};

const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const Q = universe.QQQ;
  if (!Q || Q.length <= 253) return {};
  const sectors = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (sym !== "QQQ" && b.length > 253) sectors.push({ sym, b, e: b.length - 1 });
  }
  if (sectors.length < 8) return {};
  const retsOf = (b, e) => {
    const r = [];
    for (let j = 0; j < p.window; j++) {
      const k = e - (p.window - 1) + j;
      r.push(b[k].close / b[k - 1].close - 1);
    }
    return r;
  };
  const eQ = Q.length - 1;
  const rq = retsOf(Q, eQ);
  const mq = mean(rq);
  const varQ = rq.reduce((s, x) => s + (x - mq) * (x - mq), 0);
  for (const s of sectors) {
    s.mom = s.b[s.e - 21].close / s.b[s.e - 252].close - 1;
  }
  sectors.sort((x, y) => y.mom - x.mom || (x.sym < y.sym ? -1 : 1));
  const top = sectors.slice(0, p.top);
  const w = {};
  let sumBeta = 0;
  for (const s of top) {
    const rs = retsOf(s.b, s.e);
    const ms = mean(rs);
    let cov = 0;
    for (let j = 0; j < rs.length; j++) cov += (rs[j] - ms) * (rq[j] - mq);
    sumBeta += cov / varQ;
    w[s.sym] = p.longEach;
  }
  // short QQQ for the summed beta, capped at 0.58 so sum |w| <= 1; no QQQ position if beta sum <= 0
  if (sumBeta > 0) w.QQQ = -Math.min(0.58, p.longEach * sumBeta);
  return w;
}
