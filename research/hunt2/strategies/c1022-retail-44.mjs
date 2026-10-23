// c1022 retail spec 44 (campaign-1022/prereg-retail.json, frozen before code).
// Bullish Gartley on fractal pivots (X low, A high, B low, C high, D low), zigzag replacement rule.
// Fractal at bar k is confirmed at bar k+2, so every check runs on bars <= i.
export const meta = {
  id: "c1022-retail-44",
  name: "Bullish Gartley harmonic (0.618 B, 0.786 D) on fractal pivots",
  family: "mean_reversion",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  params: { tol: 0.05, bRatio: 0.618, dRatio: 0.786, bcMin: 0.382, bcMax: 0.886, targetAD: 0.618, maxPatternBars: 60, maxHold: 30 },
};

// same-type pivot replaces the last one only if more extreme; returns true when the list changed
function addPivot(piv, type, k, price) {
  const last = piv[piv.length - 1];
  if (last && last.t === type) {
    const more = type === "L" ? price < last.p : price > last.p;
    if (!more) return false;
    piv[piv.length - 1] = { t: type, k, p: price };
    return true;
  }
  piv.push({ t: type, k, p: price });
  if (piv.length > 5) piv.shift();
  return true;
}

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state, b = bars;
  if (st.pos === undefined) { st.pos = 0; st.held = 0; st.piv = []; st.tgt = NaN; st.stopX = NaN; }

  let newLowD = false;
  const k = i - 2;
  if (k >= 2) {
    if (b[k].low < b[k - 1].low && b[k].low < b[k - 2].low && b[k].low < b[k + 1].low && b[k].low < b[k + 2].low) {
      newLowD = addPivot(st.piv, "L", k, b[k].low);
    }
    if (b[k].high > b[k - 1].high && b[k].high > b[k - 2].high && b[k].high > b[k + 1].high && b[k].high > b[k + 2].high) {
      addPivot(st.piv, "H", k, b[k].high);
    }
  }

  if (st.pos === 1) {
    st.held++;
    if (b[i].close >= st.tgt || b[i].close < st.stopX || st.held >= p.maxHold) st.pos = 0;
    return st.pos;
  }
  if (!newLowD || st.piv.length < 5) return 0;

  const [X, A, B, C, D] = st.piv;
  if (D.k - X.k > p.maxPatternBars) return 0;
  const XA = A.p - X.p, AB = A.p - B.p, BC = C.p - B.p, AD = A.p - D.p;
  if (!(XA > 0 && AB > 0)) return 0;
  const valid =
    Math.abs(AB / XA - p.bRatio) <= p.tol &&
    BC / AB >= p.bcMin && BC / AB <= p.bcMax &&
    Math.abs(AD / XA - p.dRatio) <= p.tol &&
    D.p > X.p;
  if (!valid || b[i].close <= D.p) return 0;

  st.pos = 1; st.held = 0; st.tgt = D.p + p.targetAD * AD; st.stopX = X.p;
  return 1;
}
