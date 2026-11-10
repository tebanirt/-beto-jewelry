#!/bin/bash
cd "${BETO_WORK_DIR:-/tmp/beto-video}"
# review.sh NAME fps cols -> trials/NAME_review.jpg + stats
f=trials/$1.mp4
ffprobe -v error -show_entries format=duration:stream=codec_type,nb_frames -of compact $f | tr '\n' ' '; echo
ffmpeg -hide_banner -i $f -af ebur128=framelog=quiet -f null /dev/null 2>&1 | grep -E "^\s+I:" | head -1
ffmpeg -v error -y -i $f -vf "fps=$2,scale=160:284,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='%{pts\:hms}':x=2:y=270:fontsize=10:fontcolor=red:box=1:boxcolor=white@0.7,tile=$3x6" -frames:v 1 trials/$1_review.jpg
