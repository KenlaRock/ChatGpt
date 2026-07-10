from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("runner", ROOT / "reference" / "run_experiment.py")
runner = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(runner)


class SignalProperties(unittest.TestCase):
    def test_identical_lr_has_zero_side(self):
        n = 4800
        t = np.arange(n) / 48000
        left = np.sin(2 * np.pi * 440 * t)
        right = left.copy()
        side = (left - right) / 2
        self.assertLess(np.max(np.abs(side)), 1e-12)

    def test_opposite_lr_has_zero_center(self):
        n = 4800
        t = np.arange(n) / 48000
        left = np.sin(2 * np.pi * 440 * t)
        right = -left
        center = (left + right) / 2
        self.assertLess(np.max(np.abs(center)), 1e-12)

    def test_visualization_does_not_change_audio(self):
        exp = json.loads((ROOT / "scenarios" / "phase-and-null" / "EXP-VECTOR-NULL-001.json").read_text(encoding="utf-8"))
        audio_a = runner.render(exp)[0]
        exp["visualization"]["phase_angle_exaggeration"] = 100000.0
        exp["visualization"]["amplitude_scale"] = 999.0
        audio_b = runner.render(exp)[0]
        self.assertTrue(np.array_equal(audio_a, audio_b))

    def test_deep_null_is_detected_near_end(self):
        exp = json.loads((ROOT / "scenarios" / "phase-and-null" / "EXP-VECTOR-NULL-001.json").read_text(encoding="utf-8"))
        metrics = runner.render(exp)[3]
        self.assertGreater(metrics["deepest_null_time_seconds"], 9.0)
        self.assertLess(metrics["deepest_null_db_10ms"], -20.0)


if __name__ == "__main__":
    unittest.main()
