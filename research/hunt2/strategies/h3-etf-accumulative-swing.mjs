// Spec: docs/research/hunt-1003/codex/specs.json (h3-etf-accumulative-swing). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-etf-accumulative-swing",
  name: "Does Wilder's Accumulative Swing Index work on ETFs?",
  family: "indicator-swing-index",
  source: "J. Welles Wilder Jr., New Concepts in Technical Trading Systems (1978)",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ","DIA","XLK","XLF","XLE","XLV","XLI","XLP","XLY","XLU","XLB","XLC","VNQ","TLT","IEF","SHY","LQD","HYG","AGG","GLD","SLV","USO","UNG","DBC","UUP"],
  longShort: false,
  params: { limitMove: 100, signalLength: 20, warmupBars: 64 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, s = ctx.state;
  if (s.asi === undefined) { s.asi = 0; s.sig = 0; }
  if (i > 0) {
    const b = bars[i], q = bars[i - 1];
    const A = Math.abs(b.high - q.close), B = Math.abs(b.low - q.close), C = b.high - b.low, D = Math.abs(q.close - q.open);
    const K = Math.max(A, B);
    let R;
    if (A > B && A > C) R = A - 0.5 * B + 0.25 * D;
    else if (B > A && B > C) R = B - 0.5 * A + 0.25 * D;
    else R = C + 0.25 * D;
    const N = b.close - q.close + 0.5 * (b.close - b.open) + 0.25 * (q.close - q.open);
    const si = R === 0 ? 0 : 50 * N * K / (p.limitMove * R);
    if (isFinite(si)) s.asi += si;
    s.sig = s.sig + (2 / (p.signalLength + 1)) * (s.asi - s.sig);
  }
  if (i < p.warmupBars) return 0;
  return s.asi > s.sig ? 1 : 0;
}
