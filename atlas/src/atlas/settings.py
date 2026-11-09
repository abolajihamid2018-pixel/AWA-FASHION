"""Validated configuration for ATLAS.

Safety properties enforced here (and covered by tests):
* live trading cannot be enabled from configuration in this build;
* credential-like keys are rejected anywhere in the config tree;
* risk limits have hard ceilings so a typo (25 instead of 0.25) fails loudly;
* every configured instrument must have an explicit cost entry.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Literal, Optional

import yaml
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

ATLAS_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CONFIG = ATLAS_ROOT / "config" / "base.yaml"

_FORBIDDEN_KEY_PARTS = ("password", "passwd", "pwd", "secret", "token", "api_key", "apikey", "credential")


class ConfigError(ValueError):
    """Raised for unsafe or invalid configuration."""


def _reject_credentials(node: Any, path: str = "") -> None:
    if isinstance(node, dict):
        for key, value in node.items():
            k = str(key).lower()
            if any(part in k for part in _FORBIDDEN_KEY_PARTS):
                raise ConfigError(
                    f"Config key '{path}{key}' looks like a credential. "
                    "Credentials must never be stored in ATLAS configuration."
                )
            _reject_credentials(value, f"{path}{key}.")
    elif isinstance(node, list):
        for i, item in enumerate(node):
            _reject_credentials(item, f"{path}[{i}].")


class _Strict(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)


class RiskLimits(_Strict):
    # Ceilings are deliberately low; raising them requires a code change + review.
    risk_per_trade_pct: float = Field(0.25, gt=0, le=1.0)
    max_daily_loss_pct: float = Field(2.0, gt=0, le=5.0)
    max_drawdown_pct: float = Field(10.0, gt=0, le=25.0)


class CostAssumption(_Strict):
    pip_size: float = Field(gt=0)
    spread_pips: float = Field(ge=0)
    commission_per_lot_round_turn: float = Field(ge=0)
    slippage_pips_per_side: float = Field(ge=0)
    swap_long_pips_per_night: float
    swap_short_pips_per_night: float
    is_assumption: bool = True
    note: str = ""


class MagicEntry(_Strict):
    strategy: str
    timeframe: str


class Paths(_Strict):
    db_path: str = "db/atlas.db"
    kill_switch_dir: str = "runtime"
    log_dir: str = "logs"

    def resolve(self, name: str) -> Path:
        p = Path(getattr(self, name))
        return p if p.is_absolute() else ATLAS_ROOT / p


class MT5Settings(_Strict):
    terminal_path: Optional[str] = None
    server_utc_offset_hours: Optional[float] = Field(None, ge=-12, le=14)
    connect_retries: int = Field(3, ge=1, le=10)
    connect_timeout_ms: int = Field(10000, ge=1000, le=120000)


class MockSettings(_Strict):
    seed: int = 42
    days: int = Field(365, ge=30, le=3650)
    starting_balance: float = Field(10000.0, gt=0)


class Settings(_Strict):
    environment: Literal["mock", "demo"]
    data_source: Literal["mock", "mt5"]
    live_trading_enabled: Literal[False] = False
    instruments: list[str] = Field(min_length=1)
    timeframes: list[Literal["M15", "M30", "H1", "H4", "D1", "W1"]] = Field(min_length=1)
    risk: RiskLimits = RiskLimits()
    costs: dict[str, CostAssumption]
    magic_map: dict[int, MagicEntry] = {}
    paths: Paths = Paths()
    mt5: MT5Settings = MT5Settings()
    mock: MockSettings = MockSettings()

    @field_validator("environment", mode="before")
    @classmethod
    def _no_live(cls, v: Any) -> Any:
        if isinstance(v, str) and v.strip().lower() in {"live", "real", "production"}:
            raise ValueError("Live trading is not available in this build. Allowed: mock, demo.")
        return v

    @field_validator("live_trading_enabled", mode="before")
    @classmethod
    def _live_flag(cls, v: Any) -> Any:
        if v is not False:
            raise ValueError("live_trading_enabled must be false in this build.")
        return v

    @model_validator(mode="after")
    def _consistency(self) -> "Settings":
        if self.environment == "mock" and self.data_source != "mock":
            raise ValueError("environment 'mock' requires data_source 'mock'.")
        if self.environment == "demo" and self.data_source != "mt5":
            raise ValueError("environment 'demo' requires data_source 'mt5' (never mix mock data into demo).")
        missing = [s for s in self.instruments if s not in self.costs]
        if missing:
            raise ValueError(f"No cost assumptions configured for: {missing}")
        return self

    @property
    def cost_assumptions_in_use(self) -> list[str]:
        return [s for s, c in self.costs.items() if c.is_assumption]


def load_settings(path: Optional[os.PathLike | str] = None) -> Settings:
    cfg_path = Path(path or os.environ.get("ATLAS_CONFIG") or DEFAULT_CONFIG)
    with open(cfg_path, "r", encoding="utf-8") as fh:
        raw = yaml.safe_load(fh) or {}
    if not isinstance(raw, dict):
        raise ConfigError(f"{cfg_path} must contain a mapping at top level.")
    _reject_credentials(raw)
    try:
        return Settings.model_validate(raw)
    except ValueError as exc:  # pydantic.ValidationError subclasses ValueError
        raise ConfigError(f"Invalid configuration in {cfg_path}:\n{exc}") from exc
