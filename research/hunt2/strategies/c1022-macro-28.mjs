export const meta = {
  id: "c1022-macro-28",
  name: "Sector momentum rotation only while credit is in an uptrend (HYG/LQD ratio)",
  family: "momentum",
  source: "c1022/macro", // cited: Daniel & Moskowitz (2016) Momentum crashes; Murphy (2004) intermarket credit lead
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "HYG", "LQD", "SHY"],
  rebalance: "monthly",
  params: { mom: 126, topN: 3, ratioSma: 100 },
};

const SECT = ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"];
const LIST = SECT.concat(["HYG", "LQD", "SHY"]);

function byReturn(a, b) { return b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0); }

export function rank(universe, t, ctx) {
  const hy = universe.HYG, lq = universe.LQD;
  if (!hy || !lq || hy.length < 100 || lq.length < 100) {
    const f = {};
    const present = LIST.filter((s) => universe[s]);
    for (const s of present) f[s] = 1 / present.length;
    return f;
  }
  let sum = 0;
  for (let k = 0; k < 100; k++) sum += hy[hy.length - 1 - k].close / lq[lq.length - 1 - k].close;
  const cur = hy[hy.length - 1].close / lq[lq.length - 1].close;
  if (cur > sum / 100) {
    const scored = [];
    for (const s of SECT) {
      const b = universe[s];
      if (!b || b.length < 127) continue;
      scored.push([s, b[b.length - 1].close / b[b.length - 127].close - 1]);
    }
    scored.sort(byReturn);
    const w = {};
    for (const [s] of scored.slice(0, 3)) w[s] = 1 / 3;
    return w;
  }
  return universe.SHY ? { SHY: 1 } : {};
}
