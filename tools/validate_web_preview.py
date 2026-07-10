from __future__ import annotations

from html.parser import HTMLParser
import json
from pathlib import Path
import re

from jsonschema import Draft202012Validator, RefResolver

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"
SCHEMAS = ROOT / "schemas"


class PreviewParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: set[str] = set()
        self.scripts: list[str] = []
        self.stylesheets: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if values.get("id"):
            self.ids.add(str(values["id"]))
        if tag == "script" and values.get("src"):
            self.scripts.append(str(values["src"]))
        if tag == "link" and values.get("rel") == "stylesheet" and values.get("href"):
            self.stylesheets.append(str(values["href"]))


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"WEB PREVIEW VALIDATION FAILED: {message}")


def validate_example() -> None:
    session_schema = json.loads((SCHEMAS / "preview-session.schema.json").read_text(encoding="utf-8"))
    automation_schema = json.loads((SCHEMAS / "automation.schema.json").read_text(encoding="utf-8"))
    example = json.loads((WEB / "examples" / "preview-session.example.json").read_text(encoding="utf-8"))

    Draft202012Validator.check_schema(session_schema)
    resolver = RefResolver.from_schema(
        session_schema,
        store={automation_schema["$id"]: automation_schema},
    )
    errors = sorted(
        Draft202012Validator(session_schema, resolver=resolver).iter_errors(example),
        key=lambda error: list(error.absolute_path),
    )
    require(not errors, "; ".join(error.message for error in errors))


def main() -> None:
    required_files = [
        WEB / "index.html",
        WEB / "styles.css",
        WEB / "app.js",
        WEB / "session-contract.js",
        WEB / "README.md",
        WEB / "examples" / "preview-session.example.json",
        SCHEMAS / "preview-session.schema.json",
    ]
    for path in required_files:
        require(path.is_file(), f"missing {path.relative_to(ROOT)}")
        require(path.stat().st_size > 100, f"unexpectedly small {path.relative_to(ROOT)}")

    html = (WEB / "index.html").read_text(encoding="utf-8")
    js = (WEB / "app.js").read_text(encoding="utf-8")
    contract_js = (WEB / "session-contract.js").read_text(encoding="utf-8")

    parser = PreviewParser()
    parser.feed(html)

    required_ids = {
        "audioToggle",
        "freezeToggle",
        "recordToggle",
        "playAutomation",
        "exportSession",
        "importSession",
        "scopeCanvas",
        "vectorCanvas",
        "phaseCanvas",
        "snapshotOutput",
    }
    require(required_ids <= parser.ids, f"missing DOM ids: {sorted(required_ids - parser.ids)}")
    require(parser.scripts == ["app.js", "session-contract.js"], f"unexpected script sources: {parser.scripts}")
    require(parser.stylesheets == ["styles.css"], f"unexpected stylesheet sources: {parser.stylesheets}")

    external_asset = re.compile(r"(?:src|href)=[\"']https?://", re.IGNORECASE)
    require(not external_asset.search(html), "external assets are not permitted in the local-first preview")
    require("PREVIEW / NOT TRUTH ENGINE" in html, "missing visible preview warning")
    require("PREVIEW_SNAPSHOT_NOT_DETERMINISTIC_EVIDENCE" in js, "missing evidence classification")

    for term in ["truth_state", "interaction_state", "intervention_state", "visualization_state"]:
        require(term in js, f"missing exported state domain: {term}")

    require("createPeriodicWave" in js, "additive PeriodicWave path missing")
    require("createStereoPanner" in js, "L/C/R preview routing path missing")
    require("state.automation" in js, "automation state missing")
    require("structuredClone" in js, "snapshot isolation path missing")
    require("automation_tracks" in contract_js, "canonical automation-track export missing")
    require("document_type: \"nullforge_preview_session\"" in contract_js, "preview-session document type missing")

    validate_example()
    print("WEB PREVIEW VALIDATION PASS")


if __name__ == "__main__":
    main()
