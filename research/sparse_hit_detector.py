from __future__ import annotations

from dataclasses import asdict, dataclass
from hashlib import sha256
import json
from pathlib import Path
from typing import Iterable

import numpy as np


CLASS_SPARSE_HIT = "SPARSE_HIT"
CLASS_BASS_ATTACK = "BASS_ATTACK"
CLASS_UNRESOLVED = "UNRESOLVED_TRANSIENT"
CLASS_NO_EVENT = "NO_EVENT"

_BANDS_HZ = (
    ("low", 20.0, 180.0),
    ("low_mid", 180.0, 700.0),
    ("upper_mid", 700.0, 5000.0),
    ("high", 5000.0, 20000.0),
)


@dataclass(frozen=True)
class DetectorConfig:
    sample_rate_hz: int = 48000
    frame_size: int = 1024
    hop_size: int = 128
    onset_z_threshold: float = 6.0
    refractory_ms: float = 350.0
    min_attack_rms: float = 1e-4
    min_sparse_flatness: float = 0.10
    min_sparse_broadband_share: float = 0.003
    max_sparse_persistence_ratio: float = 0.65
    max_bass_flatness: float = 0.01
    min_bass_persistence_ratio: float = 0.45
    min_bass_low_share: float = 0.90
    active_band_share: float = 0.001

    def validate(self) -> None:
        if self.sample_rate_hz < 8000:
            raise ValueError("sample_rate_hz must be at least 8000")
        if self.frame_size < 128 or self.frame_size & (self.frame_size - 1):
            raise ValueError("frame_size must be a power of two >= 128")
        if not 1 <= self.hop_size <= self.frame_size:
            raise ValueError("hop_size must be inside [1, frame_size]")
        if self.refractory_ms <= 0:
            raise ValueError("refractory_ms must be positive")

    def parameter_hash(self) -> str:
        payload = json.dumps(asdict(self), sort_keys=True, separators=(",", ":"))
        return sha256(payload.encode("utf-8")).hexdigest()


@dataclass(frozen=True)
class Candidate:
    sample_index: int
    seconds: float
    onset_z: float
    low_share: float
    low_mid_share: float
    upper_mid_share: float
    high_share: float
    broadband_bands: int
    spectral_flatness: float
    persistence_ratio: float
    confidence: float
    classification: str
    detector_version: str = "0.1.0-candidate"
    evidence_class: str = "HYPOTHESIS"
    parameter_hash: str = ""

    def to_dict(self) -> dict[str, object]:
        return asdict(self)


def _as_mono(signal: np.ndarray | Iterable[float]) -> np.ndarray:
    data = np.asarray(signal, dtype=np.float64)
    if data.ndim == 1:
        return data
    if data.ndim != 2:
        raise ValueError("signal must be mono or two-dimensional channel data")
    if data.shape[0] <= 8 and data.shape[1] > data.shape[0]:
        return data.mean(axis=0)
    return data.mean(axis=1)


def _frame_signal(signal: np.ndarray, frame_size: int, hop_size: int) -> np.ndarray:
    if signal.size < frame_size:
        return np.empty((0, frame_size), dtype=np.float64)
    view = np.lib.stride_tricks.sliding_window_view(signal, frame_size)
    return view[::hop_size]


def _robust_onset_z(total_flux: np.ndarray, history_frames: int) -> np.ndarray:
    transformed = np.log1p(total_flux)
    scores = np.zeros_like(transformed)
    for index, value in enumerate(transformed):
        start = max(0, index - history_frames)
        history = transformed[start:index]
        if history.size < 8:
            stop = min(transformed.size, max(8, history_frames))
            history = transformed[:stop]
        baseline = float(np.median(history))
        mad = float(np.median(np.abs(history - baseline)))
        scale = max(1.4826 * mad, 0.05, abs(baseline) * 0.05)
        scores[index] = (value - baseline) / scale
    return scores


def _candidate_peak_indices(scores: np.ndarray, threshold: float, refractory_frames: int) -> list[int]:
    peaks: list[int] = []
    for index in range(1, scores.size - 1):
        if scores[index] < threshold:
            continue
        if scores[index] < scores[index - 1] or scores[index] < scores[index + 1]:
            continue
        if peaks and index - peaks[-1] < refractory_frames:
            if scores[index] > scores[peaks[-1]]:
                peaks[-1] = index
            continue
        peaks.append(index)
    return peaks


def _rms(values: np.ndarray) -> float:
    if values.size == 0:
        return 0.0
    return float(np.sqrt(np.mean(np.square(values, dtype=np.float64))))


def _attack_spectrum_features(
    signal: np.ndarray,
    sample_index: int,
    config: DetectorConfig,
) -> tuple[np.ndarray, float]:
    size = config.frame_size * 2
    segment = np.zeros(size, dtype=np.float64)
    available = min(size, max(0, signal.size - sample_index))
    if available:
        segment[:available] = signal[sample_index : sample_index + available]
    window = np.hanning(size)
    magnitude = np.abs(np.fft.rfft(segment * window)) + 1e-12
    frequencies = np.fft.rfftfreq(size, 1.0 / config.sample_rate_hz)

    powers: list[float] = []
    for _, low_hz, high_hz in _BANDS_HZ:
        mask = (frequencies >= low_hz) & (frequencies < high_hz)
        powers.append(float(np.square(magnitude[mask]).sum()))
    power = np.asarray(powers, dtype=np.float64)
    shares = power / max(float(power.sum()), 1e-12)

    audible = (frequencies >= 20.0) & (frequencies < min(20000.0, config.sample_rate_hz / 2))
    audible_magnitude = magnitude[audible]
    flatness = float(
        np.exp(np.mean(np.log(audible_magnitude)))
        / max(float(np.mean(audible_magnitude)), 1e-12)
    )
    return shares, flatness


def _classify(
    attack_rms: float,
    shares: np.ndarray,
    flatness: float,
    persistence_ratio: float,
    onset_z: float,
    config: DetectorConfig,
) -> tuple[str, float]:
    low_share, low_mid_share, upper_mid_share, high_share = map(float, shares)
    broadband_share = upper_mid_share + high_share
    active_bands = int(np.sum(shares >= config.active_band_share))

    if attack_rms < config.min_attack_rms:
        return CLASS_NO_EVENT, 0.0

    if (
        active_bands >= 3
        and flatness >= config.min_sparse_flatness
        and broadband_share >= config.min_sparse_broadband_share
        and persistence_ratio <= config.max_sparse_persistence_ratio
    ):
        confidence = (
            0.25 * min(active_bands / 4.0, 1.0)
            + 0.30 * min(flatness / 0.5, 1.0)
            + 0.25 * max(0.0, 1.0 - persistence_ratio)
            + 0.20 * min(max(onset_z, 0.0) / 20.0, 1.0)
        )
        return CLASS_SPARSE_HIT, float(min(confidence, 1.0))

    if (
        low_share + low_mid_share >= config.min_bass_low_share
        and flatness <= config.max_bass_flatness
        and persistence_ratio >= config.min_bass_persistence_ratio
    ):
        confidence = (
            0.45 * min(low_share + low_mid_share, 1.0)
            + 0.30 * min(persistence_ratio, 1.0)
            + 0.25 * max(0.0, 1.0 - flatness / config.max_bass_flatness)
        )
        return CLASS_BASS_ATTACK, float(min(confidence, 1.0))

    return CLASS_UNRESOLVED, float(min(0.80, 0.40 + max(onset_z, 0.0) / 100.0))


def detect_sparse_hits(
    signal: np.ndarray | Iterable[float],
    config: DetectorConfig | None = None,
) -> list[Candidate]:
    """Return fail-closed transient candidates from synthetic or public PCM data.

    This candidate detector is not a trained classifier and does not establish
    instrument identity. `SPARSE_HIT` is a hypothesis requiring fixture and
    human/source validation before promotion.
    """

    active_config = config or DetectorConfig()
    active_config.validate()
    mono = _as_mono(signal)
    if mono.size < active_config.frame_size * 3:
        return []

    frames = _frame_signal(mono, active_config.frame_size, active_config.hop_size)
    window = np.hanning(active_config.frame_size)
    magnitude = np.abs(np.fft.rfft(frames * window, axis=1)) + 1e-12
    frequencies = np.fft.rfftfreq(active_config.frame_size, 1.0 / active_config.sample_rate_hz)
    positive_flux = np.maximum(magnitude[1:] - magnitude[:-1], 0.0)

    band_flux: list[np.ndarray] = []
    for _, low_hz, high_hz in _BANDS_HZ:
        mask = (frequencies >= low_hz) & (frequencies < high_hz)
        band_flux.append(positive_flux[:, mask].sum(axis=1))
    total_flux = np.stack(band_flux, axis=1).sum(axis=1)

    history_frames = max(8, int(0.5 * active_config.sample_rate_hz / active_config.hop_size))
    onset_scores = _robust_onset_z(total_flux, history_frames)
    refractory_frames = max(
        1,
        int(
            active_config.refractory_ms
            * active_config.sample_rate_hz
            / 1000.0
            / active_config.hop_size
        ),
    )
    peaks = _candidate_peak_indices(
        onset_scores,
        active_config.onset_z_threshold,
        refractory_frames,
    )

    parameter_hash = active_config.parameter_hash()
    results: list[Candidate] = []
    for peak in peaks:
        sample_index = (peak + 1) * active_config.hop_size
        attack_stop = min(mono.size, sample_index + int(0.030 * active_config.sample_rate_hz))
        persistence_start = min(
            mono.size,
            sample_index + int(0.080 * active_config.sample_rate_hz),
        )
        persistence_stop = min(
            mono.size,
            sample_index + int(0.160 * active_config.sample_rate_hz),
        )
        attack_rms = _rms(mono[sample_index:attack_stop])
        persistence_rms = _rms(mono[persistence_start:persistence_stop])
        persistence_ratio = persistence_rms / max(attack_rms, 1e-12)

        shares, flatness = _attack_spectrum_features(mono, sample_index, active_config)
        classification, confidence = _classify(
            attack_rms,
            shares,
            flatness,
            persistence_ratio,
            float(onset_scores[peak]),
            active_config,
        )

        results.append(
            Candidate(
                sample_index=sample_index,
                seconds=sample_index / active_config.sample_rate_hz,
                onset_z=float(onset_scores[peak]),
                low_share=float(shares[0]),
                low_mid_share=float(shares[1]),
                upper_mid_share=float(shares[2]),
                high_share=float(shares[3]),
                broadband_bands=int(np.sum(shares >= active_config.active_band_share)),
                spectral_flatness=flatness,
                persistence_ratio=float(persistence_ratio),
                confidence=confidence,
                classification=classification,
                parameter_hash=parameter_hash,
            )
        )
    return results


def write_report(candidates: Iterable[Candidate], destination: str | Path) -> None:
    payload = {
        "detector_version": "0.1.0-candidate",
        "evidence_class": "HYPOTHESIS",
        "candidates": [candidate.to_dict() for candidate in candidates],
    }
    Path(destination).write_text(
        json.dumps(payload, indent=2, sort_keys=True),
        encoding="utf-8",
    )
