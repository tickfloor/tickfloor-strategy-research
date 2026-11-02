// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-05). Fade a wick through the London range at the NY cash open; flat at 16:00 New York.
export const meta = {
  id: "c1031-tjr-05",
  name: "NY-open sweep of the London range: fade a wick through the London high/low that closes back inside, hold to 16:00 New York (crypto 1h)",
  family: "session_liquidity",
  source: "c1031/tjr",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { londonStartHour: 7, overshootATR: 0.05, minRR: 1, flatBars: 6 },
};

// Day number of the nth-ish Sunday helpers, UTC. Monday = 0 weekday convention.
function nyOpenHour(D) {
  const y = new Date(D * 86400000).getUTCFullYear();
  const mar1 = Math.floor(Date.UTC(y, 2, 1) / 86400000);
  const nov1 = Math.floor(Date.UTC(y, 10, 1) / 86400000);
  const secondSunMar = mar1 + ((6 - ((mar1 + 3) % 7) + 7) % 7) + 7;
  const firstSunNov = nov1 + ((6 - ((nov1 + 3) % 7) + 7) % 7);
  return D >= secondSunMar && D < firstSunNov ? 13 : 14; // 09:30 NY = 13:30 UTC in DST, 14:30 UTC otherwise; bar hour 13/14
}

export function signal(bars, i, ctx) {
  const S = ctx.state;
  if (S.pos === undefined) { S.pos = 0; S.stop = 0; S.tgt = 0; S.i0 = 0; S.flatH = -1; }
  const c = bars[i];
  const hour = Math.floor(c.time / 3600) % 24;

  if (S.pos !== 0) {
    const hitStop = S.pos === -1 ? c.close >= S.stop : c.close <= S.stop;
    const hitTgt = S.pos === -1 ? c.close <= S.tgt : c.close >= S.tgt;
    // ponytail: i - S.i0 >= 12 guards against a missing flat bar; the spec exit is the NY flat bar close.
    if (hitStop || hitTgt || hour === S.flatH || i - S.i0 >= 12) { S.pos = 0; return 0; }
    return S.pos;
  }

  if (hour !== nyOpenHour(Math.floor(c.time / 86400))) return 0;
  const D = Math.floor(c.time / 86400);
  const NYH = nyOpenHour(D);
  const n = NYH - 7; // London hours 7..NYH-1 are the n bars just before N
  if (i < n) return 0;
  if (bars[i - n].time !== c.time - n * 3600) return 0; // London window must be contiguous
  let LH = -Infinity, LL = Infinity;
  for (let k = i - n; k < i; k++) { LH = Math.max(LH, bars[k].high); LL = Math.min(LL, bars[k].low); }
  const A = ctx.atr(14);
  if (!Number.isFinite(A)) return 0;

  const shortSweep = c.high > LH + 0.05 * A && c.close < LH;
  const longSweep = c.low < LL - 0.05 * A && c.close > LL;
  if (shortSweep === longSweep) return 0; // neither, or both: skip

  if (shortSweep) {
    const stop = c.high, R = stop - c.close;
    if (c.close - LL < 1.0 * R) return 0;
    S.pos = -1; S.stop = stop; S.tgt = LL;
  } else {
    const stop = c.low, R = c.close - stop;
    if (LH - c.close < 1.0 * R) return 0;
    S.pos = 1; S.stop = stop; S.tgt = LH;
  }
  S.i0 = i; S.flatH = (NYH + 6) % 24;
  return S.pos;
}
