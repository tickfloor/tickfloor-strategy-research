// Spec: docs/research/hunt-1003/codex/specs.json (h3-etf-hull-turn). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-etf-hull-turn",
  name: "Does the Hull moving average work on ETFs?",
  family: "indicator-hull",
  source: "https://alanhull.com/the-hull-moving-average/",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ","DIA","XLK","XLF","XLE","XLV","XLI","XLP","XLY","XLU","XLB","XLC","VNQ","TLT","IEF","SHY","LQD","HYG","AGG","GLD","SLV","USO","UNG","DBC","UUP"],
  longShort: false,
  params: { hmaLength: 49, halfLength: 24, smoothingLength: 7, warmupBars: 60 },
};

function wma(arr, end, n) {
  let num = 0;
  for (let j = 0; j < n; j++) num += (n - j) * arr[end - j];
  return num / (n * (n + 1) / 2);
}

export function signal(bars, i, ctx) {
  const p = ctx.params, s = ctx.state;
  if (s.raw === undefined) { s.raw = []; s.hma = []; s.close = []; }
  s.close.push(bars[i].close);
  let raw = NaN;
  if (i + 1 >= p.hmaLength) raw = 2 * wma(s.close, i, p.halfLength) - wma(s.close, i, p.hmaLength);
  s.raw.push(raw);
  let h = NaN;
  if (i + 1 >= p.hmaLength + p.smoothingLength - 1) h = wma(s.raw, i, p.smoothingLength);
  s.hma.push(h);
  if (i + 1 < p.warmupBars || !isFinite(h) || !isFinite(s.hma[i - 1])) return 0;
  return h > s.hma[i - 1] ? 1 : 0;
}
