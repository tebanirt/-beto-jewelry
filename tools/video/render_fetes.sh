#!/bin/bash
cd "$(dirname "$0")"
export REEL_FPS=24 REEL_SDR_GRADE="unsharp=5:5:0.3:5:5:0" REEL_CRF=14 REEL_PRESET=slow REEL_MAXRATE=24M REEL_BUFSIZE=48M \
       REEL_X264="aq-mode=3:keyint=48:min-keyint=24"
for n in "$@"; do
  ../venv/bin/python reels_fetes.py "$n" > "qc4/build_$n.log" 2>&1 || { echo "FAIL $n"; continue; }
  ffmpeg -v error -y -i "pro/$n.mp4" -vf "crop=1080:1350:0:200" -c:v libx264 -preset slow -crf 13 -x264-params "aq-mode=3:keyint=48:min-keyint=24" \
    -maxrate 24M -bufsize 48M -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a copy -movflags +faststart "pro/${n}_4x5.mp4" \
    && echo "OK $n $(ffprobe -v error -show_entries format=duration -of csv=p=0 pro/$n.mp4)"
done
echo DONE
