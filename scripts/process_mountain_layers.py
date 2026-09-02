#!/usr/bin/env python3
"""
Processes generated mountain artwork into multi-layered transparent 2.5D assets for parallax rendering.
"""

import os
import numpy as np
from PIL import Image, ImageFilter

BRAIN_DIR = "/home/kkingstoun/.gemini/antigravity-ide/brain/06fae17a-5de0-4f19-a175-cd8b7c5b8a0c"
OUTPUT_DIR = "/home/kkingstoun/git/mzelent.pl/public/assets/images/mountains"

os.makedirs(OUTPUT_DIR, exist_ok=True)

def process_sky():
    src = os.path.join(BRAIN_DIR, "mountain_sky_background_1788344776246.jpg")
    img = Image.open(src).convert("RGB")
    out_path = os.path.join(OUTPUT_DIR, "sky-bg.webp")
    img.save(out_path, "WEBP", quality=88)
    print(f"Saved {out_path} ({os.path.getsize(out_path) / 1024:.1f} KiB)")

def process_foreground():
    src = os.path.join(BRAIN_DIR, "mountain_foreground_ridge_1788344700214.jpg")
    img = Image.open(src).convert("RGBA")
    arr = np.array(img)
    
    # Calculate luminance/intensity
    # Pure black at top has intensity < 15
    rgb = arr[:, :, :3]
    intensity = np.max(rgb, axis=2)
    
    # Create smooth alpha mask: 0 for black background, 255 for rock details
    # Smooth step between intensity 12 and 35
    alpha = np.clip((intensity.astype(float) - 10.0) / 25.0, 0.0, 1.0)
    
    # Clean upper area (top 35% is strictly black sky)
    h = arr.shape[0]
    top_rows = int(h * 0.30)
    alpha[:top_rows, :] = 0.0
    
    arr[:, :, 3] = (alpha * 255).astype(np.uint8)
    
    res = Image.fromarray(arr, "RGBA")
    out_path = os.path.join(OUTPUT_DIR, "foreground-ridge.webp")
    res.save(out_path, "WEBP", quality=90, lossless=False)
    print(f"Saved {out_path} ({os.path.getsize(out_path) / 1024:.1f} KiB)")

def process_midground():
    src = os.path.join(BRAIN_DIR, "mountain_midground_peaks_1788344760786.jpg")
    img = Image.open(src).convert("RGBA")
    arr = np.array(img)
    
    rgb = arr[:, :, :3]
    intensity = np.max(rgb, axis=2)
    
    # Smooth step between intensity 12 and 30
    alpha = np.clip((intensity.astype(float) - 8.0) / 22.0, 0.0, 1.0)
    
    # Bottom area (bottom 25%) smoothly fades to black/transparent so foreground can sit over it
    h = arr.shape[0]
    bottom_start = int(h * 0.70)
    for y in range(bottom_start, h):
        factor = 1.0 - (y - bottom_start) / (h - bottom_start)
        alpha[y, :] *= factor
        
    arr[:, :, 3] = (alpha * 255).astype(np.uint8)
    
    res = Image.fromarray(arr, "RGBA")
    out_path = os.path.join(OUTPUT_DIR, "midground-peaks.webp")
    res.save(out_path, "WEBP", quality=90, lossless=False)
    print(f"Saved {out_path} ({os.path.getsize(out_path) / 1024:.1f} KiB)")

def process_mist():
    src = os.path.join(BRAIN_DIR, "mountain_mist_clouds_1788344793637.jpg")
    img = Image.open(src).convert("RGB")
    arr = np.array(img)
    
    # Mist is white on black: intensity directly drives alpha
    gray = arr[:, :, 0].astype(float) * 0.299 + arr[:, :, 1].astype(float) * 0.587 + arr[:, :, 2].astype(float) * 0.114
    
    # Smooth threshold
    alpha = np.clip((gray - 15.0) / 180.0, 0.0, 0.85)
    
    out_arr = np.zeros((arr.shape[0], arr.shape[1], 4), dtype=np.uint8)
    out_arr[:, :, 0] = 240
    out_arr[:, :, 1] = 245
    out_arr[:, :, 2] = 255
    out_arr[:, :, 3] = (alpha * 255).astype(np.uint8)
    
    res = Image.fromarray(out_arr, "RGBA")
    out_path = os.path.join(OUTPUT_DIR, "mist-clouds.webp")
    res.save(out_path, "WEBP", quality=85, lossless=False)
    print(f"Saved {out_path} ({os.path.getsize(out_path) / 1024:.1f} KiB)")

if __name__ == "__main__":
    process_sky()
    process_foreground()
    process_midground()
    process_mist()
    print("All mountain layer assets successfully processed!")
