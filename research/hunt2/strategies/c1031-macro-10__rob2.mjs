export const meta = {
  id: "c1031-macro-10__rob2",
  name: "TLT and IEF below their yield-implied fair value: rolling 252-day regression residual z-score of -1 or lower (+25%)",
  family: "mean_reversion",
  source: "c1031/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["TLT", "IEF"],
  params: { window: 315, entryZ: -1, exitZ: 0 },
};

// M(ctx, id, i, k) = ctx.macro(id) known by the close of bar i-k; null if i-k < 0 or no value yet.
function M(ctx, id, i, k) {
  return i - k < 0 ? null : ctx.macro(id, i - k);
}

// y(k) = 10y real yield + 10y breakeven = nominal 10y yield proxy, in %; null if either is missing.
function Y(ctx, i, k) {
  const a = M(ctx, "DFII10", i, k);
  const b = M(ctx, "T10YIE", i, k);
  return a === null || b === null ? null : a + b;
}

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.pos === undefined) ctx.state.pos = 0;
  if (i < p.window - 1) return 0;
  const n = p.window; // k = 0..251
  const xs = [];
  const zs = [];
  for (let k = 0; k < n; k++) {
    const y = Y(ctx, i, k);
    if (y === null) return 0;
    xs.push(y);
    zs.push(Math.log(bars[i - k].close));
  }
  let mx = 0;
  let mz = 0;
  for (let k = 0; k < n; k++) { mx += xs[k]; mz += zs[k]; }
  mx /= n;
  mz /= n;
  let sxy = 0;
  let sxx = 0;
  for (let k = 0; k < n; k++) {
    sxy += (xs[k] - mx) * (zs[k] - mz);
    sxx += (xs[k] - mx) * (xs[k] - mx);
  }
  const b = sxy / sxx;
  const a = mz - b * mx;
  const e = zs.map((z, k) => z - a - b * xs[k]);
  let me = 0;
  for (const x of e) me += x;
  me /= n;
  let ss = 0;
  for (const x of e) ss += (x - me) * (x - me);
  const s = Math.sqrt(ss / (n - 1));
  const zres = e[0] / s;
  const prev = ctx.state.pos; // conditions read the state at the start of the bar
  if (prev === 0 && zres <= p.entryZ) ctx.state.pos = 1;
  if (prev === 1 && zres >= p.exitZ) ctx.state.pos = 0;
  return ctx.state.pos;
}
