// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-48). Portfolio rank mode, weekly.

export const meta = {
  id: "c1022-crypto-48",
  name: "Idiosyncratic volume shock relative to the market",
  family: "momentum",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { win: 30, z: 2.0, top: 3 },
};

export function rank(universe, t, ctx) {
  const { win, z: zThr, top } = ctx.params;
  const zv = {};
  for (const k of Object.keys(universe)) {
    const b = universe[k];
    if (b.length < win + 1) continue;
    // log volume: today plus the win prior days
    const lv = [];
    let ok = true;
    for (let j = b.length - win - 1; j < b.length; j++) {
      if (!(b[j].volume > 0)) { ok = false; break; }
      lv.push(Math.log(b[j].volume));
    }
    if (!ok) continue;
    const prior = lv.slice(0, win);
    const m = prior.reduce((a, x) => a + x, 0) / win;
    const sd = Math.sqrt(prior.reduce((a, x) => a + (x - m) ** 2, 0) / (win - 1));
    if (!(sd > 0)) continue;
    zv[k] = {
      z: (lv[win] - m) / sd,
      r1: b[b.length - 1].close / b[b.length - 2].close - 1,
    };
  }
  const ks = Object.keys(zv);
  if (!ks.length) return {};
  const zm = ks.reduce((a, k) => a + zv[k].z, 0) / ks.length;
  const picks = ks
    .map((k) => [k, zv[k].z - zm, zv[k].r1])
    .filter((x) => x[1] >= zThr && x[2] > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top);
  if (!picks.length) return {};
  const w = {};
  for (const [k] of picks) w[k] = 1 / picks.length;
  return w;
}
