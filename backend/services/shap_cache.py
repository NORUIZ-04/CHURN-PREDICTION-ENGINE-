import hashlib
import json
from pathlib import Path

CACHE_DIR = Path("shap_cache")
CACHE_DIR.mkdir(exist_ok=True)


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

def cache_path(hash_id: str, limit: int, top_k: int) -> Path:
    return CACHE_DIR / f"{hash_id}_L{limit}_K{top_k}.json"


# =========================
# LOAD
# =========================

def load_cache(hash_id: str, limit: int, top_k: int):

    p = cache_path(hash_id, limit, top_k)

    if p.exists():
        with open(p, "r") as f:
            print("✅ SHAP CACHE HIT")
            return json.load(f)

    print("❌ SHAP CACHE MISS")
    return None


# =========================
# SAVE
# =========================

def save_cache(hash_id: str, limit: int, top_k: int, data):

    p = cache_path(hash_id, limit, top_k)

    with open(p, "w") as f:
        json.dump(data, f)

    print("💾 SHAP CACHE SAVED:", p.name)
