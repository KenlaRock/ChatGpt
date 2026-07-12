from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "research" / "experiments" / "EXP-HARMONIC-RECOVERY-001" / "pipeline.py"
SPEC = importlib.util.spec_from_file_location("exp_harmonic_recovery", PATH)
module = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = module
assert SPEC.loader
SPEC.loader.exec_module(module)


class HarmonicRecoveryExperimentTests(unittest.TestCase):
    def test_clean_fixture_recovers_f0_and_partials(self) -> None:
        result = module.evaluate_fixture(module.HarmonicFixture(fixture_id="test_clean"))
        self.assertLess(abs(result.f0_error_cents), 2.0)
        self.assertLess(result.partial_amplitude_mae, 0.04)
        self.assertLess(result.null_depth_db, -30.0)
        self.assertEqual("PASS", result.reconstruction_score)
        self.assertEqual("PASS", result.parameter_recovery_score)

    def test_noise_moves_energy_into_residual(self) -> None:
        clean = module.evaluate_fixture(module.HarmonicFixture(fixture_id="clean"))
        noisy = module.evaluate_fixture(module.HarmonicFixture(fixture_id="noisy", noise_rms=0.03, seed=4))
        self.assertGreater(noisy.null_depth_db, clean.null_depth_db)
        self.assertLess(noisy.harmonic_residual_ratio, 0.35)

    def test_report_separates_reconstruction_and_parameter_scores(self) -> None:
        report = module.run_pipeline((module.HarmonicFixture(fixture_id="single"),))
        result = report["results"][0]
        self.assertIn("reconstruction_score", result)
        self.assertIn("parameter_recovery_score", result)
        self.assertEqual("HYPOTHESIS", result["evidence_class"])


if __name__ == "__main__":
    unittest.main()
