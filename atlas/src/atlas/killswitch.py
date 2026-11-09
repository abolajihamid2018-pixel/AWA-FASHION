"""Independent kill switch.

It is a plain file, so it works without Python, SQLite or the dashboard
running. The future MQL5 EA will check the same file (configured to the MT5
Common\\Files folder) on every tick/timer and refuse to trade while it exists.

Fail-safe rules:
* if the flag file exists but cannot be read/parsed -> treated as ENGAGED;
* automatic triggers can only ENGAGE; release is manual and needs confirmation.
"""
from __future__ import annotations

import json
import os
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

FLAG_NAME = "ATLAS_KILL"
RELEASE_CONFIRMATION = "RELEASE"


@dataclass(frozen=True)
class KillState:
    engaged: bool
    reason: str = ""
    by: str = ""
    at: Optional[str] = None


class KillSwitch:
    def __init__(self, directory: Path | str) -> None:
        self.dir = Path(directory)
        self.flag = self.dir / FLAG_NAME

    def status(self) -> KillState:
        if not self.flag.exists():
            return KillState(False)
        try:
            data = json.loads(self.flag.read_text(encoding="utf-8"))
            return KillState(True, str(data.get("reason", "")), str(data.get("by", "")), data.get("at"))
        except Exception:
            return KillState(True, "flag file unreadable (fail-safe: engaged)", "unknown")

    def engage(self, reason: str, by: str = "manual") -> KillState:
        self.dir.mkdir(parents=True, exist_ok=True)
        current = self.status()
        if current.engaged:
            return current  # never overwrite the original reason
        payload = {"reason": reason, "by": by, "at": datetime.now(timezone.utc).isoformat(timespec="seconds")}
        tmp = self.flag.with_suffix(".tmp")
        tmp.write_text(json.dumps(payload), encoding="utf-8")
        os.replace(tmp, self.flag)  # atomic on Windows and POSIX
        return self.status()

    def release(self, confirmation: str) -> KillState:
        if confirmation != RELEASE_CONFIRMATION:
            raise PermissionError(f"Release requires the exact confirmation text '{RELEASE_CONFIRMATION}'.")
        if self.flag.exists():
            self.flag.unlink()
        return self.status()
