// Spec: docs/research/hunt-1003/codex/specs.json (h3-hourly-log-renko). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  "id": "h3-hourly-log-renko",
  "name": "Do non-repainting Renko trends work on crypto?",
  "family": "event-price-renko",
  "source": "https://www.tradingview.com/support/solutions/43000502284-understanding-renko-charts/",
  "assetClass": "crypto",
  "timeframe": "1h",
  "assets": [
    "BTCUSDT",
    "BNBUSDT",
    "XRPUSDT",
    "ADAUSDT",
    "DOGEUSDT",
    "LTCUSDT",
    "LINKUSDT",
    "TRXUSDT"
  ],
  "longShort": false,
  "params": {
    "brickPct": 0.01,
    "reversalBricks": 2,
    "entryRunBricks": 3,
    "exitRunBricks": 2,
    "maxHoldHours": 168,
    "warmupBars": 168
  }
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  const w = Math.log(1.01);
  const lc = Math.log(bars[i].close);
  if (st.pos === undefined) { st.pos = 0; st.end = lc; st.dir = 0; st.run = 0; st.armed = true; st.entry = -1; }
  let down = false;
  if (st.dir === 0) {
    const d = lc - st.end, n = Math.floor(Math.abs(d) / w);
    if (n >= 1) { st.dir = d > 0 ? 1 : -1; st.end += st.dir * n * w; st.run = n; down = st.dir === -1; }
  } else {
    const d = (lc - st.end) * st.dir, n = Math.floor(Math.abs(d) / w);
    if (d > 0) {
      if (n >= 1) { st.end += st.dir * n * w; st.run += n; down = st.dir === -1; }
    } else if (n >= 2) {
      st.dir = -st.dir; st.end += st.dir * n * w; st.run = n - 1; down = st.dir === -1;
    }
  }
  if (down) st.armed = true;
  if (i < ctx.params.warmupBars) return 0;
  if (st.pos === 1) {
    if ((st.dir === -1 && st.run >= ctx.params.exitRunBricks)) { st.pos = 0; return 0; }
    if (i - st.entry >= ctx.params.maxHoldHours) { st.pos = 0; st.armed = false; return 0; }
    return 1;
  }
  if (st.armed && st.dir === 1 && st.run >= ctx.params.entryRunBricks) { st.pos = 1; st.entry = i; return 1; }
  return 0;
}
