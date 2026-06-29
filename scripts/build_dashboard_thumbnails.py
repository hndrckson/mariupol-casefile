import json
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
TARGETS_PATH = ROOT / "dashboard" / "data" / "targets.json"
THUMB_DIR = ROOT / "dashboard" / "media" / "thumbs"
RAW_PREFIX = "/data/raw/"
RAW_ROOT = ROOT / "data" / "raw"


def raw_path(src):
    if not src or not src.startswith(RAW_PREFIX):
        return None
    return RAW_ROOT / src[len(RAW_PREFIX):].replace("/", "\\")


def thumb_name(src):
    return Path(src).with_suffix(".webp").name


def build_thumb(source, destination):
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image)
        image.thumbnail((420, 320), Image.Resampling.LANCZOS)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGB")
        image.save(destination, "WEBP", quality=54, method=6)


def main():
    payload = json.loads(TARGETS_PATH.read_text(encoding="utf-8"))
    made = 0
    missing = 0
    unreadable = 0
    for target in payload["targets"]:
        for image in target.get("images", []):
            src = image.get("src")
            source = raw_path(src)
            if not source or not source.exists():
                missing += 1
                continue
            relative_thumb = f"media/thumbs/{thumb_name(src)}"
            destination = ROOT / "dashboard" / relative_thumb
            if not destination.exists():
                try:
                    build_thumb(source, destination)
                    made += 1
                except Exception:
                    unreadable += 1
                    continue
            image["thumb"] = relative_thumb
    TARGETS_PATH.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(json.dumps({"created": made, "missing": missing, "unreadable": unreadable, "thumb_dir": str(THUMB_DIR)}, indent=2))


if __name__ == "__main__":
    main()
