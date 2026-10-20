// Spec: docs/research/hunt-1003/codex/specs.json (h3-etf-golden-cross-sectors). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-etf-golden-cross-sectors",
  name: "Does the golden cross (50/200) work across sector ETFs?",
  family: "indicator-golden-cross",
  source: "retail trading content: golden cross death cross etf strategy",
  assetClass: "etf",
  timeframe: "1d",
  longShort: false,
  params: { fast: 50, slow: 200, warmupBars: 200 },
};

export function signal(bars, i, ctx) {
  const P = ctx.params;
  if (i + 1 < P.warmupBars) return 0;
  const f = ctx.sma("close", P.fast), s = ctx.sma("close", P.slow);
  return f > s ? 1 : 0;
}
