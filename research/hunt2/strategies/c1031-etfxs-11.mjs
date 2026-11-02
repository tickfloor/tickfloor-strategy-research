// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-11). Ang, Chen & Xing 2006, 'Downside risk', Review of Financial Studies 19(4), 1191-1239
export const meta = {
  id: "c1031-etfxs-11",
  name: "Downside-beta premium on sectors: hold the 4 of 11 with the highest beta in down-market days, monthly",
  family: "other",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  rebalance: "monthly",
  params: { window: 252, top: 4 },
};

const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length > 253).sort();
  if (syms.length < 8) return {};
  const R = {};
  for (const s of syms) {
    const b = universe[s];
    const e = b.length - 1;
    R[s] = [];
    for (let k = e - p.window + 1; k <= e; k++) R[s].push(b[k].close / b[k - 1].close - 1);
  }
  const n = p.window;
  const M = [];
  for (let j = 0; j < n; j++) M.push(mean(syms.map((s) => R[s][j])));
  const mu = mean(M);
  const D = [];
  for (let j = 0; j < n; j++) if (M[j] < mu) D.push(j);
  if (D.length < 2) return {};
  const Md = D.map((j) => M[j]);
  const mM = mean(Md);
  const varM = Md.reduce((s, x) => s + (x - mM) ** 2, 0) / (Md.length - 1);
  const betas = syms.map((s) => {
    const rd = D.map((j) => R[s][j]);
    const mr = mean(rd);
    const cov = rd.reduce((acc, x, i) => acc + (x - mr) * (Md[i] - mM), 0) / (rd.length - 1);
    return [s, cov / varM];
  });
  betas.sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1));
  const w = {};
  for (const [s] of betas.slice(0, p.top)) w[s] = 1 / p.top;
  return w;
}
