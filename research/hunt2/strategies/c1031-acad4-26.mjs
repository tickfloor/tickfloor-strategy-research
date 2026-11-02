// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-26). Source: Chen, Roll & Ross 1986, 'Economic forces and the stock market', Journal of Business 59(3),
export const meta = {
  id: "c1031-acad4-26",
  name: "Chen-Roll-Ross macro exposure: long the fifth of stocks with the highest weekly beta to the broad nominal US dollar index changes (wide US stocks)",
  family: "macro",
  source: "c1031/acad4",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "weekly",
  longShort: false,
  params: { weeks: 52, topFrac: 0.2, macro: "DTWEXBGS", maxHist: 60 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  if (ctx.state.hist === undefined) ctx.state.hist = [];
  const hist = ctx.state.hist;
  const close = {};
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    close[sym] = b[b.length - 1].close;
  }
  hist.push({ v: ctx.macro(p.macro), close });
  while (hist.length > p.maxHist) hist.shift();
  const n = hist.length;
  if (n < 53) return {};
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const xs = [];
    const ys = [];
    for (let j = n - 52; j < n; j++) {
      const a = hist[j - 1];
      const c = hist[j];
      if (!Number.isFinite(a.v) || !Number.isFinite(c.v)) continue;
      if (a.close[sym] === undefined || c.close[sym] === undefined) continue;
      xs.push(c.v - a.v);
      ys.push(c.close[sym] / a.close[sym] - 1);
    }
    if (xs.length !== 52) continue;
    const mx = mean(xs);
    const my = mean(ys);
    let sxx = 0;
    let sxy = 0;
    for (let j = 0; j < 52; j++) {
      sxx += (xs[j] - mx) ** 2;
      sxy += (xs[j] - mx) * (ys[j] - my);
    }
    if (!(sxx > 0)) continue;
    scored.push({ sym, beta: sxy / sxx });
  }
  if (scored.length < 3) return {};
  const k = Math.floor(p.topFrac * scored.length);
  if (k < 1) return {};
  scored.sort((x, y) => y.beta - x.beta || (x.sym < y.sym ? -1 : 1));
  const w = {};
  for (const s of scored.slice(0, k)) w[s.sym] = 1 / k;
  return w;
}

function mean(a) { let s = 0; for (const x of a) s += x; return s / a.length; }
