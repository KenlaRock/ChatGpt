from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

TEXT_SUFFIXES = {
    ".md",
    ".txt",
    ".json",
    ".jsonl",
    ".yaml",
    ".yml",
    ".toml",
    ".py",
    ".rs",
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".html",
    ".css",
    ".sh",
}

SKIP_DIRS = {
    ".git",
    ".venv",
    "node_modules",
    "target",
    "dist",
    "build",
    "__pycache__",
}

# The public repository may describe the existence of internal workspaces, but it
# must not publish direct URLs or provider identifiers that grant a breadcrumb
# trail into those workspaces.
FORBIDDEN_PATTERNS = {
    "google_drive_url": re.compile(r"https?://(?:drive|docs)\.google\.com/", re.IGNORECASE),
    "notion_url": re.compile(r"https?://(?:www\.)?(?:notion\.so|[^/]+\.notion\.site)/", re.IGNORECASE),
    "notion_app_url": re.compile(r"https?://app\.notion\.com/", re.IGNORECASE),
    "google_workspace_id_uri": re.compile(r"(?:gdrive|googledrive)://", re.IGNORECASE),
    "private_file_marker": re.compile(r"private-user-images\.githubusercontent\.com/", re.IGNORECASE),
}

# Common secret forms. These are intentionally conservative and should be
# expanded as the project integrates more services.
SECRET_PATTERNS = {
    "github_token": re.compile(r"\bgh[pousr]_[A-Za-z0-9_]{20,}\b"),
    "generic_bearer": re.compile(r"(?i)authorization\s*:\s*bearer\s+[A-Za-z0-9._~+/=-]{16,}"),
    "private_key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "webhook_secret_url": re.compile(r"https?://[^\s]+/(?:hooks?|webhooks?)/[A-Za-z0-9_-]{12,}", re.IGNORECASE),
}


def iter_text_files() -> list[Path]:
    files: list[Path] = []
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        if any(part in SKIP_DIRS for part in path.relative_to(ROOT).parts):
            continue
        if path.suffix.lower() in TEXT_SUFFIXES or path.name in {"LICENSE", "Dockerfile", "Makefile"}:
            files.append(path)
    return sorted(files)


def scan_file(path: Path) -> list[str]:
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return []

    findings: list[str] = []
    for name, pattern in {**FORBIDDEN_PATTERNS, **SECRET_PATTERNS}.items():
        for match in pattern.finditer(text):
            line_number = text.count("\n", 0, match.start()) + 1
            excerpt = match.group(0)
            if len(excerpt) > 120:
                excerpt = excerpt[:117] + "..."
            findings.append(f"{path.relative_to(ROOT)}:{line_number}: {name}: {excerpt}")
    return findings


def main() -> int:
    findings: list[str] = []
    for path in iter_text_files():
        findings.extend(scan_file(path))

    if findings:
        print("Public-boundary check FAILED.\n", file=sys.stderr)
        for finding in findings:
            print(f"- {finding}", file=sys.stderr)
        print(
            "\nRemove the private reference or replace it with sanitized public context. "
            "Do not add an allow-list merely to silence a real leak.",
            file=sys.stderr,
        )
        return 1

    print("Public-boundary check passed: no internal workspace URLs or common secrets found.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
