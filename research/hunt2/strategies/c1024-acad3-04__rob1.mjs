// Spec: research/hunt2/campaign-1024/prereg-acad3.json (c1024-acad3-04). Huehn & Scholz 2018, Int. Rev. Financial Analysis 57, 1-19
export const meta = {
  id: "c1024-acad3-04__rob1",
  name: "Alpha momentum: long the quintile with the highest 12-1 month CAPM alpha against the equal-weight market (Huehn-Scholz) (-25%)",
  family: "momentum",
  source: "c1024/acad3",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  longShort: false,
  params: { formation: 189, skip: 21, topFrac: 0.2 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length > 190);
  const E = syms.length;
  const k = Math.floor(p.topFrac * E);
  if (k < 3) return {};
  // offset d = bars back from the rebalance close e; window k = e-251..e-21 is d = 21..251
  const offs = [];
  for (let d = p.skip; d <= p.formation - 1; d++) offs.push(d);
  const n = offs.length;
  const ser = {};
  for (const s of syms) {
    const b = universe[s];
    const L = b.length;
    ser[s] = offs.map((d) => b[L - 1 - d].close / b[L - 2 - d].close - 1);
  }
  const mkt = offs.map((_, j) => syms.reduce((acc, s) => acc + ser[s][j], 0) / E);
  const mm = mkt.reduce((a, x) => a + x, 0) / n;
  let vm = 0;
  for (const x of mkt) vm += (x - mm) * (x - mm);
  const scores = syms.map((s) => {
    const r = ser[s];
    const mr = r.reduce((a, x) => a + x, 0) / n;
    let cov = 0;
    for (let j = 0; j < n; j++) cov += (r[j] - mr) * (mkt[j] - mm);
    const beta = vm > 0 ? cov / vm : 0;
    return { sym: s, alpha: mr - beta * mm };
  });
  scores.sort((a, b) => b.alpha - a.alpha || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const x of scores.slice(0, k)) w[x.sym] = 1 / k;
  return w;
}
