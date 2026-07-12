# EXP-HARMONIC-RECOVERY-001

Isolerat syntetiskt experiment för blind återvinning av fundamental, partialamplituder och harmonisk kropp. Rekonstruktionskvalitet och parameteråtervinning rapporteras separat. Ground truth används endast av evaluatorn.

Kör:

```bash
python research/experiments/EXP-HARMONIC-RECOVERY-001/pipeline.py \
  --output artifacts/EXP-HARMONIC-RECOVERY-001/report.json
```

Promotion kräver bredare fixturematris, driftestimering, codec/mastering-trappa och mänsklig granskning. Nuvarande evidensklass är `HYPOTHESIS`.
