// Spec: docs/research/hunt-1003/codex/specs.json (h3-cd-three-line-break). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  "id": "h3-cd-three-line-break",
  "name": "Does a three-line-break chart trend rule work on crypto?",
  "family": "chart-line-break",
  "source": "retail trading content: three line break chart non repainting crypto strategy",
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
    "linesToBreak": 3,
    "warmupBars": 20
  }
};

export function signal(bars, i, ctx) {
  const s = ctx.state;
  const c = bars[i].close;
  if (s.lines === undefined) { s.anchor = c; s.dir = 0; s.lines = []; return 0; }
  const L = s.lines;
  if (L.length === 0) {
    if (c !== s.anchor) {
      L.push({ open: s.anchor, close: c });
      s.dir = Math.sign(c - s.anchor);
    }
  } else {
    const last = L[L.length - 1];
    const hi = Math.max(last.open, last.close), lo = Math.min(last.open, last.close);
    let mx = -Infinity, mn = Infinity;
    for (const l of L) {
      mx = Math.max(mx, l.open, l.close);
      mn = Math.min(mn, l.open, l.close);
    }
    let nl = null;
    if (s.dir > 0) {
      if (c > hi) nl = { open: hi, close: c };
      else if (c < mn) { nl = { open: lo, close: c }; s.dir = -1; }
    } else {
      if (c < lo) nl = { open: lo, close: c };
      else if (c > mx) { nl = { open: hi, close: c }; s.dir = 1; }
    }
    if (nl) { L.push(nl); if (L.length > 3) L.shift(); }
  }
  if (i < 20) return 0;
  return s.dir > 0 ? 1 : 0;
}

