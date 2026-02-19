"""
Patient history service – sequential PATIENT_XXXXXX IDs, JSON-file storage.
Thread-safe via filelock-style atomicity (single-process FastAPI is fine).
"""

import json
from pathlib import Path
from threading import Lock

_HISTORY_DIR = Path(__file__).resolve().parent.parent / "data" / "history"
_COUNTER_FILE = _HISTORY_DIR / "_counter.json"
_lock = Lock()


def _ensure_dir():
    _HISTORY_DIR.mkdir(parents=True, exist_ok=True)


def _read_counter() -> int:
    _ensure_dir()
    if _COUNTER_FILE.exists():
        data = json.loads(_COUNTER_FILE.read_text())
        return data.get("next", 1)
    return 1


def _write_counter(n: int):
    _ensure_dir()
    _COUNTER_FILE.write_text(json.dumps({"next": n}))


def next_patient_id() -> str:
    """Return the next PATIENT_XXXXXX id (6-digit zero-padded hex) and bump the counter."""
    with _lock:
        n = _read_counter()
        pid = f"PATIENT_{n:06d}"
        _write_counter(n + 1)
    return pid


def save_report(patient_id: str, report: dict):
    """Persist a full analysis report under its patient_id."""
    _ensure_dir()
    path = _HISTORY_DIR / f"{patient_id}.json"
    path.write_text(json.dumps(report, indent=2, default=str))


def get_report(patient_id: str) -> dict | None:
    """Load a single patient report, or None."""
    path = _HISTORY_DIR / f"{patient_id}.json"
    if not path.exists():
        return None
    return json.loads(path.read_text())


def list_reports() -> list[dict]:
    """Return metadata for all stored reports, newest first."""
    _ensure_dir()
    reports = []
    for f in sorted(_HISTORY_DIR.glob("PATIENT_*.json"), reverse=True):
        try:
            data = json.loads(f.read_text())
            drugs = []
            if "results" in data:
                drugs = [r.get("drug", "") for r in data["results"]]
            elif "drug" in data:
                drugs = [data["drug"]]
            reports.append({
                "patient_id": data.get("patient_id", f.stem),
                "timestamp": data.get("timestamp", ""),
                "drugs": drugs,
                "risk_labels": _extract_risk_labels(data),
            })
        except (json.JSONDecodeError, KeyError):
            continue
    return reports


def delete_report(patient_id: str) -> bool:
    path = _HISTORY_DIR / f"{patient_id}.json"
    if path.exists():
        path.unlink()
        return True
    return False


def _extract_risk_labels(data: dict) -> list[str]:
    if "results" in data:
        return [r.get("risk_assessment", {}).get("risk_label", "Unknown") for r in data["results"]]
    ra = data.get("risk_assessment", {})
    return [ra.get("risk_label", "Unknown")] if ra else []
