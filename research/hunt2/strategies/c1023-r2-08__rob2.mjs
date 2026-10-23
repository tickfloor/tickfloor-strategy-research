// c1023 round-2 spec r2-08 (campaign-1023/prereg-r2.json, frozen before code).
// Retail-41 alt/BTC relative-strength rule applied only inside the 9 lowest-beta alts (refreshed monthly). Daily, long-only.
export const meta = {
  id: "c1023-r2-08__rob2",
  name: "Alt/BTC ratio above its 50-day SMA, restricted to the 9 alts with the lowest 90-day BTC beta (A x B) (+25%)",
  family: "momentum",
  source: "c1023/r2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "daily",
  params: { ratioSma: 63, btcSma: 50, betaWindow: 90, need: 92, nLow: 9 },
};

const ret = (b, k) => b[k].close / b[k - 1].close - 1;
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ewOver(names) {
  const w = {};
  for (const s of names) w[s] = 1 / names.length;
  return w;
}

export function rank(universe, t, ctx) {
  const { ratioSma, btcSma, betaWindow, need, nLow } = ctx.params;
  const btc = universe.BTCUSDT;
  if (!btc || btc.length < need) return {};

  // Sleeve set S: refreshed on the first rank call of each UTC calendar month, kept in ctx.state
  const d = new Date(t * 1000);
  const month = d.getUTCFullYear() * 12 + d.getUTCMonth();
  if (ctx.state.month !== month) {
    ctx.state.month = month;
    const eB = btc.length - 1;
    const rB = [];
    for (let k = eB - betaWindow + 1; k <= eB; k++) rB.push(ret(btc, k));
    const mB = rB.reduce((a, x) => a + x, 0) / rB.length;
    let varB = 0;
    for (const x of rB) varB += (x - mB) ** 2;
    const betas = [];
    for (const sym of Object.keys(universe)) {
      const b = universe[sym];
      if (sym === "BTCUSDT" || b.length < need) continue;
      const e = b.length - 1;
      const rs = [];
      for (let k = e - betaWindow + 1; k <= e; k++) rs.push(ret(b, k));
      const ms = rs.reduce((a, x) => a + x, 0) / rs.length;
      let cov = 0;
      for (let j = 0; j < rs.length; j++) cov += (rs[j] - ms) * (rB[j] - mB);
      betas.push([sym, cov / varB]);
    }
    betas.sort((x, y) => x[1] - y[1] || cmp(x[0], y[0]));
    ctx.state.S = betas.slice(0, nLow).map((x) => x[0]);
  }

  // BTC trend gate
  const eB = btc.length - 1;
  let sumB = 0;
  for (let k = eB - btcSma + 1; k <= eB; k++) sumB += btc[k].close;
  const btcUp = btc[eB].close > sumB / btcSma;
  if (!btcUp) return {};

  // Holders: alts in S whose current alt/BTC ratio is above its mean over the last ratioSma bars (age-aligned from the end)
  const holders = [];
  for (const sym of ctx.state.S) {
    const b = universe[sym];
    if (!b || b.length < ratioSma) continue;
    const R = (m) => b[b.length - 1 - m].close / btc[btc.length - 1 - m].close;
    let sumR = 0;
    for (let m = 0; m < ratioSma; m++) sumR += R(m);
    if (R(0) > sumR / ratioSma) holders.push(sym);
  }
  if (holders.length === 0) return { BTCUSDT: 1 };
  return ewOver(holders);
}
