import pytest

from atlas.settings import ConfigError, load_settings


def test_base_config_is_safe_default(write_cfg):
    s = load_settings(write_cfg())
    assert s.environment == "mock" and s.data_source == "mock"
    assert s.live_trading_enabled is False
    assert (s.risk.risk_per_trade_pct, s.risk.max_daily_loss_pct, s.risk.max_drawdown_pct) == (0.25, 2.0, 10.0)
    assert s.instruments == ["EURUSD", "GBPUSD"] and s.timeframes == ["H4", "D1"]
    assert set(s.cost_assumptions_in_use) == {"EURUSD", "GBPUSD"}


@pytest.mark.parametrize("env", ["live", "LIVE", "real", "production"])
def test_live_environment_rejected(write_cfg, env):
    with pytest.raises(ConfigError, match="Live trading is not available"):
        load_settings(write_cfg({"environment": env}))


@pytest.mark.parametrize("val", [True, "true", 1])
def test_live_flag_cannot_be_enabled(write_cfg, val):
    with pytest.raises(ConfigError):
        load_settings(write_cfg({"live_trading_enabled": val}))


@pytest.mark.parametrize("key", ["password", "mt5_password", "api_key", "token", "Secret"])
def test_credentials_rejected_anywhere(write_cfg, base_cfg, key):
    cfg = dict(base_cfg)
    cfg["mt5"] = {**cfg["mt5"], key: "hunter2"}
    with pytest.raises(ConfigError, match="credential"):
        load_settings(write_cfg(raw=cfg))


def test_risk_ceiling_catches_typo(write_cfg, base_cfg):
    with pytest.raises(ConfigError):
        load_settings(write_cfg({"risk": {**base_cfg["risk"], "risk_per_trade_pct": 25}}))


def test_unknown_keys_rejected(write_cfg):
    with pytest.raises(ConfigError):
        load_settings(write_cfg({"enable_live": True}))


def test_mock_and_demo_never_mix(write_cfg):
    with pytest.raises(ConfigError):
        load_settings(write_cfg({"environment": "demo", "data_source": "mock"}))
    with pytest.raises(ConfigError):
        load_settings(write_cfg({"environment": "mock", "data_source": "mt5"}))


def test_every_instrument_needs_costs(write_cfg):
    with pytest.raises(ConfigError, match="No cost assumptions"):
        load_settings(write_cfg({"instruments": ["EURUSD", "XAUUSD"]}))
