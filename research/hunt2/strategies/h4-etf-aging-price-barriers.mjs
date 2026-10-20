// Spec: docs/research/hunt-1004/codex/specs.json (h4-etf-aging-price-barriers). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-etf-aging-price-barriers",
  "name": "Do exits that tighten with trade age work?",
  "family": "age-price-barrier",
  "source": "retail trading content: trade age decaying profit target tightening stop neutral entry",
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
    "initialGainBarrier": 0.08,
    "initialLossBarrier": 0.05,
    "decayBars": 10,
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

    return 1;
  }
  if (s.pos !== 1) return 0;
  const age = i - s.ei;
  const d = Math.exp(-age / p.decayBars);
  const exit = c >= s.entry * (1 + p.initialGainBarrier * d) || c <= s.entry * (1 - p.initialLossBarrier * d);
  if (exit || age >= p.maxHoldBars) { s.pos = 0; return 0; }
  return 1;
}
