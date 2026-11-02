// c1031 round-4 spec c1031-r4-32 (campaign-1031/prereg-r4.json, frozen before code).
// Second 9-ETF set: best risk ETF above the SHY hurdle with the 20% volatility overlay (remainder in the best bond); risk-off = best bond. Monthly, long-only.
export const meta = {
  id: "c1031-r4-32",
  name: "Second 9-ETF set with the SHY hurdle and the 20% volatility overlay together, remainder in the best bond, monthly",
  family: "trend",
  source: "c1031/r4",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLV", "XLE", "GLD", "VNQ", "AGG", "IEF", "TLT", "SHY"],
  rebalance: "monthly",
  params: { lookback: 252, need: 254, risk: ["XLK", "XLV", "XLE", "GLD", "VNQ"], bonds: ["AGG", "IEF", "TLT"], hurdle: "SHY", volWindow: 21, targetVar: 0.04 },
};

const ret = (b, j) => b[j].close / b[j - 1].close - 1;
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

function mean(xs) {
  let m = 0;
  for (const x of xs) m += x;
  return m / xs.length;
}

function sampleVar(xs) {
  const m = mean(xs);
  let s = 0;
  for (const x of xs) s += (x - m) ** 2;
  return s / (xs.length - 1);
}

// trailing total return over lookback bars; null when missing or shorter than need
function R(universe, s, ctx) {
  const b = universe[s];
  if (!b || b.length < ctx.params.need) return null;
  const e = b.length - 1;
  return b[e].close / b[e - ctx.params.lookback].close - 1;
}

// scored members of a list as [sym, R], best first (ties by name ascending)
function ranked(universe, list, ctx) {
  return list
    .map((s) => [s, R(universe, s, ctx)])
    .filter((x) => x[1] !== null)
    .sort((x, y) => y[1] - x[1] || cmp(x[0], y[0]));
}

export function rank(universe, t, ctx) {
  const { risk, bonds, hurdle, volWindow, targetVar } = ctx.params;
  const bestRisk = ranked(universe, risk, ctx)[0];
  const bestBond = ranked(universe, bonds, ctx)[0];
  if (!bestRisk && !bestBond) return ew(universe);

  const hR = R(universe, hurdle, ctx);
  const hurdleR = hR === null ? 0 : hR;
  if (bestRisk && bestRisk[1] > hurdleR) {
    const sym = bestRisk[0];
    const b = universe[sym];
    const e = b.length - 1;
    const r = [];
    for (let j = 0; j < volWindow; j++) r.push(ret(b, e - j));
    const v = sampleVar(r) * 252;
    const w = v > 0 ? Math.min(1, targetVar / v) : 1;
    const out = { [sym]: w };
    if (bestBond && w < 1) out[bestBond[0]] = 1 - w;
    return out;
  }
  if (bestBond) return { [bestBond[0]]: 1 };
  return ew(universe);
}
