from __future__ import annotations

import argparse
import hashlib
import json
import math
import wave
from pathlib import Path

import numpy as np


def linear_track(keys, n_samples):
    keys = sorted(keys, key=lambda k: k["sample"])
    x = np.array([k["sample"] for k in keys], dtype=np.float64)
    y = np.array([k["value"] for k in keys], dtype=np.float64)
    samples = np.arange(n_samples, dtype=np.float64)
    return np.interp(samples, x, y, left=y[0], right=y[-1])


def source_signal(source, automation, sample_rate, n_samples):
    phase_track = np.full(n_samples, float(source["phase_deg"]), dtype=np.float64)
    target = f'{source["id"]}.phase_deg'
    for track in automation:
        if track["target"] == target:
            if track["curve"] != "linear":
                raise ValueError("Reference oracle v0.1 supports linear phase automation only")
            phase_track = linear_track(track["keys"], n_samples)

    t = np.arange(n_samples, dtype=np.float64) / sample_rate
    base_phase = np.deg2rad(phase_track)
    f0 = float(source["frequency_hz"])
    amp = float(source["amplitude"])

    if source["generator"] == "sine":
        signal = np.sin(2 * np.pi * f0 * t + base_phase)
    elif source["generator"] == "additive":
        signal = np.zeros(n_samples, dtype=np.float64)
        partials = source.get("partials") or [{"harmonic": 1, "amplitude": 1.0}]
        norm = sum(float(p["amplitude"]) for p in partials) or 1.0
        for p in partials:
            h = int(p["harmonic"])
            pa = float(p["amplitude"]) / norm
            po = math.radians(float(p.get("phase_offset_deg", 0.0)))
            signal += pa * np.sin(2 * np.pi * f0 * h * t + base_phase + po)
    else:
        raise ValueError(f'Unsupported generator: {source["generator"]}')

    return amp * signal, phase_track


def rms(x):
    return float(np.sqrt(np.mean(np.square(x), dtype=np.float64)))


def db_ratio(numerator, denominator, floor_db=-300.0):
    if numerator <= 0 or denominator <= 0:
        return floor_db
    return max(floor_db, 20.0 * math.log10(numerator / denominator))


def write_wav(path, stereo, sample_rate):
    peak = float(np.max(np.abs(stereo)))
    scale = 0.98 / peak if peak > 0.98 else 1.0
    pcm = np.clip(stereo * scale, -1.0, 1.0)
    pcm16 = np.round(pcm * 32767.0).astype("<i2")
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(pcm16.tobytes())


def render(experiment):
    sr = int(experiment["engine"]["sample_rate"])
    n = int(experiment["timeline"]["duration_samples"])
    automation = experiment.get("automation", [])

    L = np.zeros(n, dtype=np.float64)
    R = np.zeros(n, dtype=np.float64)
    C_physical = np.zeros(n, dtype=np.float64)
    source_states = {}

    for source in experiment["sources"]:
        sig, phase_track = source_signal(source, automation, sr, n)
        source_states[source["id"]] = {
            "phase_deg_start": float(phase_track[0]),
            "phase_deg_end": float(phase_track[-1]),
            "frequency_hz": float(source["frequency_hz"]),
            "amplitude": float(source["amplitude"]),
            "channel": source["channel"],
        }
        if source["channel"] == "L":
            L += sig
        elif source["channel"] == "R":
            R += sig
        elif source["channel"] == "C":
            C_physical += sig

    center = (L + R) / 2.0 + C_physical
    side = (L - R) / 2.0

    ref = (np.abs(L) + np.abs(R)) / 2.0
    window = max(64, int(sr * 0.010))
    kernel = np.ones(window, dtype=np.float64) / window
    center_rms_curve = np.sqrt(np.convolve(center * center, kernel, mode="same"))
    ref_rms_curve = np.sqrt(np.convolve(ref * ref, kernel, mode="same"))
    ratio = np.divide(center_rms_curve, ref_rms_curve, out=np.ones_like(center_rms_curve), where=ref_rms_curve > 1e-15)
    null_curve_db = 20.0 * np.log10(np.maximum(ratio, 1e-15))
    guard = max(window, 1)
    search = null_curve_db[guard:-guard] if n > 2 * guard else null_curve_db
    deepest_local = int(np.argmin(search))
    deepest_sample = deepest_local + (guard if n > 2 * guard else 0)

    metrics = {
        "sample_rate": sr,
        "duration_samples": n,
        "duration_seconds": n / sr,
        "left_rms": rms(L),
        "right_rms": rms(R),
        "center_rms": rms(center),
        "side_rms": rms(side),
        "global_center_null_depth_db": db_ratio(rms(center), rms(ref)),
        "deepest_null_sample": deepest_sample,
        "deepest_null_time_seconds": deepest_sample / sr,
        "deepest_null_db_10ms": float(null_curve_db[deepest_sample]),
        "source_states": source_states,
    }

    truth_state = {
        "sample_rate": sr,
        "sample": deepest_sample,
        "sources": source_states,
        "routing": experiment["routing"],
        "random_seed": experiment["engine"]["render_seed"],
    }
    snapshot_payload = {
        "schema_version": "0.1.0",
        "snapshot_id": f'{experiment["experiment_id"]}-DEEPEST-NULL',
        "experiment_id": experiment["experiment_id"],
        "sample": deepest_sample,
        "time_seconds": deepest_sample / sr,
        "truth_state": truth_state,
        "interaction_state": {
            "event": "DEEPEST_NULL",
            "center_null_depth_db_10ms": float(null_curve_db[deepest_sample]),
        },
        "intervention_state": {
            "active": [],
            "note": "Reference scenario contains automation but no interaction-triggered intervention."
        },
        "visualization_state": experiment.get("visualization", {}),
        "limitations": [
            "Reference oracle v0.1 stores modeled oscillator state, not arbitrary filter/delay histories.",
            "The local null metric uses a centered 10 ms RMS window."
        ],
    }
    canonical = json.dumps(snapshot_payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    snapshot_payload["state_hash"] = "sha256:" + hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    stereo = np.column_stack([L + C_physical, R + C_physical])
    return stereo, center, side, metrics, snapshot_payload


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("experiment")
    parser.add_argument("output_dir")
    args = parser.parse_args()

    experiment_path = Path(args.experiment)
    out = Path(args.output_dir)
    out.mkdir(parents=True, exist_ok=True)

    experiment = json.loads(experiment_path.read_text(encoding="utf-8"))
    stereo, center, side, metrics, snapshot = render(experiment)
    sr = experiment["engine"]["sample_rate"]

    write_wav(out / "canonical_stereo.wav", stereo, sr)
    write_wav(out / "center_and_side.wav", np.column_stack([center, side]), sr)
    (out / "metrics.json").write_text(json.dumps(metrics, indent=2) + "\n", encoding="utf-8")
    (out / "snapshot.deepest-null.json").write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
