import json
from pathlib import Path
from hashlib import md5

CACHE_DIR = Path("cache/insights")
CACHE_DIR.mkdir(parents=True, exist_ok=True)


def file_hash(path: Path):
    """Create hash from file content for cache invalidation"""
    hasher = md5()
    with open(path, "rb") as f:
        hasher.update(f.read())
    return hasher.hexdigest()


def get_cache_path(key: str):
    return CACHE_DIR / f"{key}.json"


def load_insights_cache(key: str):
    cache_file = get_cache_path(key)

    if cache_file.exists():
        with open(cache_file, "r") as f:
            return json.load(f)

    return None


def save_insights_cache(key: str, data: dict):
    cache_file = get_cache_path(key)

    with open(cache_file, "w") as f:
        json.dump(data, f)