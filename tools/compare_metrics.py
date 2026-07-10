from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path


FLOAT_TOLERANCES = {
    "duration_seconds": (1.0e-12, 1.0e-12),
    "left_rms": (1.0e-10, 1.0e-10),
    "right_rms": (1.0e-10, 1.0e-10),
    "center_rms": (1.0e-10, 1.0e-10),
    "side_rms": (1.0e-10, 1.0e-10),
    "global_center_null_depth_db": (1.0e-8, 1.0e-8),
    "deepest_null_time_seconds": (5.0e-5, 1.0e-8),
    "deepest_null_db_10ms": (0.15, 1.0e-5),
}

EXACT_FIELDS = {
    "sample_rate",
    "duration_samples",
}


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def compare(reference: dict, candidate: dict) -> list[str]:
    failures: list[str] = []

    for field in sorted(EXACT_FIELDS):
        if reference.get(field) != candidate.get(field):
            failures.append(
                f"{field}: expected exact {reference.get(field)!r}, got {candidate.get(field)!r}"
            )

    for field, (abs_tol, rel_tol) in FLOAT_TOLERANCES.items():
        expected = float(reference[field])
        actual = float(candidate[field])
        if not math.isclose(expected, actual, abs_tol=abs_tol, rel_tol=rel_tol):
            failures.append(
                f"{field}: expected {expected:.15g}, got {actual:.15g}; "
                f"abs_error={abs(expected - actual):.6g}, abs_tol={abs_tol}, rel_tol={rel_tol}"
            )

    sample_error = abs(
        int(reference["deepest_null_sample"]) - int(candidate["deepest_null_sample"])
    )
    if sample_error > 2:
        failures.append(
            "deepest_null_sample: "
            f"expected {reference['deepest_null_sample']}, got {candidate['deepest_null_sample']}; "
            f"error={sample_error} samples, tolerance=2"
        )

    reference_states = reference.get("source_states", {})
    candidate_states = candidate.get("source_states", {})
    if set(reference_states) != set(candidate_states):
        failures.append(
            f"source_states keys differ: expected {sorted(reference_states)}, "
            f"got {sorted(candidate_states)}"
        )
    else:
        for source_id in sorted(reference_states):
            expected_state = reference_states[source_id]
            actual_state = candidate_states[source_id]
            for field in ("frequency_hz", "amplitude", "phase_deg_start", "phase_deg_end"):
                if not math.isclose(
                    float(expected_state[field]),
                    float(actual_state[field]),
                    abs_tol=1.0e-10,
                    rel_tol=1.0e-10,
                ):
                    failures.append(
                        f"source_states.{source_id}.{field}: expected "
                        f"{expected_state[field]!r}, got {actual_state[field]!r}"
                    )
            if expected_state.get("channel") != actual_state.get("channel"):
                failures.append(
                    f"source_states.{source_id}.channel: expected "
                    f"{expected_state.get('channel')!r}, got {actual_state.get('channel')!r}"
                )

    return failures


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("reference_metrics", type=Path)
    parser.add_argument("candidate_metrics", type=Path)
    args = parser.parse_args()

    reference = load(args.reference_metrics)
    candidate = load(args.candidate_metrics)
    failures = compare(reference, candidate)

    if failures:
        print("Golden metric comparison FAILED.\n", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    print("Golden metric comparison passed.")
    print(
        json.dumps(
            {
                "reference": str(args.reference_metrics),
                "candidate": str(args.candidate_metrics),
                "deepest_null_sample_error": abs(
                    int(reference["deepest_null_sample"])
                    - int(candidate["deepest_null_sample"])
                ),
                "deepest_null_db_error": abs(
                    float(reference["deepest_null_db_10ms"])
                    - float(candidate["deepest_null_db_10ms"])
                ),
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
