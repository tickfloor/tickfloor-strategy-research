export const meta = {
  "id": "c1022-crypto-09",
  "name": "Funding slope: 7-day mean crossing above 30-day mean from below zero",
  "family": "carry",
  "source": "c1022/crypto",
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
  "params": {
    "fast": 7,
    "slow": 30
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.fd === undefined) { st.fd = []; st.pos = 0; st.p7 = NaN; st.p30 = NaN; }
  st.fd.push(ctx.fundingRate(i));
  if (st.fd.length > p.slow) st.fd.shift();
  if (st.fd.includes(null)) return 0; // any needed funding null -> 0 (spec)
  if (st.fd.length < p.slow) return 0;
  const avg = (n) => { let s = 0; for (const v of st.fd.slice(-n)) s += v; return s / n; };
  const f7 = avg(p.fast), f30 = avg(p.slow);
  const crossUp = f7 > f30 && st.p7 <= st.p30;
  if (st.pos === 0 && crossUp && f30 < 0.0001) st.pos = 1;
  else if (st.pos === 1 && f7 < f30) st.pos = 0;
  st.p7 = f7; st.p30 = f30;
  return st.pos;
}
