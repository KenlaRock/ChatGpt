from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "sparse_hit_detector",
    ROOT / "research" / "sparse_hit_detector.py",
)
detector = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = detector
assert SPEC.loader
SPEC.loader.exec_module(detector)


SAMPLE_RATE = 48000
EVENT_SAMPLE = int(0.25 * SAMPLE_RATE)


def _decaying_sine(
    frequency_hz: float,
    duration_s: float,
    amplitude: float,
    tau_s: float,
) -> np.ndarray:
    signal = np.zeros(SAMPLE_RATE, dtype=np.float64)
    length = int(duration_s * SAMPLE_RATE)
    time = np.arange(length) / SAMPLE_RATE
    signal[EVENT_SAMPLE : EVENT_SAMPLE + length] = (
        amplitude * np.sin(2 * np.pi * frequency_hz * time) * np.exp(-time / tau_s)
    )
    return signal


def _noise_burst(duration_s: float, amplitude: float, seed: int) -> np.ndarray:
    signal = np.zeros(SAMPLE_RATE, dtype=np.float64)
    length = int(duration_s * SAMPLE_RATE)
    rng = np.random.default_rng(seed)
    signal[EVENT_SAMPLE : EVENT_SAMPLE + length] = (
        rng.normal(0.0, amplitude, length) * np.hanning(length)
    )
    return signal


def sparse_kick() -> np.ndarray:
    return _decaying_sine(65.0, 0.30, 0.90, 0.07) + _noise_burst(0.012, 0.35, 2)


def cinematic_hit() -> np.ndarray:
    return _decaying_sine(48.0, 0.50, 0.90, 0.12) + _noise_burst(0.025, 0.60, 3)


def bass_pluck() -> np.ndarray:
    signal = np.zeros(SAMPLE_RATE, dtype=np.float64)
    length = int(0.50 * SAMPLE_RATE)
    time = np.arange(length) / SAMPLE_RATE
    envelope = (1.0 - np.exp(-time / 0.008)) * np.exp(-time / 0.35)
    harmonics = (
        np.sin(2 * np.pi * 82.4 * time)
        + 0.35 * np.sin(2 * np.pi * 164.8 * time)
        + 0.15 * np.sin(2 * np.pi * 247.2 * time)
    )
    signal[EVENT_SAMPLE : EVENT_SAMPLE + length] = 0.50 * envelope * harmonics
    return signal


def low_synth_stab() -> np.ndarray:
    signal = np.zeros(SAMPLE_RATE, dtype=np.float64)
    length = int(0.40 * SAMPLE_RATE)
    time = np.arange(length) / SAMPLE_RATE
    envelope = np.minimum(time / 0.015, 1.0) * np.exp(-time / 0.30)
    signal[EVENT_SAMPLE : EVENT_SAMPLE + length] = 0.40 * envelope * (
        np.sin(2 * np.pi * 110.0 * time)
        + 0.50 * np.sin(2 * np.pi * 220.0 * time)
    )
    return signal


def edit_boundary() -> np.ndarray:
    signal = np.zeros(SAMPLE_RATE, dtype=np.float64)
    signal[EVENT_SAMPLE:] = 0.20
    return signal


def first_candidate(signal: np.ndarray):
    candidates = detector.detect_sparse_hits(signal)
    if not candidates:
        raise AssertionError("Expected at least one transient candidate")
    return candidates[0]


class SparseHitDetectorTests(unittest.TestCase):
    def test_sparse_kick_is_candidate_hit(self) -> None:
        candidate = first_candidate(sparse_kick())
        self.assertEqual(detector.CLASS_SPARSE_HIT, candidate.classification)
        self.assertLess(
            abs(candidate.sample_index - EVENT_SAMPLE),
            int(0.03 * SAMPLE_RATE),
        )
        self.assertEqual("HYPOTHESIS", candidate.evidence_class)

    def test_cinematic_hit_is_candidate_hit(self) -> None:
        candidate = first_candidate(cinematic_hit())
        self.assertEqual(detector.CLASS_SPARSE_HIT, candidate.classification)
        self.assertGreaterEqual(candidate.broadband_bands, 3)

    def test_bass_pluck_is_not_sparse_hit(self) -> None:
        candidate = first_candidate(bass_pluck())
        self.assertEqual(detector.CLASS_BASS_ATTACK, candidate.classification)

    def test_low_synth_is_not_sparse_hit(self) -> None:
        candidate = first_candidate(low_synth_stab())
        self.assertNotEqual(detector.CLASS_SPARSE_HIT, candidate.classification)

    def test_edit_boundary_fails_closed(self) -> None:
        candidate = first_candidate(edit_boundary())
        self.assertEqual(detector.CLASS_UNRESOLVED, candidate.classification)

    def test_parameter_hash_changes_with_configuration(self) -> None:
        default_hash = detector.DetectorConfig().parameter_hash()
        changed_hash = detector.DetectorConfig(min_sparse_flatness=0.2).parameter_hash()
        self.assertNotEqual(default_hash, changed_hash)

    def test_stereo_input_is_supported(self) -> None:
        mono = sparse_kick()
        stereo = np.stack([mono, mono], axis=0)
        candidate = first_candidate(stereo)
        self.assertEqual(detector.CLASS_SPARSE_HIT, candidate.classification)


if __name__ == "__main__":
    unittest.main()
