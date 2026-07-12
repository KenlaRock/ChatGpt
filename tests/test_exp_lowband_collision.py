from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "research" / "experiments" / "EXP-LOWBAND-COLLISION-001" / "pipeline.py"
SPEC = importlib.util.spec_from_file_location("exp_lowband_collision", PATH)
module = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = module
assert SPEC.loader
SPEC.loader.exec_module(module)


class LowBandCollisionExperimentTests(unittest.TestCase):
    def test_kick_only_is_detected(self) -> None:
        result = module.evaluate_fixture(module.CollisionFixture("kick", kick_times_s=(0.25, 0.72)))
        self.assertEqual(2, result.true_positives)
        self.assertEqual(0, result.false_negatives)
        self.assertGreaterEqual(result.f1, 0.95)

    def test_bass_only_does_not_create_kick(self) -> None:
        result = module.evaluate_fixture(module.CollisionFixture("bass", bass_times_s=(0.25, 0.72)))
        self.assertEqual(0, result.false_positives)
        self.assertEqual(1.0, result.precision)

    def test_collision_matrix_has_usable_aggregate_gate(self) -> None:
        report = module.run_pipeline()
        self.assertGreaterEqual(report["aggregate"]["f1"], 0.75)
        self.assertEqual("PASS", report["overall_status"])
        self.assertEqual("HYPOTHESIS", report["evidence_class"])


if __name__ == "__main__":
    unittest.main()
