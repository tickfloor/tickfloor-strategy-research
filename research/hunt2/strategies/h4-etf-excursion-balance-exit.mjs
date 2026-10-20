// Spec: docs/research/hunt-1004/codex/specs.json (h4-etf-excursion-balance-exit). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-etf-excursion-balance-exit",
  "name": "Does requiring gains to repay a trade's worst excursion improve exits?",
  "family": "excursion-balance",
  "source": "retail trading content: maximum adverse favorable excursion balance trade exit",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "QQQ",
    "DIA",
    "XLK",
    "XLF",
    "XLE",
    "XLV",
    "TLT",
    "GLD"
  ],
  "longShort": false,
  "params": {
    "warmupBars": 64,
    "cycleBars": 63,
    "minAgeBars": 5,
    "minFavorableExcursion": 0.03,
    "maxHoldBars": 42
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params, s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.entry = 0; s.ei = -1; }
  if (i < p.warmupBars) return 0;
  const c = bars[i].close;
  if ((i - p.warmupBars) % p.cycleBars === 0) {
    s.pos = 1; s.entry = c; s.ei = i;
    s.best = c; s.worst = c;
    return 1;
  }
  if (s.pos !== 1) return 0;
  const age = i - s.ei;
  s.best = Math.max(s.best, c); s.worst = Math.min(s.worst, c);
  const U = s.best / s.entry - 1, D = 1 - s.worst / s.entry;
  const exit = age >= p.minAgeBars && U >= p.minFavorableExcursion && D >= U;
  if (exit || age >= p.maxHoldBars) { s.pos = 0; return 0; }
  return 1;
}
