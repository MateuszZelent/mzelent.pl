import os
from PIL import Image, ImageFilter
import numpy as np

os.makedirs("public/assets/images/3d", exist_ok=True)

sources = [
    (
        "/home/kkingstoun/.gemini/antigravity-ide/brain/06fae17a-5de0-4f19-a175-cd8b7c5b8a0c/skyrmion_3d_nvidia_1788384078173.jpg",
        "skyrmion-3d"
    ),
    (
        "/home/kkingstoun/.gemini/antigravity-ide/brain/06fae17a-5de0-4f19-a175-cd8b7c5b8a0c/vortex_3d_nvidia_1788384094886.jpg",
        "vortex-3d"
    ),
    (
        "/home/kkingstoun/.gemini/antigravity-ide/brain/06fae17a-5de0-4f19-a175-cd8b7c5b8a0c/spinwave_lens_3d_nvidia_1788384621810.jpg",
        "spinwaves-3d"
    ),
]

for src_path, out_name in sources:
    img = Image.open(src_path).convert("RGBA")
    arr = np.array(img, dtype=np.float32)

    r, g, b, _ = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    
    # Calculate luminance/brightness
    max_val = np.maximum(np.maximum(r, g), b)
    
    # Create smooth alpha curve:
    # Under threshold 10 -> alpha = 0
    # Between 10 and 60 -> smooth ramp
    # Over 60 -> full opacity (or proportional to glow)
    alpha = np.clip((max_val - 12.0) / 48.0, 0.0, 1.0)
    
    # Smooth quadratic curve for organic falloff
    alpha = alpha ** 1.2 * 255.0

    # Ensure outer border (10px) is 100% transparent
    h, w = alpha.shape
    y, x = np.ogrid[:h, :w]
    
    # Optional soft radial mask so edges never have hard cuts
    dist_from_center = np.sqrt((x - w/2)**2 + (y - h/2)**2)
    max_radius = min(w, h) * 0.48
    edge_fade = np.clip((max_radius - dist_from_center) / 30.0, 0.0, 1.0)
    
    if "spinwaves" in out_name:
        # Linear fade near outer corners for the rectangular crystal ribbon
        dist_x = np.minimum(x, w - x)
        dist_y = np.minimum(y, h - y)
        corner_dist = np.minimum(dist_x, dist_y)
        edge_fade = np.clip(corner_dist / 20.0, 0.0, 1.0)

    final_alpha = (alpha * edge_fade).astype(np.uint8)
    
    # For clean compositing without dark fringing:
    # Un-premultiply slightly where alpha is low
    out_arr = np.zeros_like(arr, dtype=np.uint8)
    out_arr[:, :, 0] = r.astype(np.uint8)
    out_arr[:, :, 1] = g.astype(np.uint8)
    out_arr[:, :, 2] = b.astype(np.uint8)
    out_arr[:, :, 3] = final_alpha

    out_img = Image.fromarray(out_arr, "RGBA")
    
    # Save optimized WebP and PNG
    webp_path = f"public/assets/images/3d/{out_name}.webp"
    png_path = f"public/assets/images/3d/{out_name}.png"
    
    out_img.save(webp_path, "WEBP", quality=92, lossless=False)
    out_img.save(png_path, "PNG", optimize=True)
    print(f"Processed {out_name}: saved {webp_path} ({os.path.getsize(webp_path)} bytes)")

print("All 3D assets prepared successfully!")
