#!/usr/bin/env python3
"""Optimise the Edu Center product screenshots.

Sources are 2880x1800 retina captures in edu-center/screenshots/ (10.8MB of PNG).
They are far too heavy to ship as-is, so each one is emitted at two widths, webp
plus a jpg fallback, matching the picture/srcset pattern the rest of the site uses.

RULE (same as tools/enhance_photos.py): run this on the original PNG, never on an
output of this script.

    python3 tools/build_edu_shots.py
"""
from PIL import Image
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "edu-center" / "screenshots"
OUT = ROOT / "assets" / "images" / "edu"

W1X = 920           # the article column never exceeds this on desktop
W2X = 1840          # retina
Q_WEBP = 82
Q_JPG = 86


def build(path: pathlib.Path) -> tuple[str, int]:
    im = Image.open(path).convert("RGB")
    stem = path.stem
    written = 0
    for width, suffix in ((W1X, ""), (W2X, "@2x")):
        if im.width < width:
            # never upscale a screenshot, it only adds blur
            target = im
        else:
            height = round(im.height * width / im.width)
            target = im.resize((width, height), Image.LANCZOS)
        for ext, kwargs in (
            ("webp", dict(quality=Q_WEBP, method=6)),
            ("jpg", dict(quality=Q_JPG, optimize=True, progressive=True)),
        ):
            dest = OUT / f"{stem}{suffix}.{ext}"
            target.save(dest, **kwargs)
            written += dest.stat().st_size
    return stem, written


def main() -> int:
    if not SRC.is_dir():
        print(f"missing source directory {SRC}", file=sys.stderr)
        return 1
    OUT.mkdir(parents=True, exist_ok=True)
    shots = sorted(SRC.glob("*.png"))
    total = 0
    for shot in shots:
        stem, written = build(shot)
        total += written
        print(f"  {stem:36s} {written // 1024:5d} KB across 4 files")
    print(f"{len(shots)} screenshots -> {OUT.relative_to(ROOT)} ({total // 1024} KB total)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
