import hashlib
import json
from pathlib import Path

TTC_CACHE_DIR = Path("ttc_cache")
TTC_CACHE_DIR.mkdir(exist_ok=True)


# =========================
# FILE HASH
# =========================

def file_hash(path: Path) -> str:
    h = hashlib.md5()

    with open(path, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)

    return h.hexdigest()


# =========================
# CACHE PATH
# =========================

def cache_path(hash_id: str) -> Path:
    return TTC_CACHE_DIR / f"{hash_id}.json"


# =========================
# LOAD CACHE
# =========================

def load_ttc_cache(hash_id: str):

    p = cache_path(hash_id)

    if p.exists():
        with open(p, "r") as f:
            print("✅ TTC CACHE HIT")
            return json.load(f)

    print("❌ TTC CACHE MISS")
    return None


# =========================
# SAVE CACHE
# =========================

def save_ttc_cache(hash_id: str, data):

    p = cache_path(hash_id)

    with open(p, "w") as f:
        json.dump(data, f)

    print("💾 TTC CACHE SAVED:", p.name)
