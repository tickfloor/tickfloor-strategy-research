// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-14). Frazzini & Pedersen 2014, 'Betting against beta', Journal of Financial Economics 111(1), 1-25
export const meta = {
  id: "c1022-acad-14",
  name: "Betting against beta across asset-class ETFs, long low-beta leg weighted by 1/beta (Frazzini-Pedersen)",
  family: "volatility",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  proxyFor: { SPY: "QQQ" },
  rebalance: "monthly",
  params: { corrBars: 252, volBars: 252, shrink: 0.6, lowN: 8 },
};

function lastReturns(b, n) {
  const out = [];
  for (let i = b.length - n; i < b.length; i++) out.push(b[i].close / b[i - 1].close - 1);
  return out;
}

const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const names = Object.keys(universe).filter((s) => universe[s].length > p.volBars + 1);
  if (!names.includes("QQQ")) return {};
  const q = lastReturns(universe.QQQ, p.volBars);
  const mq = mean(q);
  const varQ = mean(q.map((x) => (x - mq) ** 2));
  const list = names.map((sym) => {
    const r = lastReturns(universe[sym], p.volBars);
    const mr = mean(r);
    const cov = mean(r.map((x, i) => (x - mr) * (q[i] - mq)));
    const betaRaw = cov / varQ;
    return { sym, beta: p.shrink * betaRaw + (1 - p.shrink) };
  });
  list.sort((a, b) => a.beta - b.beta || (a.sym < b.sym ? -1 : 1));
  const chosen = list.slice(0, Math.min(p.lowN, list.length));
  const inv = chosen.map((x) => 1 / Math.max(x.beta, 0.05));
  const sumInv = inv.reduce((s, x) => s + x, 0);
  const w = {};
  chosen.forEach((x, i) => {
    w[x.sym] = inv[i] / sumInv;
  });
  return w;
}
