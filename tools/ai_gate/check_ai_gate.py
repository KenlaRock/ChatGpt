#!/usr/bin/env python3
"""NullForge AI Gate v0.2.1 PATCH-2.

Uses repository policy from a trusted base branch in CI. The validator never executes
commands from the session proof.
"""
from __future__ import annotations

import argparse
import fnmatch
import hashlib
import json
import re
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path, PurePosixPath

from jsonschema import Draft202012Validator, FormatChecker

REPORT_HEADINGS = [
    "Project purpose", "Current task", "Mandatory files read",
    "What absolutely must not be changed", "Latest stable / green version",
    "Approved scope", "Risk class", "Required tests", "Rollback plan",
]
PLACEHOLDER_RE = re.compile(
    r"<!--|\bTODO\b|\bTBD\b|replace(?:-me| this| with)|(?<![A-Za-z0-9])0{7}(?![A-Za-z0-9])",
    re.I,
)
MAX_FUTURE_CLOCK_SKEW = timedelta(minutes=5)
MAX_PROOF_AGE = timedelta(days=30)


def fail(message: str) -> None:
    print(f"AI_GATE_FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def run(cmd: list[str]) -> str:
    p = subprocess.run(cmd, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    if p.returncode != 0:
        print(p.stderr, file=sys.stderr)
        fail("Command failed: " + " ".join(cmd))
    return p.stdout.strip()


def load_json(path: Path, label: str) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        fail(f"Invalid {label}: {exc}")


def clean_repo_path(value: str) -> str:
    if not isinstance(value, str) or not value or "\\" in value or "\x00" in value:
        fail(f"Unsafe repository path: {value!r}")
    p = PurePosixPath(value)
    if p.is_absolute() or any(part in ("", ".", "..") for part in p.parts):
        fail(f"Unsafe repository path: {value}")
    return p.as_posix()


def sha256_bytes(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    if path.is_symlink():
        fail(f"Symlink is not accepted for gate evidence: {path}")
    return sha256_bytes(path.read_bytes())


def git_blob(ref: str, path: str) -> bytes:
    p = subprocess.run(["git", "show", f"{ref}:{path}"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if p.returncode != 0:
        fail(f"Mandatory file is missing at base commit: {path}")
    return p.stdout


def subtree_match(path: str, pattern: str) -> bool:
    pattern = clean_repo_path(pattern)
    if pattern in {"*", "**", "**/*"}:
        fail(f"Root-wide scope pattern is forbidden: {pattern}")
    if "*" in pattern:
        if not pattern.endswith("/**") or pattern[:-3].find("*") != -1:
            fail(f"Allowed scope supports only exact paths or directory/**: {pattern}")
        prefix = pattern[:-3].rstrip("/")
        return path == prefix or path.startswith(prefix + "/")
    return path == pattern


def policy_match(path: str, pattern: str) -> bool:
    # Python fnmatch treats '/' as an ordinary character, so '*' may cross path
    # separators. This function is intentionally used only for fail-closed policy
    # matches (forbidden/protected/gate paths), where over-matching is safer. It
    # must never be reused to grant allowed scope; allow rules use subtree_match.
    pattern = clean_repo_path(pattern)
    if pattern.endswith("/**"):
        prefix = pattern[:-3].rstrip("/")
        return path == prefix or path.startswith(prefix + "/")
    if "*" in pattern:
        return fnmatch.fnmatchcase(path, pattern)
    return path == pattern


def forbidden_basename(path: str, patterns: list[str]) -> bool:
    return any(fnmatch.fnmatchcase(part.lower(), pat.lower()) for part in PurePosixPath(path).parts for pat in patterns)


def changed_entries(base: str, head: str) -> list[tuple[str, list[str]]]:
    raw = subprocess.run(
        ["git", "diff", "--name-status", "-z", "--find-renames", f"{base}...{head}"],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
    )
    if raw.returncode != 0:
        print(raw.stderr.decode(errors="replace"), file=sys.stderr)
        fail("Unable to read Git diff")
    fields = raw.stdout.decode("utf-8", errors="strict").split("\0")
    if fields and fields[-1] == "": fields.pop()
    out=[]; i=0
    while i < len(fields):
        status=fields[i]; i+=1
        if status.startswith(("R","C")):
            if i+1 >= len(fields): fail("Malformed rename/copy diff")
            paths=[clean_repo_path(fields[i]), clean_repo_path(fields[i+1])]; i+=2
        else:
            if i >= len(fields): fail("Malformed diff")
            paths=[clean_repo_path(fields[i])]; i+=1
        out.append((status, paths))
    return out


def report_sections(text: str) -> dict[str,str]:
    matches=list(re.finditer(r"(?m)^## ([^\n]+)\s*$", text))
    sections={}
    for idx,m in enumerate(matches):
        end=matches[idx+1].start() if idx+1 < len(matches) else len(text)
        sections[m.group(1).strip()]=text[m.end():end].strip()
    return sections


def substantive_state_change(base: str, head: str, path: str) -> bool:
    p=subprocess.run(["git","diff","--unified=0",base+"..."+head,"--",path],text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if p.returncode != 0: return False
    added=[]
    for line in p.stdout.splitlines():
        if line.startswith("+") and not line.startswith("+++"):
            value=line[1:].strip()
            if value and not value.startswith("<!--"):
                added.append(value)
    return bool(added)


def main() -> None:
    ap=argparse.ArgumentParser()
    ap.add_argument("--phase",choices=["preflight","final"],required=True)
    ap.add_argument("--proof",required=True); ap.add_argument("--control-report",required=True)
    ap.add_argument("--schema",required=True); ap.add_argument("--config",required=True)
    ap.add_argument("--base",required=True); ap.add_argument("--head",default="HEAD")
    ap.add_argument("--branch",required=True); ap.add_argument("--test-evidence")
    a=ap.parse_args()

    proof_path=Path(a.proof); report_path=Path(a.control_report)
    for p,label in [(proof_path,"session proof"),(report_path,"control report"),(Path(a.schema),"schema"),(Path(a.config),"config")]:
        if not p.exists(): fail(f"Missing {label}: {p}")
        if p.is_symlink(): fail(f"Symlink not allowed for {label}: {p}")

    proof=load_json(proof_path,"session proof"); schema=load_json(Path(a.schema),"schema"); config=load_json(Path(a.config),"config")
    errors=sorted(Draft202012Validator(schema,format_checker=FormatChecker()).iter_errors(proof),key=lambda e:list(e.path))
    if errors:
        for e in errors: print("SCHEMA_ERROR at "+("/".join(map(str,e.path)) or "<root>")+": "+e.message,file=sys.stderr)
        fail("Invalid session proof schema")

    merge_base=run(["git","merge-base",a.base,a.head])
    head_commit=run(["git","rev-parse",a.head])
    if proof["base_commit"] != merge_base: fail("base_commit does not equal the actual merge-base")
    if proof["branch"] != a.branch: fail("Proof branch does not match the PR head branch")
    if merge_base not in proof["latest_green_version"]:
        fail("latest_green_version must reference the actual merge-base")

    mandatory=[clean_repo_path(x) for x in config["mandatory_read_files"]]
    if proof["mandatory_files"] != mandatory: fail("mandatory_files must exactly match configured order and contents")
    hashes={clean_repo_path(k):v for k,v in proof["mandatory_file_hashes"].items()}
    if set(hashes) != set(mandatory): fail("mandatory_file_hashes must contain every mandatory file and no extras")
    immutable=set(config["immutable_context_files"])
    gate_files=config["gate_files"]
    allow_gate_change = proof["risk_class"] == "R4_GOVERNANCE_OR_DEPLOY" and proof["gate_change"]
    approved_context_changes={clean_repo_path(x) for x in proof["approved_context_changes"]}
    if approved_context_changes and not allow_gate_change:
        fail("approved_context_changes requires R4_GOVERNANCE_OR_DEPLOY + gate_change")
    if not approved_context_changes.issubset(immutable):
        fail("approved_context_changes may contain only configured immutable context files")
    for path in mandatory:
        base_hash=sha256_bytes(git_blob(merge_base,path))
        if hashes[path] != base_hash: fail(f"Proof hash is not the base-commit hash: {path}")
        if path in immutable and path not in approved_context_changes:
            current=Path(path)
            if not current.exists(): fail(f"Immutable context file missing in checkout: {path}")
            if sha256_file(current) != base_hash: fail(f"Immutable context file changed after gate opened: {path}")

    # Distributed CI clocks may differ slightly. Permit bounded skew, not arbitrary future proofs.
    created=datetime.fromisoformat(proof["created_at"].replace("Z","+00:00"))
    now=datetime.now(timezone.utc)
    if created.tzinfo is None: fail("created_at must include timezone")
    if created - now > MAX_FUTURE_CLOCK_SKEW:
        fail("created_at is more than 5 minutes in the future")
    if now - created > MAX_PROOF_AGE:
        fail("session proof is older than 30 days")

    report=report_path.read_text(encoding="utf-8")
    sections=report_sections(report)
    minimum=int(config.get("minimum_report_section_chars",40))
    for heading in REPORT_HEADINGS:
        body=sections.get(heading,"")
        if len(body) < minimum: fail(f"Control report section is missing or too short: {heading}")
        if PLACEHOLDER_RE.search(body): fail(f"Control report contains placeholder text: {heading}")
    for token in (proof["task_id"],proof["branch"],proof["base_commit"]):
        if token not in report: fail(f"Control report does not contain proof identity token: {token}")

    allowed=[clean_repo_path(x) for x in proof["allowed_paths"]]
    additional_forbidden=[clean_repo_path(x) for x in proof["additional_forbidden_paths"]]
    for pattern in allowed:
        # Force validation even when a PR only changes state files.
        subtree_match("__scope_validation_probe__", pattern)
    for pattern in additional_forbidden:
        policy_match("__scope_validation_probe__", pattern)
    always=set(config["always_allowed_task_artifacts"]); state=set(config["state_files"])
    protected=config["protected_paths"]
    global_forbidden=config["forbidden_paths"]; forbidden_names=config["forbidden_basenames"]
    entries=changed_entries(a.base,a.head)
    if not entries: fail("No changed files detected")
    changed_paths=[]
    for status,paths in entries:
        for path in paths:
            changed_paths.append(path)
            if forbidden_basename(path,forbidden_names): fail(f"Secret-like path is globally forbidden: {path}")
            if any(policy_match(path,p) for p in global_forbidden+additional_forbidden): fail(f"Forbidden path changed: {path}")
            if path in always or path in state: continue
            if not any(subtree_match(path,p) for p in allowed): fail(f"Changed outside declared scope: {path}")
            is_gate=any(policy_match(path,p) for p in gate_files)
            if is_gate and not (proof["risk_class"]=="R4_GOVERNANCE_OR_DEPLOY" and proof["gate_change"]):
                fail(f"Gate file changed without R4 + gate_change: {path}")
            is_protected=any(policy_match(path,p) for p in protected)
            if is_protected and proof["risk_class"] != "R4_GOVERNANCE_OR_DEPLOY":
                fail(f"Protected path changed without R4: {path}")

    changed_path_set=set(changed_paths)
    missing_approved=approved_context_changes-changed_path_set
    if missing_approved:
        fail("approved_context_changes lists unchanged paths: " + ", ".join(sorted(missing_approved)))
    for path in state:
        if path not in changed_paths: fail(f"Required state file not updated: {path}")
        if not substantive_state_change(a.base,a.head,path): fail(f"State update is not substantive: {path}")

    expected_tests=config["test_profiles"][proof["risk_class"]]
    if proof["required_test_ids"] != expected_tests: fail("required_test_ids must exactly match configured risk profile")

    if a.phase == "final":
        if not a.test_evidence: fail("Final phase requires test evidence")
        evidence=load_json(Path(a.test_evidence),"test evidence")
        if evidence.get("base_commit") != merge_base or evidence.get("head_commit") != head_commit:
            fail("Test evidence commit identity mismatch")
        if evidence.get("risk_class") != proof["risk_class"] or evidence.get("test_ids") != expected_tests:
            fail("Test evidence profile mismatch")
        if evidence.get("working_tree_changed_by_tests") is not False:
            fail("Tests changed the candidate working tree")
        results=evidence.get("results")
        if not isinstance(results,list) or [r.get("id") for r in results] != expected_tests:
            fail("Test evidence result set mismatch")
        for result in results:
            if result.get("returncode") != 0 or result.get("skipped"):
                fail(f"Required test did not pass: {result.get('id')}")

    print(f"AI_GATE_PASS: {a.phase} validation succeeded for {proof['task_id']} at {head_commit[:12]}.")

if __name__ == "__main__": main()
