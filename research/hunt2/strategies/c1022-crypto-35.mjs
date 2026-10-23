// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-35). Portfolio rank mode, weekly.

export const meta = {
  id: "c1022-crypto-35",
  name: "Alt-beta regime: alts only when they amplify BTC",
  family: "other",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { betaWin: 60, hi: 1.3, lo: 1.0, top: 5, momLb: 20 },
};

const ret = (b, n) => b[b.length - 1].close / b[b.length - 1 - n].close - 1;

// [BTC daily return, EW-alt daily return] for the last nDays days (days with >= 1 alt bar)
function dailyPairs(universe, btc, nDays, alts) {
  const maps = alts.map((k) => {
    const b = universe[k];
    const m = new Map();
    for (let j = Math.max(0, b.length - nDays - 2); j < b.length; j++) m.set(b[j].time, b[j].close);
    return m;
  });
  const out = [];
  for (let j = btc.length - nDays; j < btc.length; j++) {
    const t0 = btc[j - 1].time;
    const t1 = btc[j].time;
    const rb = btc[j].close / btc[j - 1].close - 1;
    let sum = 0;
    let cnt = 0;
    for (const m of maps) {
      const a0 = m.get(t0);
      const a1 = m.get(t1);
      if (a0 !== undefined && a1 !== undefined) { sum += a1 / a0 - 1; cnt++; }
    }
    if (cnt) out.push([rb, sum / cnt]);
  }
  return out;
}

// OLS slope of y on x; NaN when too few points or no variance
function olsSlope(pairs) {
  if (pairs.length < 20) return NaN;
  const mx = pairs.reduce((a, p) => a + p[0], 0) / pairs.length;
  const my = pairs.reduce((a, p) => a + p[1], 0) / pairs.length;
  let cov = 0;
  let vx = 0;
  for (const [x, y] of pairs) { cov += (x - mx) * (y - my); vx += (x - mx) ** 2; }
  return vx > 0 ? cov / vx : NaN;
}

export function rank(universe, t, ctx) {
  const { betaWin, hi, lo, top, momLb } = ctx.params;
  const s = ctx.state;
  const btc = universe.BTCUSDT;
  if (!btc) return {};
  const alts = Object.keys(universe).filter((k) => k !== "BTCUSDT");
  if (btc.length > betaWin && alts.length) {
    const beta = olsSlope(dailyPairs(universe, btc, betaWin, alts));
    if (beta >= hi) s.mode = "alts";
    else if (beta <= lo) s.mode = "btc";
  }
  if (s.mode !== "alts") return { BTCUSDT: 1 };
  const picks = alts
    .filter((k) => universe[k].length > momLb)
    .map((k) => [k, ret(universe[k], momLb)])
    .sort((a, b) => b[1] - a[1])
    .slice(0, top);
  if (!picks.length) return {};
  const w = {};
  for (const [k] of picks) w[k] = 1 / picks.length;
  return w;
}
