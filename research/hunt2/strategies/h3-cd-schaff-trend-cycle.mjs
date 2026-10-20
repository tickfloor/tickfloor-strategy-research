// Spec: docs/research/hunt-1003/codex/specs.json (h3-cd-schaff-trend-cycle). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  "id": "h3-cd-schaff-trend-cycle",
  "name": "Does the Schaff Trend Cycle work on crypto?",
  "family": "indicator-schaff",
  "source": "retail trading content: Schaff Trend Cycle 23 50 10 trading strategy",
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
    "fastPeriod": 23,
    "slowPeriod": 50,
    "cyclePeriod": 10,
    "smoothing": 0.5,
    "entryLevel": 25,
    "exitLevel": 75,
    "maxHoldBars": 60,
    "warmupBars": 100
  }
};

export function signal(bars, i, ctx) {
  const s = ctx.state;
  if (s.pos === undefined) {
    s.pos = 0; s.entryIndex = -1; s.k1 = 50; s.k2 = 50; s.pf = 50; s.stc = 50;
    s.Ms = []; s.pfs = [];
  }
  const e50 = ctx.ema("close", 50, i);
  if (!Number.isFinite(e50)) return 0;
  const prev = s.stc;
  s.Ms.push(ctx.ema("close", 23, i) - e50);
  if (s.Ms.length > 10) s.Ms.shift();
  if (s.Ms.length === 10) {
    let mn = Infinity, mx = -Infinity;
    for (const v of s.Ms) { if (v < mn) mn = v; if (v > mx) mx = v; }
    if (mx - mn !== 0) s.k1 = 100 * (s.Ms[9] - mn) / (mx - mn);
    s.pf = s.pf + 0.5 * (s.k1 - s.pf);
    s.pfs.push(s.pf);
    if (s.pfs.length > 10) s.pfs.shift();
    if (s.pfs.length === 10) {
      let a = Infinity, b = -Infinity;
      for (const v of s.pfs) { if (v < a) a = v; if (v > b) b = v; }
      if (b - a !== 0) s.k2 = 100 * (s.pfs[9] - a) / (b - a);
      s.stc = s.stc + 0.5 * (s.k2 - s.stc);
    }
  }
  if (i < 100 || s.Ms.length < 10 || s.pfs.length < 10) return 0;
  const cur = s.stc;
  if (s.pos === 1) {
    if ((prev >= 75 && cur < 75) || cur < 25 || i - s.entryIndex >= 60) {
      s.pos = 0;
      return 0;
    }
    return 1;
  }
  if (prev <= 25 && cur > 25) { s.pos = 1; s.entryIndex = i; }
  return s.pos;
}

