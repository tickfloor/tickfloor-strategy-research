# How this study differs from a typical "best strategy" backtest

Many backtest write-ups pick one rule, show its equity curve and report the return. That is a fair way to describe one rule. It says little about whether the rule is a real edge, because the reader cannot see how many other rules were tried first. This table compares the two approaches on the points that matter for that question.

| | Typical "best strategy" backtest | This study |
|---|---|---|
| Number of strategies tested | Usually one shown; the number tried is often not stated | 1,342 strategies (1,774 tests including reruns), all published in `data/strategy-results.json` |
| Costs | Often none, or a flat assumption | 0.05% a side for stocks and ETFs, 0.10% plus measured slippage for crypto. The benchmark pays none, which favours the benchmark |
| Out-of-sample | Often the same data used to choose the rule | A discovery window (bars before 2025-03-15), and a one-shot holdout on data after it for the 2 candidates that looked best. Neither was confirmed |
| Multiple-testing correction | Usually none | Benjamini-Hochberg false discovery rate across all 1,774 tests |
| Controls | Rarely | Random controls (`research/hunt2/random-control-sweep.json`) and control strategies (the `dv-ctrl-*` files) alongside the rules under test |
| Result | One strategy that looks good | 265 beat the benchmark on the raw number, 39 had p < 0.05, 0 survived correction |

Both columns describe in-sample numbers except the holdout. Nothing here says a strategy will make money.

## The BH-FDR idea in plain words

If you test one rule at the 5% level, about 1 time in 20 a useless rule will look significant by luck. If you test 1,774 rules, you expect around 90 lucky looking ones even if none has any edge. The raw p-value does not account for that.

Benjamini-Hochberg works on the whole batch. Sort the p-values from smallest to largest, then compare each one to a sliding limit that gets looser with rank. The result for each test is a q-value: the share of results at least that good that you would expect to be false alarms if you accepted everything down to that point. This study's gate is q < 0.10, meaning up to 1 in 10 accepted results could be a false alarm. The best q in the data is 0.4455, so the best result would still be wrong more than 4 times in 10.

## Limits of this study

Fills are at the signal bar close, which is optimistic. The stock universe is today's large caps, so survivorship bias applies. Shorting, leverage and options are not covered. See the README for the accounting note on portfolio-mode strategies.
