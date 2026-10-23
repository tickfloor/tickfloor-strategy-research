// Spec: research/hunt2/campaign-1023/prereg-r2.json (c1023-r2-15). Portfolio rank, monthly, long-only.
// Idea: r24b-mad-21-200 (moving-average distance) with a 3-step scaled entry (wide-scaled-mom style).

export const meta = {
  id: "c1023-r2-15__rob1",
  name: "Moving-average distance 21/200 with a 3-month scaled entry (wide US stocks), monthly (-25%)",
  family: "trend",
  source: "c1023/r2",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { shortWindow: 16, longWindow: 150, need: 152, minNames: 50, minHoldings: 10, fraction: 0.2, steps: 3 },
};

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}
// rows: [sym, value]; ties broken by symbol name ascending
function sortRows(rows, desc) {
  return rows.sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}
const sma = (b, n) => {
  let s = 0;
  for (let k = b.length - n; k < b.length; k++) s += b[k].close;
  return s / n;
};

export function rank(universe, t, ctx) {
  const { shortWindow, longWindow, need, minNames, minHoldings, fraction, steps } = ctx.params;
  const keys = Object.keys(universe);
  if (ctx.state.step === undefined) ctx.state.step = {};

  const elig = keys.filter((s) => {
    const b = universe[s];
    if (b.length < need) return false;
    for (let k = b.length - longWindow; k < b.length; k++) {
      const c = b[k].close;
      if (!(Number.isFinite(c) && c > 0)) return false;
    }
    return true;
  });
  const M = elig.length;
  if (M < minNames) {
    ctx.state.step = {};
    return ew(universe);
  }

  const N = Math.max(minHoldings, Math.round(fraction * M));
  const scores = elig.map((s) => [s, sma(universe[s], shortWindow) / sma(universe[s], longWindow)]);
  const T = new Set(sortRows(scores, true).slice(0, N).map((x) => x[0]));

  const step = {};
  for (const s of keys) {
    const prev = ctx.state.step[s] || 0;
    step[s] = T.has(s) ? Math.min(steps, prev + 1) : 0;
  }
  ctx.state.step = step;

  let sumRaw = 0;
  const raw = {};
  for (const s of elig) {
    raw[s] = step[s] > 0 ? step[s] / steps / N : 0;
    sumRaw += raw[s];
  }
  // clamp float noise so the residual never goes negative
  const residual = Math.max(0, (1 - sumRaw) / M);
  const out = {};
  for (const s of elig) out[s] = raw[s] + residual;
  return out;
}
