// c1022 red-team spec 05: low BTC-beta picked only inside the high-volatility half.
// Source: Blitz, van Vliet & Baltussen 2020 (volatility effect vs beta effect).
export const meta = {
  id: "c1022-redteam-05",
  name: "Low BTC-beta picked only inside the high-volatility half",
  family: "equity-factors",
  source: "c1022/redteam",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "monthly",
  params: { window: 90, need: 92, minNames: 8, volHalf: 0.5, pick: 4 },
};

const cmpName = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

// simple returns ret(b,k) for k = e-W+1..e
function retsOf(b, e, W) {
  const r = [];
  for (let k = e - W + 1; k <= e; k++) r.push(b[k].close / b[k - 1].close - 1);
  return r;
}

function covOf(x, y) {
  const n = x.length;
  let mx = 0, my = 0;
  for (let j = 0; j < n; j++) { mx += x[j]; my += y[j]; }
  mx /= n; my /= n;
  let s = 0;
  for (let j = 0; j < n; j++) s += (x[j] - mx) * (y[j] - my);
  return s / (n - 1);
}

export function rank(universe, t, ctx) {
  const { window: W, need, minNames, volHalf, pick } = ctx.params;
  const btc = universe.BTCUSDT;
  if (!btc || btc.length < need) return ew(universe);

  const m = retsOf(btc, btc.length - 1, W);
  const vm = covOf(m, m);
  if (!(vm > 0) || !Number.isFinite(vm)) return ew(universe);

  const rows = []; // [sym, beta, vol]
  for (const sym of Object.keys(universe)) {
    if (sym === "BTCUSDT") continue;
    const b = universe[sym];
    if (b.length < need) continue;
    const r = retsOf(b, b.length - 1, W);
    const beta = covOf(r, m) / vm;
    const vol = Math.sqrt(covOf(r, r));
    if (Number.isFinite(beta) && Number.isFinite(vol)) rows.push([sym, beta, vol]);
  }
  const n = rows.length;
  if (n < minNames) return ew(universe);

  const nHigh = Math.ceil(volHalf * n);
  if (nHigh < pick) return ew(universe);

  const high = rows
    .slice()
    .sort((a, b) => b[2] - a[2] || cmpName(a[0], b[0]))
    .slice(0, nHigh);
  const picks = high
    .sort((a, b) => a[1] - b[1] || cmpName(a[0], b[0]))
    .slice(0, pick);

  const wt = 1 / (pick + 1);
  const out = { BTCUSDT: wt };
  for (const [sym] of picks) out[sym] = wt;
  return out;
}
