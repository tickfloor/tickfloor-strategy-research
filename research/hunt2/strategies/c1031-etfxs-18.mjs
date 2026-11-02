// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-18). 12-1 momentum picked at each month's first bar, 10% stop checked daily, stopped weight goes to SHY (Han-Zhou-Zhu style stop).
export const meta = {
  id: "c1031-etfxs-18",
  name: "12-1 momentum with a 10% per-holding stop-loss and cash-to-SHY, monthly entry, daily checks (Han-Zhou-Zhu) on 25 ETFs",
  family: "momentum",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  rebalance: "daily",
  params: { top: 5, stop: 0.1 },
};

const monthOf = (time) => {
  const d = new Date(time * 1000);
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const info = {};
  for (const s of Object.keys(universe)) {
    const b = universe[s];
    const e = b.length - 1;
    const m = monthOf(b[e].time);
    let a = e;
    while (a > 0 && monthOf(b[a - 1].time) === m) a--;
    if (a + 1 <= 253) continue;
    info[s] = { a, mom: b[a - 21].close / b[a - 252].close - 1 };
  }
  const names = Object.keys(info);
  if (names.length < 10) return {};
  names.sort((x, y) => info[y].mom - info[x].mom || (x < y ? -1 : 1));
  const wt = 1 / p.top;
  const w = {};
  let residual = 0;
  for (const s of names.slice(0, p.top)) {
    const b = universe[s];
    const a = info[s].a;
    const e = b.length - 1;
    let stopped = false;
    for (let k = a + 1; k <= e; k++) {
      if (b[k].close <= (1 - p.stop) * b[a].close) { stopped = true; break; }
    }
    if (stopped) residual += wt;
    else w[s] = (w[s] || 0) + wt;
  }
  if (residual > 0 && universe.SHY) w.SHY = (w.SHY || 0) + residual;
  return w;
}
