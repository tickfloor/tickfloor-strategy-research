export const meta = {
  id: "c1022-macro-27",
  name: "Credit-confirmed trend: index above 200d only counts if HYG is too",
  family: "trend",
  source: "c1022/macro", // cited: Murphy (2004) Intermarket Analysis; Gilchrist & Zakrajsek (2012) credit spreads and economic fluctuations
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "HYG"],
  proxyFor: { SPY: "QQQ" },
  rebalance: "daily",
  params: { sma: 200 },
};

function sma(b, n) {
  if (b.length < n) return null;
  let s = 0;
  for (let k = b.length - n; k < b.length; k++) s += b[k].close;
  return s / n;
}

export function rank(universe, t, ctx) {
  const syms = ["QQQ", "DIA", "HYG"];
  if (syms.some((s) => !universe[s]) || universe.HYG.length < 200) {
    const f = {};
    const present = syms.filter((s) => universe[s]);
    for (const s of present) f[s] = 1 / present.length;
    return f;
  }
  const hyOk = universe.HYG[universe.HYG.length - 1].close > sma(universe.HYG, 200);
  const w = {};
  if (hyOk) {
    for (const s of ["QQQ", "DIA"]) {
      const b = universe[s];
      const m = sma(b, 200);
      if (m !== null && b[b.length - 1].close > m) w[s] = 0.5;
    }
  }
  return w;
}
