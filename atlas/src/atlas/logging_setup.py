"""Logging with a redaction filter so secrets never reach log files."""
from __future__ import annotations

import logging
import logging.handlers
import re
from pathlib import Path
from typing import Optional

_PATTERN = re.compile(
    r"(?i)\b(password|passwd|pwd|secret|token|api[_-]?key|credential)s?\b(\s*[=:]\s*|\s+)(['\"]?)([^\s'\",;}]+)"
)


def redact(text: str) -> str:
    return _PATTERN.sub(lambda m: f"{m.group(1)}{m.group(2)}{m.group(3)}***REDACTED***", text)


class RedactingFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        try:
            message = record.getMessage()
        except Exception:  # malformed args: still never leak them
            message = str(record.msg)
        record.msg = redact(message)
        record.args = ()
        return True


def setup_logging(log_dir: Optional[Path] = None, level: int = logging.INFO) -> logging.Logger:
    logger = logging.getLogger("atlas")
    if getattr(logger, "_atlas_configured", False):
        return logger
    logger.setLevel(level)
    fmt = logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s")
    handlers: list[logging.Handler] = [logging.StreamHandler()]
    if log_dir is not None:
        Path(log_dir).mkdir(parents=True, exist_ok=True)
        handlers.append(
            logging.handlers.RotatingFileHandler(
                Path(log_dir) / "atlas.log", maxBytes=2_000_000, backupCount=3, encoding="utf-8"
            )
        )
    for h in handlers:
        h.setFormatter(fmt)
        h.addFilter(RedactingFilter())
        logger.addHandler(h)
    logger._atlas_configured = True  # type: ignore[attr-defined]
    return logger
