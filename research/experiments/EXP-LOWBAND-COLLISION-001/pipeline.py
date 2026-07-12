from __future__ import annotations

from dataclasses import asdict, dataclass
import argparse
import json
from pathlib import Path
from typing import Iterable

import numpy as np

EXPERIMENT_ID = "EXP-LOWBAND-COLLISION-001"
PIPELINE_VERSION = "0.1.0-candidate"
EVIDENCE_CLASS = "HYPOTHESIS"


@dataclass(frozen=True)
class CollisionFixture:
    fixture_id: str
    sample_rate_hz: int = 48000
    duration_s: float = 1.2
    kick_times_s: tuple[float, ...] = ()
    bass_times_s: tuple[float, ...] = ()
    bass_offset_hz: float = 82.4
    seed: int = 1


@dataclass(frozen=True)
class DetectedEvent:
    sample_index: int
    seconds: float
    classification: str
    confidence: float
    broadband_ratio: float
    low_persistence_ratio: float
    evidence_class: str = EVIDENCE_CLASS


@dataclass(frozen=True)
class FixtureEvaluation:
    fixture_id: str
    true_kick_samples: tuple[int, ...]
    predicted_kick_samples: tuple[int, ...]
    unresolved_samples: tuple[int, ...]
    true_positives: int
    false_positives: int
    false_negatives: int
    precision: float
    recall: float
    f1: float
    median_timing_error_ms: float | None

    def to_dict(self) -> dict[str, object]:
        return asdict(self)


def _add_kick(signal: np.ndarray, sample_index: int, sample_rate_hz: int, seed: int) -> None:
    length = min(int(0.30 * sample_rate_hz), signal.size - sample_index)
    if length <= 0:
        return
    time = np.arange(length, dtype=np.float64) / sample_rate_hz
    frequency = 90.0 * np.exp(-time / 0.035) + 42.0
    phase = 2.0 * np.pi * np.cumsum(frequency) / sample_rate_hz
    body = 0.85 * np.sin(phase) * np.exp(-time / 0.075)
    click_length = min(int(0.012 * sample_rate_hz), length)
    rng = np.random.default_rng(seed)
    click = np.zeros(length, dtype=np.float64)
    click[:click_length] = rng.normal(0.0, 0.30, click_length) * np.hanning(click_length)
    signal[sample_index : sample_index + length] += body + click


def _add_bass(signal: np.ndarray, sample_index: int, sample_rate_hz: int, frequency_hz: float) -> None:
    length = min(int(0.55 * sample_rate_hz), signal.size - sample_index)
    if length <= 0:
        return
    time = np.arange(length, dtype=np.float64) / sample_rate_hz
    envelope = (1.0 - np.exp(-time / 0.010)) * np.exp(-time / 0.40)
    body = (
        np.sin(2.0 * np.pi * frequency_hz * time)
        + 0.32 * np.sin(2.0 * np.pi * 2.0 * frequency_hz * time)
        + 0.10 * np.sin(2.0 * np.pi * 3.0 * frequency_hz * time)
    )
    signal[sample_index : sample_index + length] += 0.52 * envelope * body


def synthesize_fixture(config: CollisionFixture) -> tuple[np.ndarray, tuple[int, ...]]:
    sample_count = int(round(config.duration_s * config.sample_rate_hz))
    signal = np.zeros(sample_count, dtype=np.float64)
    true_kicks = tuple(int(round(time_s * config.sample_rate_hz)) for time_s in config.kick_times_s)
    for index, sample in enumerate(true_kicks):
        _add_kick(signal, sample, config.sample_rate_hz, config.seed + index)
    for time_s in config.bass_times_s:
        _add_bass(signal, int(round(time_s * config.sample_rate_hz)), config.sample_rate_hz, config.bass_offset_hz)
    peak = max(float(np.max(np.abs(signal))), 1e-12)
    return signal / peak, true_kicks


def _band_energy_frames(signal: np.ndarray, sample_rate_hz: int, frame_size: int, hop_size: int) -> tuple[np.ndarray, np.ndarray]:
    if signal.size < frame_size:
        return np.empty((0, 2)), np.empty(0)
    frames = np.lib.stride_tricks.sliding_window_view(signal, frame_size)[::hop_size]
    spectra = np.square(np.abs(np.fft.rfft(frames * np.hanning(frame_size), axis=1)))
    frequencies = np.fft.rfftfreq(frame_size, 1.0 / sample_rate_hz)
    low = spectra[:, (frequencies >= 20.0) & (frequencies < 180.0)].sum(axis=1)
    high = spectra[:, (frequencies >= 700.0) & (frequencies < min(12000.0, sample_rate_hz / 2.0))].sum(axis=1)
    return np.column_stack((low, high)), frames


def detect_events(signal: np.ndarray, sample_rate_hz: int = 48000) -> list[DetectedEvent]:
    frame_size = 1024
    hop_size = 128
    band_energy, _ = _band_energy_frames(np.asarray(signal, dtype=np.float64), sample_rate_hz, frame_size, hop_size)
    if band_energy.shape[0] < 4:
        return []
    total = band_energy.sum(axis=1)
    flux = np.maximum(total[1:] - total[:-1], 0.0)
    transformed = np.log1p(flux)
    baseline = np.median(transformed)
    mad = np.median(np.abs(transformed - baseline))
    z = (transformed - baseline) / max(1.4826 * mad, 0.05)
    threshold = max(4.0, float(np.quantile(z, 0.92)))
    candidate_frames: list[int] = []
    refractory = int(round(0.16 * sample_rate_hz / hop_size))
    for index in range(1, z.size - 1):
        if z[index] < threshold or z[index] < z[index - 1] or z[index] < z[index + 1]:
            continue
        frame_index = index + 1
        if candidate_frames and frame_index - candidate_frames[-1] < refractory:
            if z[index] > z[candidate_frames[-1] - 1]:
                candidate_frames[-1] = frame_index
            continue
        candidate_frames.append(frame_index)

    results: list[DetectedEvent] = []
    for frame_index in candidate_frames:
        sample_index = frame_index * hop_size
        attack_stop = min(signal.size, sample_index + int(0.030 * sample_rate_hz))
        tail_start = min(signal.size, sample_index + int(0.090 * sample_rate_hz))
        tail_stop = min(signal.size, sample_index + int(0.170 * sample_rate_hz))
        attack = signal[sample_index:attack_stop]
        tail = signal[tail_start:tail_stop]
        attack_rms = float(np.sqrt(np.mean(np.square(attack)))) if attack.size else 0.0
        tail_rms = float(np.sqrt(np.mean(np.square(tail)))) if tail.size else 0.0
        persistence = tail_rms / max(attack_rms, 1e-12)
        low, high = map(float, band_energy[min(frame_index, band_energy.shape[0] - 1)])
        broadband_ratio = high / max(low + high, 1e-12)
        if broadband_ratio >= 0.010 and persistence <= 0.80:
            classification = "KICK_CANDIDATE"
            confidence = min(1.0, 0.45 + 8.0 * broadband_ratio + 0.25 * (1.0 - persistence))
        elif persistence >= 0.42 and broadband_ratio < 0.010:
            classification = "BASS_ATTACK"
            confidence = min(1.0, 0.45 + 0.4 * persistence)
        else:
            classification = "UNRESOLVED_TRANSIENT"
            confidence = 0.5
        results.append(
            DetectedEvent(
                sample_index=sample_index,
                seconds=sample_index / sample_rate_hz,
                classification=classification,
                confidence=float(confidence),
                broadband_ratio=broadband_ratio,
                low_persistence_ratio=float(persistence),
            )
        )
    return results


def _match_events(truth: tuple[int, ...], predictions: tuple[int, ...], tolerance_samples: int) -> tuple[int, int, int, list[int]]:
    unmatched = list(predictions)
    errors: list[int] = []
    true_positives = 0
    for target in truth:
        if not unmatched:
            continue
        best_index = min(range(len(unmatched)), key=lambda index: abs(unmatched[index] - target))
        error = unmatched[best_index] - target
        if abs(error) <= tolerance_samples:
            true_positives += 1
            errors.append(error)
            unmatched.pop(best_index)
    false_positives = len(unmatched)
    false_negatives = len(truth) - true_positives
    return true_positives, false_positives, false_negatives, errors


def evaluate_fixture(config: CollisionFixture) -> FixtureEvaluation:
    signal, truth = synthesize_fixture(config)
    events = detect_events(signal, config.sample_rate_hz)
    predictions = tuple(event.sample_index for event in events if event.classification == "KICK_CANDIDATE")
    unresolved = tuple(event.sample_index for event in events if event.classification == "UNRESOLVED_TRANSIENT")
    tolerance = int(round(0.025 * config.sample_rate_hz))
    tp, fp, fn, errors = _match_events(truth, predictions, tolerance)
    precision = tp / (tp + fp) if tp + fp else (1.0 if not truth else 0.0)
    recall = tp / (tp + fn) if tp + fn else 1.0
    f1 = 2.0 * precision * recall / (precision + recall) if precision + recall else 0.0
    median_error = None if not errors else float(np.median(np.abs(errors)) * 1000.0 / config.sample_rate_hz)
    return FixtureEvaluation(
        fixture_id=config.fixture_id,
        true_kick_samples=truth,
        predicted_kick_samples=predictions,
        unresolved_samples=unresolved,
        true_positives=tp,
        false_positives=fp,
        false_negatives=fn,
        precision=float(precision),
        recall=float(recall),
        f1=float(f1),
        median_timing_error_ms=median_error,
    )


def default_fixtures() -> tuple[CollisionFixture, ...]:
    return (
        CollisionFixture("kick_only", kick_times_s=(0.25, 0.72)),
        CollisionFixture("bass_only", bass_times_s=(0.25, 0.72)),
        CollisionFixture("coincident", kick_times_s=(0.25, 0.72), bass_times_s=(0.25, 0.72)),
        CollisionFixture("offset_20ms", kick_times_s=(0.25, 0.72), bass_times_s=(0.23, 0.74)),
    )


def run_pipeline(fixtures: Iterable[CollisionFixture] | None = None) -> dict[str, object]:
    evaluations = [evaluate_fixture(fixture) for fixture in tuple(fixtures or default_fixtures())]
    aggregate_tp = sum(item.true_positives for item in evaluations)
    aggregate_fp = sum(item.false_positives for item in evaluations)
    aggregate_fn = sum(item.false_negatives for item in evaluations)
    precision = aggregate_tp / (aggregate_tp + aggregate_fp) if aggregate_tp + aggregate_fp else 1.0
    recall = aggregate_tp / (aggregate_tp + aggregate_fn) if aggregate_tp + aggregate_fn else 1.0
    f1 = 2.0 * precision * recall / (precision + recall) if precision + recall else 0.0
    bass_only = next(item for item in evaluations if item.fixture_id == "bass_only")
    status = "PASS" if f1 >= 0.75 and bass_only.false_positives == 0 else "REVIEW"
    return {
        "experiment_id": EXPERIMENT_ID,
        "pipeline_version": PIPELINE_VERSION,
        "evidence_class": EVIDENCE_CLASS,
        "claim_boundary": "Synthetic low-band collisions only; KICK_CANDIDATE is not instrument authority.",
        "aggregate": {
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "true_positives": aggregate_tp,
            "false_positives": aggregate_fp,
            "false_negatives": aggregate_fn,
        },
        "results": [item.to_dict() for item in evaluations],
        "overall_status": status,
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
