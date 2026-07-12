from __future__ import annotations

from dataclasses import asdict, dataclass
import argparse
import json
from pathlib import Path
from typing import Iterable

import numpy as np

EXPERIMENT_ID = "EXP-HARMONIC-RECOVERY-001"
PIPELINE_VERSION = "0.1.0-candidate"
EVIDENCE_CLASS = "HYPOTHESIS"


@dataclass(frozen=True)
class HarmonicFixture:
    fixture_id: str
    sample_rate_hz: int = 48000
    duration_s: float = 1.5
    fundamental_hz: float = 110.0
    partial_amplitudes: tuple[float, ...] = (1.0, 0.5, 0.33, 0.25, 0.2, 0.16)
    partial_phases_deg: tuple[float, ...] = (0.0, 20.0, -35.0, 10.0, 70.0, -15.0)
    linear_drift_cents: float = 0.0
    noise_rms: float = 0.0
    soft_clip_drive: float = 0.0
    seed: int = 1

    def validate(self) -> None:
        if self.sample_rate_hz < 8000:
            raise ValueError("sample_rate_hz must be >= 8000")
        if self.duration_s <= 0.25:
            raise ValueError("duration_s must be > 0.25")
        if self.fundamental_hz <= 0:
            raise ValueError("fundamental_hz must be positive")
        if not self.partial_amplitudes:
            raise ValueError("at least one partial is required")
        if len(self.partial_amplitudes) != len(self.partial_phases_deg):
            raise ValueError("partial amplitude/phase lengths must match")


@dataclass(frozen=True)
class RecoveryResult:
    fixture_id: str
    estimated_f0_hz: float
    f0_error_cents: float
    estimated_partial_amplitudes: tuple[float, ...]
    partial_amplitude_mae: float
    null_depth_db: float
    harmonic_residual_ratio: float
    reconstruction_score: str
    parameter_recovery_score: str
    evidence_class: str = EVIDENCE_CLASS
    pipeline_version: str = PIPELINE_VERSION

    def to_dict(self) -> dict[str, object]:
        return asdict(self)


def synthesize_fixture(config: HarmonicFixture) -> np.ndarray:
    config.validate()
    count = int(round(config.duration_s * config.sample_rate_hz))
    time = np.arange(count, dtype=np.float64) / config.sample_rate_hz
    drift_octaves = (config.linear_drift_cents / 1200.0) * (time / config.duration_s)
    instantaneous_frequency = config.fundamental_hz * np.power(2.0, drift_octaves)
    phase_cycles = np.cumsum(instantaneous_frequency) / config.sample_rate_hz
    signal = np.zeros(count, dtype=np.float64)
    for harmonic, (amplitude, phase_deg) in enumerate(
        zip(config.partial_amplitudes, config.partial_phases_deg), start=1
    ):
        signal += amplitude * np.sin(
            2.0 * np.pi * harmonic * phase_cycles + np.deg2rad(phase_deg)
        )
    signal /= max(float(np.max(np.abs(signal))), 1e-12)
    if config.soft_clip_drive > 0:
        drive = float(config.soft_clip_drive)
        signal = np.tanh(signal * drive) / np.tanh(drive)
    if config.noise_rms > 0:
        rng = np.random.default_rng(config.seed)
        signal = signal + rng.normal(0.0, config.noise_rms, signal.size)
    return signal


def _analysis_slice(signal: np.ndarray, sample_rate_hz: int) -> np.ndarray:
    trim = int(0.10 * sample_rate_hz)
    if signal.size <= trim * 2 + 1024:
        return signal
    return signal[trim:-trim]


def estimate_f0(
    signal: np.ndarray,
    sample_rate_hz: int,
    low_hz: float = 40.0,
    high_hz: float = 500.0,
) -> float:
    segment = _analysis_slice(np.asarray(signal, dtype=np.float64), sample_rate_hz)
    nfft = 1 << int(np.ceil(np.log2(max(segment.size * 4, 4096))))
    windowed = segment * np.hanning(segment.size)
    magnitude = np.abs(np.fft.rfft(windowed, n=nfft))
    frequencies = np.fft.rfftfreq(nfft, 1.0 / sample_rate_hz)
    mask = (frequencies >= low_hz) & (frequencies <= high_hz)
    indices = np.flatnonzero(mask)
    if not indices.size:
        raise ValueError("empty f0 search range")
    peak = int(indices[np.argmax(magnitude[indices])])
    if 1 <= peak < magnitude.size - 1:
        left, center, right = np.log(magnitude[peak - 1 : peak + 2] + 1e-18)
        denominator = left - 2.0 * center + right
        offset = 0.0 if abs(denominator) < 1e-18 else 0.5 * (left - right) / denominator
    else:
        offset = 0.0
    return float((peak + offset) * sample_rate_hz / nfft)


def fit_harmonic_model(
    signal: np.ndarray,
    sample_rate_hz: int,
    f0_hz: float,
    partial_count: int,
) -> tuple[np.ndarray, tuple[float, ...]]:
    observed = np.asarray(signal, dtype=np.float64)
    time = np.arange(observed.size, dtype=np.float64) / sample_rate_hz
    columns: list[np.ndarray] = []
    for harmonic in range(1, partial_count + 1):
        angle = 2.0 * np.pi * harmonic * f0_hz * time
        columns.extend((np.sin(angle), np.cos(angle)))
    design = np.column_stack(columns)
    weights, *_ = np.linalg.lstsq(design, observed, rcond=None)
    reconstruction = design @ weights
    amplitudes = []
    for index in range(partial_count):
        sine_weight = weights[index * 2]
        cosine_weight = weights[index * 2 + 1]
        amplitudes.append(float(np.hypot(sine_weight, cosine_weight)))
    normalizer = max(amplitudes[0], 1e-12)
    return reconstruction, tuple(amplitude / normalizer for amplitude in amplitudes)


def _rms(values: np.ndarray) -> float:
    return float(np.sqrt(np.mean(np.square(values, dtype=np.float64)))) if values.size else 0.0


def _null_depth_db(observed: np.ndarray, residual: np.ndarray) -> float:
    return float(20.0 * np.log10(max(_rms(residual), 1e-15) / max(_rms(observed), 1e-15)))


def _harmonic_residual_ratio(
    residual: np.ndarray,
    sample_rate_hz: int,
    f0_hz: float,
    partial_count: int,
) -> float:
    nfft = 1 << int(np.ceil(np.log2(max(residual.size, 4096))))
    spectrum = np.square(np.abs(np.fft.rfft(residual * np.hanning(residual.size), n=nfft)))
    frequencies = np.fft.rfftfreq(nfft, 1.0 / sample_rate_hz)
    harmonic_mask = np.zeros_like(spectrum, dtype=bool)
    width_hz = max(2.0, f0_hz * 0.015)
    for harmonic in range(1, partial_count + 1):
        center = harmonic * f0_hz
        harmonic_mask |= np.abs(frequencies - center) <= width_hz
    audible = (frequencies >= 20.0) & (frequencies <= min(20000.0, sample_rate_hz / 2.0))
    total = float(spectrum[audible].sum())
    if total <= 1e-18:
        return 0.0
    return float(spectrum[audible & harmonic_mask].sum() / total)


def evaluate_fixture(config: HarmonicFixture) -> RecoveryResult:
    observed = synthesize_fixture(config)
    estimated_f0 = estimate_f0(observed, config.sample_rate_hz)
    reconstruction, estimated_amplitudes = fit_harmonic_model(
        observed,
        config.sample_rate_hz,
        estimated_f0,
        len(config.partial_amplitudes),
    )
    residual = observed - reconstruction
    true_normalizer = max(config.partial_amplitudes[0], 1e-12)
    true_amplitudes = np.asarray(config.partial_amplitudes, dtype=np.float64) / true_normalizer
    estimated = np.asarray(estimated_amplitudes, dtype=np.float64)
    f0_error_cents = float(1200.0 * np.log2(estimated_f0 / config.fundamental_hz))
    partial_mae = float(np.mean(np.abs(estimated - true_amplitudes)))
    null_depth = _null_depth_db(observed, residual)
    residual_ratio = _harmonic_residual_ratio(
        residual, config.sample_rate_hz, estimated_f0, len(config.partial_amplitudes)
    )
    reconstruction_score = "PASS" if null_depth <= -25.0 else "REVIEW"
    parameter_score = "PASS" if abs(f0_error_cents) <= 5.0 and partial_mae <= 0.08 else "REVIEW"
    return RecoveryResult(
        fixture_id=config.fixture_id,
        estimated_f0_hz=estimated_f0,
        f0_error_cents=f0_error_cents,
        estimated_partial_amplitudes=estimated_amplitudes,
        partial_amplitude_mae=partial_mae,
        null_depth_db=null_depth,
        harmonic_residual_ratio=residual_ratio,
        reconstruction_score=reconstruction_score,
        parameter_recovery_score=parameter_score,
    )


def default_fixtures() -> tuple[HarmonicFixture, ...]:
    return (
        HarmonicFixture(fixture_id="clean_harmonic_body"),
        HarmonicFixture(fixture_id="noisy_harmonic_body", noise_rms=0.02, seed=7),
        HarmonicFixture(fixture_id="soft_clipped_body", soft_clip_drive=1.8),
    )


def run_pipeline(fixtures: Iterable[HarmonicFixture] | None = None) -> dict[str, object]:
    active = tuple(fixtures or default_fixtures())
    results = [evaluate_fixture(fixture) for fixture in active]
    return {
        "experiment_id": EXPERIMENT_ID,
        "pipeline_version": PIPELINE_VERSION,
        "evidence_class": EVIDENCE_CLASS,
        "claim_boundary": "Synthetic fixtures only; reconstruction is scored separately from parameter recovery.",
        "results": [result.to_dict() for result in results],
        "overall_status": "PASS" if all(
            result.reconstruction_score == "PASS" for result in results[:2]
        ) else "REVIEW",
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
