// Spec: docs/research/hunt-1003/codex/specs.json (h3-cd-cyber-cycle). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  "id": "h3-cd-cyber-cycle",
  "name": "Does Ehlers' Cyber Cycle work on crypto?",
  "family": "indicator-cyber-cycle",
  "source": "John F. Ehlers, Cybernetic Analysis for Stocks and Futures (2004)",
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
    "alpha": 0.07,
    "maxHoldBars": 30,
    "warmupBars": 50
  }
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.entry = -1; st.c1 = 0; st.c2 = 0; }
  const P = (k) => (bars[k].high + bars[k].low) / 2;
  const a = 0.07;
  let c = 0;
  if (i >= 2 && i < 7) c = (P(i) - 2 * P(i - 1) + P(i - 2)) / 4;
  else if (i >= 7) {
    const S = (k) => (P(k) + 2 * P(k - 1) + 2 * P(k - 2) + P(k - 3)) / 6;
    c = (1 - a / 2) * (1 - a / 2) * (S(i) - 2 * S(i - 1) + S(i - 2)) + 2 * (1 - a) * st.c1 - (1 - a) * (1 - a) * st.c2;
  }
  const c1 = st.c1, c2 = st.c2;
  st.c2 = c1; st.c1 = c;
  if (i < ctx.params.warmupBars) return 0;
  if (st.pos === 1) {
    if (c < c1 || i - st.entry >= ctx.params.maxHoldBars) { st.pos = 0; return 0; }
    return 1;
  }
  if (c > c1 && c1 <= c2 && c < 0) { st.pos = 1; st.entry = i; return 1; }
  return 0;
}
