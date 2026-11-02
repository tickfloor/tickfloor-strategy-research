export const meta = {
  id: "c1031-tjr-02",
  name: "Core TJR model, step 1-2: swing-high sweep confirmed by a break of structure, target the prior liquidity draw (crypto 1h)",
  family: "tjr_core_model",
  source: "c1031/tjr",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { k: 2, sweepATR: 0.05, confirmBars: 12, drawLookback: 48, rMin: 0.5, rMax: 4, minRR: 1, maxHold: 48 },
};

// Swing k=2 (strict), confirmed at bar j+2. Called once per bar, in order.
function swingsUpdate(bars, i, st) {
  const j = i - 2;
  if (j < 2) return;
  const h = bars[j].high, l = bars[j].low;
  if (h > bars[j - 2].high && h > bars[j - 1].high && h > bars[j + 1].high && h > bars[j + 2].high) st.sh.push({ idx: j, p: h });
  if (l < bars[j - 2].low && l < bars[j - 1].low && l < bars[j + 1].low && l < bars[j + 2].low) st.sl.push({ idx: j, p: l });
}

function hiMax(bars, a, b) { let m = -Infinity; for (let k = a; k <= b; k++) if (bars[k].high > m) m = bars[k].high; return m; }
function loMin(bars, a, b) { let m = Infinity; for (let k = a; k <= b; k++) if (bars[k].low < m) m = bars[k].low; return m; }

export function signal(bars, i, ctx) {
  const st = ctx.state;
  const P = ctx.params;
  if (st.sh === undefined) { st.sh = []; st.sl = []; st.pos = 0; st.armed = null; st.entry = 0; st.stop = 0; st.tgt = 0; }
  swingsUpdate(bars, i, st);
  const bar = bars[i];
  const A = ctx.atr(14, i);

  if (st.pos !== 0) {
    const held = i - st.entry;
    const hit = st.pos === -1 ? (bar.close >= st.stop || bar.close <= st.tgt) : (bar.close <= st.stop || bar.close >= st.tgt);
    if (hit || held >= P.maxHold) { st.pos = 0; st.armed = null; return 0; }
    return st.pos;
  }
  if (Number.isNaN(A)) return 0;

  const hs = st.sh[st.sh.length - 1];
  const ls = st.sl[st.sl.length - 1];
  const shortSweep = hs !== undefined && i - hs.idx <= 60 && bar.high > hs.p + P.sweepATR * A;
  const longSweep = ls !== undefined && i - ls.idx <= 60 && bar.low < ls.p - P.sweepATR * A;

  // A sweep (re)starts the confirm window; otherwise extend the sweep extreme.
  if (shortSweep !== longSweep) {
    if (i >= P.drawLookback) {
      // restart from the new sweep bar; sweepHigh/Low is extended (kept) from a still-live earlier window on the same side
      const live = st.armed !== null && i - st.armed.s <= P.confirmBars ? st.armed : null;
      if (shortSweep) st.armed = { side: -1, s: i, lvl: loMin(bars, hs.idx, i - 1), tgt: loMin(bars, i - P.drawLookback, i - 1), ext: live !== null && live.side === -1 ? Math.max(live.ext, bar.high) : bar.high };
      else st.armed = { side: 1, s: i, lvl: hiMax(bars, ls.idx, i - 1), tgt: hiMax(bars, i - P.drawLookback, i - 1), ext: live !== null && live.side === 1 ? Math.min(live.ext, bar.low) : bar.low };
    }
  } else if (st.armed !== null && i > st.armed.s) {
    if (st.armed.side === -1) st.armed.ext = Math.max(st.armed.ext, bar.high);
    else st.armed.ext = Math.min(st.armed.ext, bar.low);
  }

  const a = st.armed;
  if (a === null) return 0;
  if (i - a.s > P.confirmBars) { st.armed = null; return 0; }
  const bos = a.side === -1 ? bar.close < a.lvl : bar.close > a.lvl;
  if (!bos) return 0;
  st.armed = null;
  const R = a.side === -1 ? a.ext - bar.close : bar.close - a.ext;
  if (R < P.rMin * A || R > P.rMax * A) return 0;
  const room = a.side === -1 ? bar.close - a.tgt : a.tgt - bar.close;
  if (room < P.minRR * R) return 0;
  st.pos = a.side; st.entry = i; st.stop = a.ext; st.tgt = a.tgt;
  return a.side;
}
