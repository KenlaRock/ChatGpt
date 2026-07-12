import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"


class PreviewLabStructureTests(unittest.TestCase):
    def test_required_runtime_files_exist(self) -> None:
        required = {
            "README.md",
            "app.js",
            "index.html",
            "session-contract.js",
            "styles.css",
            "examples/preview-session.example.json",
        }
        missing = sorted(path for path in required if not (WEB / path).is_file())
        self.assertEqual([], missing, f"Missing Preview Lab files: {missing}")

    def test_index_declares_preview_boundary_and_assets(self) -> None:
        html = (WEB / "index.html").read_text(encoding="utf-8")
        self.assertIn("PREVIEW / NOT TRUTH ENGINE", html)
        self.assertIn('href="styles.css"', html)
        self.assertIn('src="app.js"', html)
        self.assertIn('src="session-contract.js"', html)
        self.assertIn('id="audioToggle"', html)
        self.assertIn('id="scopeCanvas"', html)
        self.assertIn('id="vectorCanvas"', html)
        self.assertIn('id="phaseCanvas"', html)

    def test_runtime_preserves_noncanonical_evidence_labels(self) -> None:
        app = (WEB / "app.js").read_text(encoding="utf-8")
        self.assertIn('mode: "preview_not_truth_engine"', app)
        self.assertIn('evidence_class: "PREVIEW_SNAPSHOT_NOT_DETERMINISTIC_EVIDENCE"', app)
        self.assertIn("Web Audio scheduling and browser DSP are not the deterministic Rust truth engine.", app)
        self.assertNotIn("eval(", app)
        self.assertNotIn("new Function", app)

    def test_example_session_is_parseable_and_preview_only(self) -> None:
        payload = json.loads(
            (WEB / "examples" / "preview-session.example.json").read_text(encoding="utf-8")
        )
        self.assertEqual("nullforge_preview_session", payload["document_type"])
        self.assertEqual("preview_not_truth_engine", payload["mode"])
        self.assertIsInstance(payload.get("limitations"), list)
        self.assertTrue(payload["limitations"])

    def test_session_contract_uses_integer_sample_addresses(self) -> None:
        contract = (WEB / "session-contract.js").read_text(encoding="utf-8")
        self.assertIn("sampleRate", contract)
        self.assertIn("sample", contract)
        self.assertIn("automation_tracks", contract)


if __name__ == "__main__":
    unittest.main()
