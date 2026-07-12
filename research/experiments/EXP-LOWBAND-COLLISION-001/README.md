# EXP-LOWBAND-COLLISION-001

Isolerat syntetiskt experiment för kick–bas-kollisioner. Pipen mäter onset precision/recall/F1, timingfel och falska kickar i bass-only-kontroller. `KICK_CANDIDATE` är inte instrumentauktoritet.

Kör:

```bash
python research/experiments/EXP-LOWBAND-COLLISION-001/pipeline.py \
  --output artifacts/EXP-LOWBAND-COLLISION-001/report.json
```

Promotion kräver reala stems, neural-separation som explicit kandidatmetod och mänsklig adjudikering. Nuvarande evidensklass är `HYPOTHESIS`.
