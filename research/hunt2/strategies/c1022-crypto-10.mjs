export const meta = {
  "id": "c1022-crypto-10",
  "name": "Trend with a funding budget exit: leave once cumulative funding paid since entry exceeds 2%",
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
    "sma": 50,
    "budget": 0.02,
    "settlementsPerDay": 3,
    "cooldown": 10
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.paid = 0; st.cool = 0; }
  const fd = ctx.fundingRate(i);
  if (fd === null) return 0; // null funding -> 0 (spec); nulls only precede the first settlement, so state is still flat
  const sma = ctx.sma("close", p.sma, i);
  if (st.pos === 1) {
    st.paid += fd * p.settlementsPerDay;
    const budgetHit = st.paid >= p.budget;
    if (budgetHit || bars[i].close < sma) {
      st.pos = 0;
      if (budgetHit) st.cool = p.cooldown;
    }
    return st.pos;
  }
  if (st.cool > 0) { st.cool -= 1; return 0; }
  if (bars[i].close > sma) { st.pos = 1; st.paid = 0; }
  return st.pos;
}
