// Spec: research/hunt2/campaign-1024/prereg-acad3.json (c1024-acad3-16). Harvey & Siddique 2000, JF 55(3), 1263-1295 (transfer to crypto)
export const meta = {
  id: "c1024-acad3-16__rob2",
  name: "Crypto coskewness: long the 6 alts whose returns co-move least with squared Bitcoin returns, weekly (Harvey-Siddique transfer) (+25%)",
  family: "volatility",
  source: "c1024/acad3",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  longShort: false,
  params: { window: 113, top: 6 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const n = p.window; // 90 returns need 91 common dates
  const btc = universe.BTCUSDT;
  if (!btc || btc.length <= n + 1) return {};
  const btcClose = new Map();
  for (const bar of btc) btcClose.set(bar.time, bar.close);
  const names = [];
  for (const sym of Object.keys(universe)) {
    if (sym === "BTCUSDT") continue;
    const b = universe[sym];
    if (b.length <= n + 1) continue;
    const pairs = [];
    for (let k = b.length - 1; k >= 0 && pairs.length < n + 1; k--) {
      const cb = btcClose.get(b[k].time);
      if (cb !== undefined) pairs.push([b[k].close, cb]);
    }
    if (pairs.length < n + 1) continue;
    pairs.reverse();
    const rs = [], rb = [];
    for (let j = 1; j <= n; j++) {
      rs.push(pairs[j][0] / pairs[j - 1][0] - 1);
      rb.push(pairs[j][1] / pairs[j - 1][1] - 1);
    }
    const ms = rs.reduce((a, x) => a + x, 0) / n;
    const mb = rb.reduce((a, x) => a + x, 0) / n;
    let c3 = 0, vs = 0, vb = 0;
    for (let j = 0; j < n; j++) {
      const a = rs[j] - ms, c = rb[j] - mb;
      c3 += a * c * c;
      vs += a * a;
      vb += c * c;
    }
    const sds = Math.sqrt(vs / (n - 1)), sdb = Math.sqrt(vb / (n - 1));
    if (!(sds > 0 && sdb > 0)) continue;
    names.push({ sym, cosk: c3 / n / (sds * sdb * sdb) });
  }
  const S = names.length;
  const picks = Math.min(p.top, S);
  if (picks < 3) return {};
  names.sort((a, b) => a.cosk - b.cosk || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const x of names.slice(0, picks)) w[x.sym] = 1 / p.top; // spec: 1/top each (cash for missing slots)
  return w;
}
