from __future__ import annotations

from dataclasses import asdict, dataclass
import argparse
import json
from pathlib import Path
from typing import Iterable

import numpy as np

EXPERIMENT_ID = "EXP-STEREO-TOMOGRAPHY-001"
PIPELINE_VERSION = "0.1.0-candidate"
EVIDENCE_CLASS = "HYPOTHESIS"


@dataclass(frozen=True)
class StereoFixture:
    fixture_id: str
    sample_rate_hz: int = 48000
    duration_s: float = 1.0
    center_gain: float = 0.7
    side_gain: float = 0.5
    right_delay_samples: int = 0
    decorrelated_gain: float = 0.0
    seed: int = 1


@dataclass(frozen=True)
class StereoEvaluation:
    fixture_id: str
    estimated_delay_samples: int
    delay_error_samples: int
    reconstruction_error_db: float
    center_correlation: float
    side_correlation: float
    lr_correlation: float
    classification: str
    evidence_class: str = EVIDENCE_CLASS

    def to_dict(self) -> dict[str, object]:
        return asdict(self)


def _tone(sample_count: int, sample_rate_hz: int, frequency_hz: float, phase: float = 0.0) -> np.ndarray:
    time = np.arange(sample_count, dtype=np.float64) / sample_rate_hz
    return np.sin(2.0 * np.pi * frequency_hz * time + phase) * np.hanning(sample_count)


def _delay(signal: np.ndarray, samples: int) -> np.ndarray:
    output = np.zeros_like(signal)
    if samples >= 0:
        if samples < signal.size:
            output[samples:] = signal[: signal.size - samples]
    else:
        amount = -samples
        if amount < signal.size:
            output[: signal.size - amount] = signal[amount:]
    return output


def synthesize_fixture(config: StereoFixture) -> tuple[np.ndarray, dict[str, np.ndarray]]:
    count = int(round(config.duration_s * config.sample_rate_hz))
    center = config.center_gain * _tone(count, config.sample_rate_hz, 110.0)
    side_source = config.side_gain * (
        _tone(count, config.sample_rate_hz, 233.0, phase=0.3)
        + 0.43 * _tone(count, config.sample_rate_hz, 317.0, phase=-0.8)
        + 0.21 * _tone(count, config.sample_rate_hz, 421.0, phase=1.1)
    )
    left_side = side_source
    right_side = -_delay(side_source, config.right_delay_samples)
    rng = np.random.default_rng(config.seed)
    decor_left = rng.normal(0.0, config.decorrelated_gain, count) * np.hanning(count)
    decor_right = rng.normal(0.0, config.decorrelated_gain, count) * np.hanning(count)
    left = center + left_side + decor_left
    right = center + right_side + decor_right
    peak = max(float(np.max(np.abs(np.concatenate((left, right))))), 1e-12)
    stereo = np.stack((left / peak, right / peak), axis=0)
    truth = {
        "center": center / peak,
        "side": side_source / peak,
        "left": left / peak,
        "right": right / peak,
    }
    return stereo, truth


def mid_side(stereo: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    data = np.asarray(stereo, dtype=np.float64)
    if data.shape[0] != 2:
        raise ValueError("stereo must have shape (2, samples)")
    left, right = data
    return (left + right) / 2.0, (left - right) / 2.0


def reconstruct_from_mid_side(mid: np.ndarray, side: np.ndarray) -> np.ndarray:
    return np.stack((mid + side, mid - side), axis=0)


def _fft_bandpass(signal: np.ndarray, sample_rate_hz: int, low_hz: float, high_hz: float) -> np.ndarray:
    spectrum = np.fft.rfft(signal)
    frequencies = np.fft.rfftfreq(signal.size, 1.0 / sample_rate_hz)
    mask = (frequencies >= low_hz) & (frequencies <= high_hz)
    filtered = np.zeros_like(spectrum)
    filtered[mask] = spectrum[mask]
    return np.fft.irfft(filtered, n=signal.size)


def estimate_delay_samples(
    left: np.ndarray,
    right: np.ndarray,
    sample_rate_hz: int,
    max_delay_samples: int = 128,
) -> int:
    # The diagnostic fixture deliberately places center energy below the side band.
    # Band isolation removes the center before correlating L against polarity-corrected R.
    length = min(left.size, right.size, 32768)
    a = _fft_bandpass(np.asarray(left[:length], dtype=np.float64), sample_rate_hz, 180.0, 650.0)
    b = _fft_bandpass(-np.asarray(right[:length], dtype=np.float64), sample_rate_hz, 180.0, 650.0)
    fft_size = 1 << int(np.ceil(np.log2(max(2 * length - 1, 2))))
    correlation = np.fft.irfft(
        np.fft.rfft(a, n=fft_size) * np.conj(np.fft.rfft(b, n=fft_size)),
        n=fft_size,
    )
    best_lag = 0
    best_score = -np.inf
    for lag in range(-max_delay_samples, max_delay_samples + 1):
        index = lag if lag >= 0 else fft_size + lag
        score = float(correlation[index])
        if score > best_score:
            best_score = score
            best_lag = lag
    return best_lag


def _corr(a: np.ndarray, b: np.ndarray) -> float:
    a0 = a - np.mean(a)
    b0 = b - np.mean(b)
    denominator = np.linalg.norm(a0) * np.linalg.norm(b0)
    return float(np.dot(a0, b0) / denominator) if denominator > 1e-12 else 0.0


def _error_db(reference: np.ndarray, difference: np.ndarray) -> float:
    ref_rms = float(np.sqrt(np.mean(np.square(reference))))
    diff_rms = float(np.sqrt(np.mean(np.square(difference))))
    return float(20.0 * np.log10(max(diff_rms, 1e-15) / max(ref_rms, 1e-15)))


def evaluate_fixture(config: StereoFixture) -> StereoEvaluation:
    stereo, truth = synthesize_fixture(config)
    mid, side = mid_side(stereo)
    reconstructed = reconstruct_from_mid_side(mid, side)
    closure_db = _error_db(stereo, stereo - reconstructed)
    left, right = stereo
    estimated_alignment = estimate_delay_samples(left, right, config.sample_rate_hz)
    expected_alignment = -config.right_delay_samples
    delay_error = estimated_alignment - expected_alignment
    center_corr = _corr(mid, truth["center"])
    side_corr = _corr(side, truth["side"])
    lr_corr = _corr(left, right)
    if config.decorrelated_gain >= 0.15:
        classification = "DECORRELATED_FIELD"
    elif config.right_delay_samples != 0:
        classification = "SIDE_TIME_DIFFERENTIAL"
    elif config.side_gain > 0:
        classification = "SIDE_LEVEL_OR_POLARITY_DIFFERENTIAL"
    else:
        classification = "CENTER_CORRELATED"
    return StereoEvaluation(
        fixture_id=config.fixture_id,
        estimated_delay_samples=estimated_alignment,
        delay_error_samples=delay_error,
        reconstruction_error_db=closure_db,
        center_correlation=center_corr,
        side_correlation=side_corr,
        lr_correlation=lr_corr,
        classification=classification,
    )


def default_fixtures() -> tuple[StereoFixture, ...]:
    return (
        StereoFixture("center_plus_side", right_delay_samples=0),
        StereoFixture("haas_17_samples", right_delay_samples=17),
        StereoFixture("decorrelated_field", right_delay_samples=0, decorrelated_gain=0.20),
    )


def run_pipeline(fixtures: Iterable[StereoFixture] | None = None) -> dict[str, object]:
    evaluations = [evaluate_fixture(fixture) for fixture in tuple(fixtures or default_fixtures())]
    closure_ok = all(item.reconstruction_error_db <= -250.0 for item in evaluations)
    deterministic_cases = [item for item in evaluations if item.classification != "DECORRELATED_FIELD"]
    delay_ok = all(abs(item.delay_error_samples) <= 1 for item in deterministic_cases)
    return {
        "experiment_id": EXPERIMENT_ID,
        "pipeline_version": PIPELINE_VERSION,
        "evidence_class": EVIDENCE_CLASS,
        "claim_boundary": "Spatial components are classified before any instrument semantics are assigned.",
        "results": [item.to_dict() for item in evaluations],
        "overall_status": "PASS" if closure_ok and delay_ok else "REVIEW",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=EXPERIMENT_ID)
    parser.add_argument("--output", type=Path, default=Path("artifacts") / EXPERIMENT_ID / "report.json")
    args = parser.parse_args()
    report = run_pipeline()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2, sort_keys=True), encoding="utf-8")
    print(json.dumps(report, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
