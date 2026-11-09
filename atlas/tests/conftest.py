from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

import pytest
import yaml

ATLAS = Path(__file__).resolve().parents[1]
NOW = datetime(2026, 1, 1, 12, tzinfo=timezone.utc)


@pytest.fixture
def base_cfg() -> dict:
    return yaml.safe_load((ATLAS / "config" / "base.yaml").read_text(encoding="utf-8"))


@pytest.fixture
def write_cfg(tmp_path, base_cfg):
    def _w(overrides: dict | None = None, raw: dict | None = None) -> Path:
        cfg = raw if raw is not None else {**base_cfg, **(overrides or {})}
        cfg.setdefault("paths", {})
        cfg["paths"] = {"db_path": str(tmp_path / "t.db"), "kill_switch_dir": str(tmp_path / "rt"),
                        "log_dir": str(tmp_path / "logs")}
        p = tmp_path / "cfg.yaml"
        p.write_text(yaml.safe_dump(cfg), encoding="utf-8")
        return p
    return _w
