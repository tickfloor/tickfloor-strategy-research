// Spec: docs/research/hunt-1004/codex/specs.json (h4-cd-sign-entropy). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-cd-sign-entropy",
  "name": "Does predictable return-sign ordering help crypto entries?",
  "family": "path-order",
  "source": "retail trading content: return sign transition entropy crypto trading filter",
  "assetClass": "crypto",
  "timeframe": "1d",
  "assets": [
    "BTCUSDT",
    "BNBUSDT",
    "XRPUSDT",
    "ADAUSDT",
    "DOGEUSDT",
    "LTCUSDT",
    "LINKUSDT",
    "TRXUSDT",
    "BCHUSDT",
    "ATOMUSDT",
    "ETCUSDT",
    "DASHUSDT",
    "ZECUSDT",
    "AVAXUSDT",
    "UNIUSDT",
    "NEARUSDT",
    "AAVEUSDT",
    "HBARUSDT"
  ],
  "longShort": false,
  "params": {
    "warmupBars": 64,
    "cycleBars": 21,
    "pairWindow": 40,
    "entropyCeilingBits": 1.8,
    "holdBars": 7
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params, s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.entryIdx = -1; }
  if (i < p.warmupBars) return 0;
  if (s.pos === 1) {
    if (i - s.entryIdx >= p.holdBars) { s.pos = 0; } else return 1;
  }
  if ((i - p.warmupBars) % p.cycleBars !== 0) return 0;
  const sg = (k) => (bars[k].close >= bars[k - 1].close ? 1 : -1);
  const cnt = [0, 0, 0, 0];
  for (let k = i - p.pairWindow + 1; k <= i; k++) cnt[(sg(k - 1) > 0 ? 0 : 2) + (sg(k) > 0 ? 0 : 1)]++;
  let H = 0;
  for (const c of cnt) if (c > 0) { const q = c / p.pairWindow; H -= q * Math.log(q) / Math.log(2); }
  if (H <= p.entropyCeilingBits) { s.pos = 1; s.entryIdx = i; return 1; }
  return 0;
}
