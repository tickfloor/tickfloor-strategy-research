export const meta = {
  id: "c1031-cryptoderiv-12",
  name: "Crowding count: funding, open interest, sentiment all uncrowded",
  family: "positioning",
  source: "c1031/cryptoderiv",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  params: { win: 180, pct: 0.8, fdN: 7, oiN: 14, fngMin: 70, sma: 100 },
};

// mean of settled funding over bars k-n+1..k (skip nulls); undefined unless >= n/2 non-null
function fdm(ctx, n, k) {
  let sum = 0, cnt = 0;
  for (let j = k - n + 1; j <= k; j++) {
    if (j < 0) continue;
    const v = ctx.fundingRate(j);
    if (v !== null) { sum += v; cnt++; }
  }
  return cnt >= n / 2 ? sum / cnt : undefined;
}

function pushRing(ring, v, win) {
  ring.push(v);
  if (ring.length > win) ring.shift();
}

// fraction of ring values strictly below v, >= pct
function crowded(ring, v, pct) {
  let below = 0;
  for (const x of ring) if (x < v) below++;
  return below / ring.length >= pct;
}

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.fm === undefined) { ctx.state.fm = []; ctx.state.og = []; }
  const fm = fdm(ctx, p.fdN, i);
  const oi = ctx.openInterest(i);
  const oiPrev = i >= p.oiN ? ctx.openInterest(i - p.oiN) : null;
  const og = oi === null || oiPrev === null ? undefined : oi / oiPrev - 1;
  if (fm !== undefined) pushRing(ctx.state.fm, fm, p.win);
  if (og !== undefined) pushRing(ctx.state.og, og, p.win);
  const fng = ctx.fearGreed(i);
  if (fm === undefined || og === undefined || fng === null) return 0;
  if (ctx.state.fm.length < p.win || ctx.state.og.length < p.win) return 0;
  const c1 = crowded(ctx.state.fm, fm, p.pct) ? 1 : 0;
  const c2 = crowded(ctx.state.og, og, p.pct) ? 1 : 0;
  const c3 = fng >= p.fngMin ? 1 : 0;
  return c1 + c2 + c3 === 0 && bars[i].close > ctx.sma("close", p.sma, i) ? 1 : 0;
}
