// c1022 red-team spec 10 (campaign-1022/prereg-redteam.json, frozen before code).
// Hurst, Ooi & Pedersen 2017 JPM; Jegadeesh & Titman 1993.
// Crypto momentum consensus: a name must sit in the top half on every horizon 14/21/28.
export const meta = {
  id: "c1022-redteam-10__rob2",
  name: "Crypto momentum consensus: top half on every horizon of 14/21/28 days (+25%)",
  family: "momentum",
  source: "c1022/redteam",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { horizons: [18, 26, 35], need: 37, minNames: 8, minHold: 3 },
};

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

export function rank(universe, t, ctx) {
  const { horizons, need, minNames, minHold } = ctx.params;
  const rows = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length >= need) rows.push([sym, b]);
  }
  const n = rows.length;
  if (n < minNames) return ew(universe);

  const cut = Math.ceil(n / 2);
  let H = null;
  for (const h of horizons) {
    const sc = rows.map(([sym, b]) => {
      const e = b.length - 1;
      return [sym, b[e].close / b[e - h].close - 1];
    });
    sc.sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0));
    const top = new Set(sc.slice(0, cut).map((x) => x[0]));
    H = H === null ? top : new Set([...H].filter((s) => top.has(s)));
  }

  if (H.size < minHold) return {};
  const w = {};
  for (const sym of H) w[sym] = 1 / H.size;
  return w;
}
