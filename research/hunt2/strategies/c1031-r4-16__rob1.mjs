// c1031 round-4 spec c1031-r4-16 (campaign-1031/prereg-r4.json, frozen before code).
// Intersection of top-half 5% VaR and top-half downside beta, book capped at 10 names. Monthly, long-only.
export const meta = {
  id: "c1031-r4-16__rob1",
  name: "Intersection of top-half value-at-risk and top-half downside beta on the 40 large caps, 10-name book cap, monthly (-25%)",
  family: "equity-factors",
  source: "c1031/r4",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  params: { window: 189, minDown: 60, need: 252, minNames: 20, book: 10, minBook: 5, q: 0.05, k: 13, varWindow: 250 },
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

// 5% empirical VaR: minus the k-th lowest of the win daily returns ending at bar e
function varOf(b, e, win, k) {
  const r = [];
  for (let j = 0; j < win; j++) r.push(ret(b, e - j));
  r.sort((x, y) => x - y);
  return -r[k - 1];
}

// names sorted by value descending (ties by name ascending)
const sortDesc = (names, val) => names.slice().sort((x, y) => val.get(y) - val.get(x) || cmp(x, y));

export function rank(universe, t, ctx) {
  const { window, minDown, need, minNames, book, minBook, k, varWindow } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length >= need);
  const M = elig.length;
  if (M < minNames) return ew(universe);
  const E = new Map(elig.map((s) => [s, universe[s].length - 1]));

  const m = [];
  for (let j = 0; j < window; j++) {
    let s = 0;
    for (const sym of elig) s += ret(universe[sym], E.get(sym) - j);
    m.push(s / M);
  }
  const down = [];
  for (let j = 0; j < window; j++) if (m[j] < 0) down.push(j);
  if (down.length < minDown) return ew(universe);
  const md = mean(down.map((j) => m[j]));
  let vm = 0;
  for (const j of down) vm += (m[j] - md) ** 2;
  if (!(vm > 0)) return ew(universe);

  const beta = new Map();
  const va = new Map();
  for (const sym of elig) {
    const b = universe[sym];
    const e = E.get(sym);
    const r = down.map((j) => ret(b, e - j));
    const rd = mean(r);
    let c = 0;
    down.forEach((j, q) => {
      c += (r[q] - rd) * (m[j] - md);
    });
    beta.set(sym, c / vm);
    va.set(sym, varOf(b, e, varWindow, k));
  }

  const half = Math.ceil(M / 2);
  const Hv = sortDesc(elig, va).slice(0, half);
  const Hb = sortDesc(elig, beta).slice(0, half);
  let I = Hv.filter((s) => Hb.includes(s));
  if (I.length > book) {
    // rank 1 = highest in each full sort; keep the smallest rank sum
    const rv = new Map(sortDesc(elig, va).map((s, i) => [s, i + 1]));
    const rb = new Map(sortDesc(elig, beta).map((s, i) => [s, i + 1]));
    I = I
      .slice()
      .sort((x, y) => rv.get(x) + rb.get(x) - (rv.get(y) + rb.get(y)) || cmp(x, y))
      .slice(0, book);
  }
  if (I.length < minBook) return ew(universe);

  const out = {};
  for (const s of I) out[s] = 1 / I.length;
  return out;
}
