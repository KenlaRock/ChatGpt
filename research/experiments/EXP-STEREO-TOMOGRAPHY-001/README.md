# EXP-STEREO-TOMOGRAPHY-001

Isolerat syntetiskt experiment för spatial dekomposition. Pipen testar Mid/Side-closure, center/side-korrelation, Haas-delay och dekorrelerade fält. Spatiala klasser sätts före instrumentsemantik.

Kör:

```bash
python research/experiments/EXP-STEREO-TOMOGRAPHY-001/pipeline.py \
  --output artifacts/EXP-STEREO-TOMOGRAPHY-001/report.json
```

Promotion kräver större pan/delay/fas/reverb-matris och reala multitrack-stems. Nuvarande evidensklass är `HYPOTHESIS`.
