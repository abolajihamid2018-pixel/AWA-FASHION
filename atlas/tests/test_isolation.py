"""ATLAS must stay isolated from the AWA Fashion website and never be deployed."""
import json
from pathlib import Path

ATLAS = Path(__file__).resolve().parents[1]
REPO = ATLAS.parent


def test_vercel_builds_only_the_website():
    vercel = REPO / "vercel.json"
    if not vercel.exists():
        return  # ATLAS moved to its own repository
    cfg = json.loads(vercel.read_text(encoding="utf-8"))
    assert [b["src"] for b in cfg.get("builds", [])] == ["index.html"]
    assert "atlas" not in vercel.read_text(encoding="utf-8").lower()


def test_local_artefacts_are_git_ignored():
    ignore = (ATLAS / ".gitignore").read_text(encoding="utf-8")
    for entry in ("db/", "data/", "logs/", "runtime/", "*.db", ".env", "config/live.yaml"):
        assert entry in ignore


def test_dashboard_binds_localhost_only():
    toml = (ATLAS / "dashboard" / ".streamlit" / "config.toml").read_text(encoding="utf-8")
    assert 'address = "127.0.0.1"' in toml
