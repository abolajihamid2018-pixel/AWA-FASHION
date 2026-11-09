"""Read-only environment inspection. Installs nothing, changes nothing."""
from __future__ import annotations

import importlib
import os
import platform
import shutil
import struct
import sys
from pathlib import Path

PACKAGES = ["numpy", "pandas", "pydantic", "yaml", "streamlit", "pytest", "MetaTrader5", "pyarrow", "keyring"]


def _ram_mb() -> tuple[int | None, int | None]:
    try:
        if sys.platform == "win32":
            import ctypes

            class MEMSTAT(ctypes.Structure):
                _fields_ = [("dwLength", ctypes.c_ulong), ("dwMemoryLoad", ctypes.c_ulong),
                            ("ullTotalPhys", ctypes.c_ulonglong), ("ullAvailPhys", ctypes.c_ulonglong),
                            ("ullTotalPageFile", ctypes.c_ulonglong), ("ullAvailPageFile", ctypes.c_ulonglong),
                            ("ullTotalVirtual", ctypes.c_ulonglong), ("ullAvailVirtual", ctypes.c_ulonglong),
                            ("ullAvailExtendedVirtual", ctypes.c_ulonglong)]
            m = MEMSTAT()
            m.dwLength = ctypes.sizeof(MEMSTAT)
            ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m))  # type: ignore[attr-defined]
            return m.ullTotalPhys // 2**20, m.ullAvailPhys // 2**20
        info = {}
        with open("/proc/meminfo") as fh:
            for line in fh:
                k, v = line.split(":", 1)
                info[k] = int(v.split()[0]) // 1024
        return info.get("MemTotal"), info.get("MemAvailable")
    except Exception:
        return None, None


def _mt5_installs() -> list[str]:
    if sys.platform != "win32":
        return []
    found = []
    for base in filter(None, [os.environ.get("ProgramFiles"), os.environ.get("ProgramFiles(x86)")]):
        for p in Path(base).glob("*/terminal64.exe"):
            found.append(str(p))
    appdata = os.environ.get("APPDATA")
    if appdata and (Path(appdata) / "MetaQuotes" / "Terminal").exists():
        found.append(str(Path(appdata) / "MetaQuotes" / "Terminal") + "  (data folders)")
    return found


def collect() -> dict:
    total, avail = _ram_mb()
    pkgs = {}
    for name in PACKAGES:
        try:
            mod = importlib.import_module(name)
            pkgs[name] = getattr(mod, "__version__", "installed")
        except Exception:
            pkgs[name] = "not installed"
    disk = shutil.disk_usage(Path.cwd())
    return {
        "os": f"{platform.system()} {platform.release()} ({platform.version()})",
        "machine": platform.machine(),
        "python": sys.version.split()[0],
        "python_bits": struct.calcsize("P") * 8,
        "python_exe": sys.executable,
        "cpu_count": os.cpu_count(),
        "ram_total_mb": total,
        "ram_available_mb": avail,
        "disk_free_gb": round(disk.free / 2**30, 1),
        "packages": pkgs,
        "mt5_installs": _mt5_installs(),
    }


def assess(r: dict) -> list[str]:
    notes = []
    py = tuple(int(x) for x in r["python"].split(".")[:2])
    if py < (3, 10):
        notes.append("BLOCKER: Python >= 3.10 required.")
    if r["python_bits"] != 64:
        notes.append("BLOCKER: 64-bit Python required to match MT5 terminal64.")
    if r["ram_total_mb"] and r["ram_total_mb"] < 6000:
        notes.append("LIMITED RAM: run research with the dashboard closed; one MT5 tester agent.")
    if r["disk_free_gb"] < 10:
        notes.append("LOW DISK: < 10 GB free; tick data and logs will need space.")
    if r["os"].startswith("Windows") and not r["mt5_installs"]:
        notes.append("MT5 terminal not found (expected until a broker is chosen).")
    if r["packages"].get("MetaTrader5") == "not installed":
        notes.append("MetaTrader5 package not installed (not needed in mock mode).")
    return notes


def format_report(r: dict) -> str:
    lines = ["ATLAS environment report (read-only)", "=" * 38]
    for k in ("os", "machine", "python", "python_bits", "python_exe", "cpu_count",
              "ram_total_mb", "ram_available_mb", "disk_free_gb"):
        lines.append(f"{k:18}: {r[k]}")
    lines.append("packages:")
    lines += [f"  {k:16}: {v}" for k, v in r["packages"].items()]
    lines.append(f"mt5 installs      : {r['mt5_installs'] or 'none found'}")
    notes = assess(r)
    lines.append("assessment:")
    lines += [f"  - {n}" for n in notes] or ["  - no blockers found"]
    return "\n".join(lines)
