// c1023 round-2 spec r2-12 (campaign-1023/prereg-r2.json, frozen before code).
// 3-week rank momentum sleeve, gated to cash when BTC's 7-day dollar-volume share is above its 60-day mean (crypto-45 signal as a gate). Weekly.
export const meta = {
  id: "c1023-r2-12",
  name: "Rank-weighted 3-week momentum with a BTC volume-share veto (cash when BTC's 7-day share is above its 60-day mean), weekly",
  family: "momentum",
  source: "c1023/r2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { lookback: 21, need: 23, minNames: 8, sWin: 7, lWin: 60 },
};

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

export function rank(universe, t, ctx) {
  const { lookback, need, minNames, sWin, lWin } = ctx.params;
  const btc = universe.BTCUSDT;
  if (!btc || btc.length < lWin) return {};

  // Veto: BTC dollar-volume share of the market (close * volume) over the last lWin bar times
  const times = [];
  for (let k = btc.length - lWin; k < btc.length; k++) times.push(btc[k].time);
  const tStart = times[0];
  const dvSum = new Map();
  const dvBtc = new Map();
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    for (let j = b.length - 1; j >= 0 && b[j].time >= tStart; j--) {
      const dv = b[j].close * b[j].volume;
      dvSum.set(b[j].time, (dvSum.get(b[j].time) ?? 0) + dv);
      if (sym === "BTCUSDT") dvBtc.set(b[j].time, dv);
    }
  }
  const shares = times.map((tm) => dvBtc.get(tm) / dvSum.get(tm));
  const meanAll = shares.reduce((a, x) => a + x, 0) / lWin;
  const recent = shares.slice(lWin - sWin);
  const meanRecent = recent.reduce((a, x) => a + x, 0) / sWin;
  if (meanRecent > meanAll) return {};

  // Sleeve: rank-weighted 21-bar momentum, best name gets the largest weight
  const rows = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < need) continue;
    const e = b.length - 1;
    rows.push([sym, b[e].close / b[e - lookback].close - 1]);
  }
  if (rows.length < minNames) return ew(universe);
  rows.sort((x, y) => y[1] - x[1] || cmp(x[0], y[0]));
  const n = rows.length;
  const T = (n * (n + 1)) / 2;
  const out = {};
  rows.forEach(([sym], idx) => {
    out[sym] = (n - idx) / T;
  });
  return out;
}
