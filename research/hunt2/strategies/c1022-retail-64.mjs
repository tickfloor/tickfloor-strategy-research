// Campaign c1022 chunk 4 (retail). Rule from campaign-1022/prereg-retail.json.
export const meta = {
  "id": "c1022-retail-64",
  "name": "Awesome Oscillator twin peaks (Bill Williams)",
  "family": "momentum",
  "source": "c1022/retail",
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
    "fast": 5,
    "slow": 34,
    "maxHold": 20
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  if (st.ao === undefined) { st.ao = []; st.t1 = null; st.t2 = null; st.pos = 0; st.aoT2 = NaN; st.entryBar = -1; }
  let ao = NaN;
  if (i >= p.slow - 1) {
    let sf = 0, ss = 0;
    for (let k = i - p.slow + 1; k <= i; k++) {
      const hl = (bars[k].high + bars[k].low) / 2;
      ss += hl;
      if (k > i - p.fast) sf += hl;
    }
    ao = sf / p.fast - ss / p.slow;
  }
  st.ao.push(ao);
  // a bar with AO >= 0 (or no AO yet) breaks any trough pair: both troughs must sit in one negative run
  if (!(ao < 0)) { st.t1 = null; st.t2 = null; }
  let enter = false;
  if (ao < 0 && i >= 2) {
    const a1 = st.ao[i - 1], a0 = st.ao[i - 2];
    if (a1 < 0 && a1 < a0 && a1 < ao) {
      // trough at bar i-1, confirmed on bar i
      if (st.t2 !== null) st.t1 = st.t2;
      st.t2 = { k: i - 1, v: a1 };
      if (st.t1 !== null && st.t2.v > st.t1.v) enter = true;
    }
  }
  if (st.pos === 1) {
    const prevAo = st.ao[i - 1];
    if ((ao > 0 && ao < prevAo) || ao < st.aoT2 || i - st.entryBar >= p.maxHold) st.pos = 0;
    return st.pos;
  }
  if (enter && st.pos === 0) {
    st.pos = 1; st.aoT2 = st.t2.v; st.entryBar = i;
  }
  return st.pos;
}
