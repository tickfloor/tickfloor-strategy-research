# Contributing

This repo is a published dataset and the code behind it. Corrections are welcome, especially if they show a number is wrong.

## Report a strategy-rule bug

Use the "Strategy rule bug" issue template. Include:

- the strategy `id` from `data/strategy-results.json`
- the file under `research/hunt2/strategies/` (for example `research/hunt2/strategies/c1022-acad-01.mjs`)
- what the rule is meant to do, and what the code does instead (point to the line)
- why it changes the result, for example look-ahead, a wrong sign or a wrong window

A fixed rule is a new test, not an edit. The ledger is append-only, so a corrected rule is added as a new row and the `q` values are recomputed over the larger batch.

## Report a data error

Open an issue with the file, the row (`id` or reads-ledger `id`), the value you see and the value you expected, with how you checked it. Mismatches against tickfloor.com/evidence or tickfloor.com/results also count.

## Run the checks

```
python3 load_example.py
python3 scripts/make_chart.py
```

The price bars are not redistributed, so the backtest harness does not run end to end from this repo.

## Pull requests

Small fixes to docs, scripts and the examples are fine as pull requests. For changes to results, open an issue first. By contributing you agree your changes use the same licences as the files they touch (MIT for code, CC BY 4.0 for data and write-ups).

Questions: hello@tickfloor.com
