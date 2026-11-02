export const meta = {
  "id": "c1031-macro-17",
  "name": "Real-yield factor momentum: hold the 5 of 25 ETFs with the highest (rising yields) or lowest (falling yields) 52-week beta to weekly real-yield changes",
  "family": "momentum",
  "source": "c1031/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "QQQ",
    "DIA",
    "XLK",
    "XLF",
    "XLE",
    "XLV",
    "XLI",
    "XLP",
    "XLY",
    "XLU",
    "XLB",
    "XLC",
    "VNQ",
    "TLT",
    "IEF",
    "SHY",
    "LQD",
    "HYG",
    "AGG",
    "GLD",
    "SLV",
    "USO",
    "UNG",
    "DBC",
    "UUP"
  ],
  "rebalance": "weekly",
  "params": {
    "betaWeeks": 52,
    "trendWeeks": 13,
    "n": 5
  }
};

const meanOf = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
function covOf(xs, ys) {
  const mx = meanOf(xs), my = meanOf(ys);
  let s = 0;
  for (let k = 0; k < xs.length; k++) s += (xs[k] - mx) * (ys[k] - my);
  return s / xs.length;
}

export function rank(universe, t, ctx) {
  const r = ctx.macro("DFII10");
  if (r === null) return {};
  const { betaWeeks, trendWeeks, n } = ctx.params;
  if (ctx.state.h === undefined) ctx.state.h = [];
  const h = ctx.state.h;
  const closes = {};
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    closes[sym] = b[b.length - 1].close;
  }
  h.push({ r, closes });
  if (h.length < betaWeeks + 1) return {};
  const win = h.slice(h.length - betaWeeks - 1);
  const trend = h[h.length - 1].r - h[h.length - 1 - trendWeeks].r;
  const xs = [];
  for (let k = 1; k < win.length; k++) xs.push(win[k].r - win[k - 1].r);
  const scored = [];
  for (const sym of Object.keys(universe)) {
    if (!win.every((e) => e.closes[sym] !== undefined)) continue;
    const ys = [];
    for (let k = 1; k < win.length; k++) ys.push(Math.log(win[k].closes[sym] / win[k - 1].closes[sym]));
    const beta = covOf(xs, ys) / covOf(xs, xs);
    if (Number.isFinite(beta)) scored.push({ sym, beta });
  }
  const dir = trend > 0 ? -1 : 1;
  scored.sort((a, b) => dir * (a.beta - b.beta) || (a.sym < b.sym ? -1 : a.sym > b.sym ? 1 : 0));
  const out = {};
  for (const { sym } of scored.slice(0, n)) out[sym] = 1 / n;
  return out;
}
