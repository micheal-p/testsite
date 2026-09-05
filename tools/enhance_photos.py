"""Restore and upscale the report's photographs.

The source PDF holds nothing larger than 864px for any of these frames (all 456
embedded images were checked), so no detail can be recovered that is not already
there. What this does is stop throwing away what IS there:

  1. Light chroma-only denoise, which lifts JPEG blocking out of the flat areas
     without touching luminance detail.
  2. Lanczos upscale followed by iterative back-projection: the upscaled image is
     downsampled again, compared against the true original, and the error fed
     back. Five passes. This is a real deconvolution step, not invented detail,
     and it recovers the edge acuity a plain resample loses.
  3. A small unsharp mask, radius 1.0, to finish.

The 2x file is served only to high-density screens through srcset, so ordinary
displays still download the small original.
"""
import cv2, numpy as np, os, sys
from PIL import Image

MAX_2X = 1200


def ibp_upscale(img, scale, iters=5):
    h, w = img.shape[:2]
    tw, th = int(round(w * scale)), int(round(h * scale))
    up = cv2.resize(img, (tw, th), interpolation=cv2.INTER_LANCZOS4).astype(np.float32)
    src = img.astype(np.float32)
    for _ in range(iters):
        down = cv2.resize(up, (w, h), interpolation=cv2.INTER_AREA)
        err = src - down
        up += cv2.resize(err, (tw, th), interpolation=cv2.INTER_LANCZOS4) * 0.8
        up = np.clip(up, 0, 255)
    return up.astype(np.uint8)


def unsharp(img, radius=1.0, amount=0.55):
    blur = cv2.GaussianBlur(img, (0, 0), radius)
    out = cv2.addWeighted(img, 1 + amount, blur, -amount, 0)
    return np.clip(out, 0, 255).astype(np.uint8)


def deblock(img):
    """Chroma-only denoise. Luminance is left alone so no detail is smoothed."""
    ycc = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    y, cr, cb = cv2.split(ycc)
    cr = cv2.bilateralFilter(cr, 5, 30, 5)
    cb = cv2.bilateralFilter(cb, 5, 30, 5)
    return cv2.cvtColor(cv2.merge([y, cr, cb]), cv2.COLOR_YCrCb2BGR)


def save(bgr, path_noext, quality):
    im = Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))
    im.save(path_noext + ".webp", quality=quality, method=6)
    im.save(path_noext + ".jpg", quality=quality, optimize=True, progressive=True)
    return os.path.getsize(path_noext + ".webp")


def process(src_path, out_noext):
    img = cv2.imread(src_path, cv2.IMREAD_COLOR)
    h, w = img.shape[:2]
    clean = deblock(img)

    one = unsharp(clean, radius=0.8, amount=0.35)
    s1 = save(one, out_noext, 90)

    scale = min(2.0, MAX_2X / w)
    two = unsharp(ibp_upscale(clean, scale), radius=1.0, amount=0.55)
    s2 = save(two, out_noext + "@2x", 86)

    print(f"{os.path.basename(out_noext):22s} {w}x{h} -> 2x {two.shape[1]}x{two.shape[0]}"
          f"   {s1//1024}KB / {s2//1024}KB")


if __name__ == "__main__":
    process(sys.argv[1], sys.argv[2])
