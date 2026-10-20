// Spec: docs/research/hunt-1004/codex/specs.json (h4-etf-wealth-mixture). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-etf-wealth-mixture",
  "name": "Does combining fixed ETF portfolios by their accumulated wealth work?",
  "family": "wealth-mixture",
  "source": "retail trading content: Cover universal portfolios finite wealth weighted constant rebalanced portfolio experts",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "QQQ",
    "GLD"
  ],
  "rebalance": "daily",
  "longShort": false,
  "params": {
    "warmupBars": 2,
    "mixtureIntervals": 10
  }
};

export function rank(universe, t, ctx) {
  const p = ctx.params, s = ctx.state, M = p.mixtureIntervals;
  const a = universe.QQQ, g = universe.GLD;
  const ok = (x) => x && x.length >= p.warmupBars && x.slice(-2).every((k) => Number.isFinite(k.close) && k.close > 0);
  if (!ok(a) || !ok(g)) { s.init = false; return {}; }
  const q = a[a.length - 1].close, h = g[g.length - 1].close;
  if (!s.init) {
    s.init = true; s.W = []; for (let j = 0; j <= M; j++) s.W.push(1);
    s.q = q; s.h = h;
    return { QQQ: 0.5, GLD: 0.5 };
  }
  const rQ = q / s.q - 1, rG = h / s.h - 1;
  let tot = 0, bad = false;
  for (let j = 0; j <= M; j++) {
    const f = 1 + (j / M) * rQ + (1 - j / M) * rG;
    if (!(f > 0)) bad = true;
    s.W[j] *= f; tot += s.W[j];
  }
  if (bad || !Number.isFinite(tot) || !(tot > 0)) { for (let j = 0; j <= M; j++) s.W[j] = 1; tot = M + 1; }
  else for (let j = 0; j <= M; j++) s.W[j] /= tot;
  let num = 0, den = 0;
  for (let j = 0; j <= M; j++) { num += s.W[j] * j / M; den += s.W[j]; }
  s.q = q; s.h = h;
  const wq = num / den;
  return { QQQ: wq, GLD: 1 - wq };
}
