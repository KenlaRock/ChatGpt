from __future__ import annotations

import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator, RefResolver

ROOT = Path(__file__).resolve().parents[1]
SCHEMAS = ROOT / "schemas"


def main() -> None:
    store: dict[str, dict] = {}
    for path in SCHEMAS.glob("*.json"):
        schema = json.loads(path.read_text(encoding="utf-8"))
        Draft202012Validator.check_schema(schema)
        store[schema.get("$id", path.name)] = schema
        store[path.name] = schema

    experiment_schema = json.loads(
        (SCHEMAS / "experiment.schema.json").read_text(encoding="utf-8")
    )
    resolver = RefResolver.from_schema(experiment_schema, store=store)

    errors: list[str] = []
    scenario_paths = list((ROOT / "scenarios").rglob("*.json"))
    for path in scenario_paths:
        data = json.loads(path.read_text(encoding="utf-8"))
        validator = Draft202012Validator(experiment_schema, resolver=resolver)
        for error in validator.iter_errors(data):
            location = ".".join(str(part) for part in error.absolute_path) or "<root>"
            errors.append(f"{path}:{location}: {error.message}")

    if errors:
        print("\n".join(errors), file=sys.stderr)
        raise SystemExit(1)

    print("Schema validation passed.")
    print(f"Validated {len(scenario_paths)} experiment(s).")


if __name__ == "__main__":
    main()
