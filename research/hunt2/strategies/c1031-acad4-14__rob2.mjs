// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-14). Source: Merton 1987, 'A simple model of capital market equilibrium with incomplete information', J
export const meta = {
  id: "c1031-acad4-14__rob2",
  name: "Merton idiosyncratic-risk premium: long the highest-idiosyncratic-volatility fifth, monthly (Merton; Fu) (+25%)",
  family: "volatility",
  source: "c1031/acad4",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  longShort: false,
  params: { regWin: 79, topFrac: 0.2 },
};

function mean(a) { let s = 0; for (const x of a) s += x; return s / a.length; }

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const W = p.regWin;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L < 80) continue;
    const k0 = L - W;
    const r = [];
    for (let k = k0; k <= L - 1; k++) r.push(b[k].close / b[k - 1].close - 1);
    names.push({ sym, r });
  }
  const E = names.length;
  if (E === 0) return {};
  const rm = [];
  for (let j = 0; j < W; j++) { let s = 0; for (const n of names) s += n.r[j]; rm.push(s / E); }
  const mx = mean(rm);
  let sxx = 0;
  for (const x of rm) sxx += (x - mx) ** 2;
  for (const n of names) {
    const my = mean(n.r);
    let sxy = 0;
    for (let j = 0; j < W; j++) sxy += (rm[j] - mx) * (n.r[j] - my);
    const beta = sxx > 0 ? sxy / sxx : 0;
    const a = my - beta * mx;
    const res = n.r.map((y, j) => y - a - beta * rm[j]);
    const mr = mean(res);
    let ss = 0;
    for (const e of res) ss += (e - mr) ** 2;
    n.ivol = Math.sqrt(ss / (W - 1));
  }
  const k = Math.floor(p.topFrac * E);
  if (k < 3) return {};
  names.sort((x, y) => y.ivol - x.ivol || (x.sym < y.sym ? -1 : 1));
  const w = {};
  for (const n of names.slice(0, k)) w[n.sym] = 1 / k;
  return w;
}
