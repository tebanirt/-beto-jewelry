#!/bin/bash
# Ad masters: crf 14, preset slower, aq-mode 3 (dark backgrounds), closed GOP of 2 s (Meta: closed GOP of 2 to 5 s).
cd "$(dirname "$0")"
export REEL_FPS=24 REEL_SDR_GRADE="unsharp=5:5:0.3:5:5:0" REEL_CRF=14 REEL_PRESET=slower REEL_MAXRATE=24M REEL_BUFSIZE=48M \
       REEL_X264="aq-mode=3:keyint=48:min-keyint=24"
for n in "$@"; do
  ../venv/bin/python reels_multi.py "$n" 2>&1 | grep -E "pace|->|Error|Traceback" || exit 1
done
for f in pro/AD_multi_2bagues pro/AD_benny_15 pro/AD_jobby_15; do
  [ -f "$f.mp4" ] || continue
  ffmpeg -v error -y -i "$f.mp4" -vf "crop=1080:1350:0:200" -c:v libx264 -preset slower -crf 13 -x264-params "aq-mode=3:keyint=48:min-keyint=24" \
    -maxrate 24M -bufsize 48M -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a copy -movflags +faststart "${f}_4x5.mp4" && echo "4x5 $f"
done
echo DONE
