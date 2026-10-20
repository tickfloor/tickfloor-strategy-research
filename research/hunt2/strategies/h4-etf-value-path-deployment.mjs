// Spec: docs/research/hunt-1004/codex/specs.json (h4-etf-value-path-deployment). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-etf-value-path-deployment",
  "name": "Does value averaging without new deposits improve ETF deployment?",
  "family": "capital-deployment",
  "source": "retail trading content: Michael Edleson value averaging finite reserve no external deposits",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "QQQ",
    "SHY"
  ],
  "rebalance": "daily",
  "longShort": false,
  "params": {
    "warmupBars": 2,
    "cycleCalls": 63,
    "deploymentCalls": 42,
    "flatCall": 62
  }
};

export function rank(universe, t, ctx) {
  const p = ctx.params, s = ctx.state;
  const a = universe.QQQ, b = universe.SHY;
  const ok = (x) => x && x.length >= p.warmupBars && x.slice(-2).every((k) => Number.isFinite(k.close) && k.close > 0);
  if (!ok(a) || !ok(b)) { s.init = false; return {}; }
  const q = a[a.length - 1].close, h = b[b.length - 1].close;
  if (!s.init) {
    s.init = true; s.age = 0; s.V = 1; s.w = { SHY: 1 }; s.q = q; s.h = h;
    return { SHY: 1 };
  }
  s.V *= 1 + (s.w.QQQ || 0) * (q / s.q - 1) + (s.w.SHY || 0) * (h / s.h - 1);
  s.q = q; s.h = h;
  s.age = (s.age + 1) % p.cycleCalls;
  const age = s.age;
  if (age === 0) { s.V = 1; s.w = { SHY: 1 }; }
  else if (age <= p.deploymentCalls) {
    if (!(s.V > 0)) s.w = { SHY: 1 };
    else { const wq = Math.min(1, Math.max(0, (age / p.deploymentCalls) / s.V)); s.w = { QQQ: wq, SHY: 1 - wq }; }
  } else if (age >= p.flatCall) s.w = { SHY: 1 };
  return { ...s.w };
}
