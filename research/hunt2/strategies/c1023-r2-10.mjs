// c1023 round-2 spec r2-10 (campaign-1023/prereg-r2.json, frozen before code).
// Momentum consensus over 14/21/28-bar horizons, each scored with the most recent 7 bars skipped; top half per horizon, intersected. Weekly.
export const meta = {
  id: "c1023-r2-10",
  name: "Crypto momentum consensus (14/21/28) with the most recent week removed from every horizon, weekly",
  family: "momentum",
  source: "c1023/r2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { horizons: [14, 21, 28], skip: 7, need: 30, minNames: 8, minHold: 3 },
};

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

export function rank(universe, t, ctx) {
  const { horizons, skip, need, minNames, minHold } = ctx.params;
  const rows = Object.keys(universe).filter((s) => universe[s].length >= need);
  const n = rows.length;
  if (n < minNames) return ew(universe);

  let H = null;
  for (const h of horizons) {
    const scored = rows.map((sym) => {
      const b = universe[sym];
      const e = b.length - 1;
      return [sym, b[e - skip].close / b[e - h].close - 1];
    });
    scored.sort((x, y) => y[1] - x[1] || cmp(x[0], y[0]));
    const top = new Set(scored.slice(0, Math.ceil(n / 2)).map((x) => x[0]));
    H = H === null ? top : new Set([...H].filter((s) => top.has(s)));
  }

  const names = H === null ? [] : [...H];
  if (names.length < minHold) return {};
  const out = {};
  for (const s of names) out[s] = 1 / names.length;
  return out;
}
