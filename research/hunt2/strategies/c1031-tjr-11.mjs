export const meta = {
  id: "c1031-tjr-11",
  name: "Standalone inverse FVG: a close through the outer edge of a recent FVG stack flips the gap into a reversal signal (crypto 1h)",
  family: "fair_value_gap",
  source: "c1031/tjr",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { minGapATR: 0.3, activeBars: 48, rMin: 0.3, rMax: 4, targetR: 2, maxHold: 24 },
};

// FVG records are created at bar c (3-bar pattern ending at c) and kept while active.
// Bullish: lower = high[c-2], upper = low[c]; mitigated by a close below lower.
// Bearish: lower = high[c], upper = low[c-2]; mitigated by a close above upper.
function purge(st, i, bars) {
  const prev = i >= 1 ? bars[i - 1].close : null;
  st.recs = st.recs.filter((r) => {
    if (r.c < i - st.P.activeBars) return false;
    if (prev === null) return true;
    return r.side === 1 ? prev >= r.lo : prev <= r.hi;
  });
}

function detect(bars, i, ctx, st) {
  if (i < 2) return;
  const A = ctx.atr(14, i);
  if (Number.isNaN(A)) return;
  const bar = bars[i], mid = bars[i - 1], old = bars[i - 2];
  if (bar.low > old.high && mid.close > mid.open && bar.low - old.high >= st.P.minGapATR * A) {
    st.recs.push({ c: i, side: 1, lo: old.high, hi: bar.low });
  } else if (bar.high < old.low && mid.close < mid.open && old.low - bar.high >= st.P.minGapATR * A) {
    st.recs.push({ c: i, side: -1, lo: bar.high, hi: old.low });
  }
}

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.recs === undefined) { st.recs = []; st.pos = 0; st.entry = 0; st.stop = 0; st.tgt = 0; st.P = ctx.params; }
  const P = st.P;
  purge(st, i, bars);
  const bar = bars[i];

  if (st.pos !== 0) {
    const held = i - st.entry;
    const hit = st.pos === 1 ? (bar.close <= st.stop || bar.close >= st.tgt) : (bar.close >= st.stop || bar.close <= st.tgt);
    if (hit || held >= P.maxHold) { st.pos = 0; detect(bars, i, ctx, st); return 0; }
    detect(bars, i, ctx, st);
    return st.pos;
  }

  let ret = 0;
  const A = ctx.atr(14, i);
  if (!Number.isNaN(A)) {
    const bulls = st.recs.filter((r) => r.side === 1);
    const bears = st.recs.filter((r) => r.side === -1);
    let bullTrig = false, bearTrig = false;
    let stackBottom = 0, stackTop = 0;
    if (bulls.length) {
      stackBottom = Math.min(...bulls.map((r) => r.lo));
      stackTop = Math.max(...bulls.map((r) => r.hi));
      bullTrig = bar.close < stackBottom;
    }
    let bearTop = 0, bearBottom = 0;
    if (bears.length) {
      bearTop = Math.max(...bears.map((r) => r.hi));
      bearBottom = Math.min(...bears.map((r) => r.lo));
      bearTrig = bar.close > bearTop;
    }
    if (bullTrig !== bearTrig) {
      if (bullTrig) {
        const R = stackTop - bar.close;
        if (R >= P.rMin * A && R <= P.rMax * A) {
          st.pos = -1; st.entry = i; st.stop = stackTop; st.tgt = bar.close - P.targetR * R;
          ret = -1;
        }
      } else {
        const R = bar.close - bearBottom;
        if (R >= P.rMin * A && R <= P.rMax * A) {
          st.pos = 1; st.entry = i; st.stop = bearBottom; st.tgt = bar.close + P.targetR * R;
          ret = 1;
        }
      }
    }
  }
  detect(bars, i, ctx, st);
  return ret;
}
