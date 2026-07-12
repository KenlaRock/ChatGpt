from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "research" / "experiments" / "EXP-STEREO-TOMOGRAPHY-001" / "pipeline.py"
SPEC = importlib.util.spec_from_file_location("exp_stereo_tomography", PATH)
module = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = module
assert SPEC.loader
SPEC.loader.exec_module(module)


class StereoTomographyExperimentTests(unittest.TestCase):
    def test_mid_side_roundtrip_is_lossless(self) -> None:
        result = module.evaluate_fixture(module.StereoFixture("roundtrip"))
        self.assertLess(result.reconstruction_error_db, -250.0)

    def test_center_and_side_are_recovered_for_zero_delay(self) -> None:
        result = module.evaluate_fixture(module.StereoFixture("separable", right_delay_samples=0))
        self.assertGreater(result.center_correlation, 0.99)
        self.assertGreater(result.side_correlation, 0.99)

    def test_haas_delay_is_recovered(self) -> None:
        result = module.evaluate_fixture(module.StereoFixture("haas", right_delay_samples=17))
        self.assertLessEqual(abs(result.delay_error_samples), 1)
        self.assertEqual("SIDE_TIME_DIFFERENTIAL", result.classification)

    def test_pipeline_passes_isolated_synthetic_cases(self) -> None:
        report = module.run_pipeline()
        self.assertEqual("PASS", report["overall_status"])
        self.assertEqual("HYPOTHESIS", report["evidence_class"])


if __name__ == "__main__":
    unittest.main()
