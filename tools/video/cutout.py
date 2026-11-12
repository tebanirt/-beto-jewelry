"""cutout — background removal for Rayane's ring photos (BiRefNet via rembg, local model), then a brand background.
Usage: python cutout.py <in.jpg> <out_prefix> [model]   -> <prefix>_alpha.png (RGBA cut-out)
Models: $BETO_WORK_DIR/models (see README: rembg GitHub releases, BiRefNet lite saved as birefnet-general-lite.onnx)."""
import os, sys
from PIL import Image, ImageOps
os.environ.setdefault("U2NET_HOME", os.environ.get("BETO_MODELS_DIR", os.path.join(os.environ.get("BETO_WORK_DIR", "/tmp/beto-video"), "models")))
from rembg import new_session, remove

MODELS = {"birefnet": "birefnet-general-lite", "isnet": "isnet-general-use"}


def cut(src, out, model="birefnet"):
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    sess = new_session(MODELS[model])
    rgba = remove(im, session=sess, post_process_mask=True)
    rgba.save(out)
    return out


if __name__ == "__main__":
    cut(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "birefnet")
