#!/bin/bash
# Derived assets used by the reels (regenerate after downloading the originals into $BETO_FOOTAGE_DIR).
# - igi_blur: IGI laser inscription photo with the last digits blurred (never show a full certificate number)
# - lotuscrop: lotus-basket render with its black bottom strip removed
set -euo pipefail
W=${BETO_WORK_DIR:-/tmp/beto-video}; F=${BETO_FOOTAGE_DIR:-$W/footage}; mkdir -p "$W/assets"
src() { ls "$F"/*"$1" | head -1; }
ffmpeg -v error -y -i "$(src 8cf9e65e-image.jpg)" -filter_complex "[0]split[a][b];[b]crop=230:150:700:660,boxblur=18:3[bl];[a][bl]overlay=700:660" -q:v 2 "$W/assets/igi_blur-image.jpg"
ffmpeg -v error -y -i "$(src 555ac6e3-image.jpg)" -vf "crop=948:1012:0:0" -q:v 2 "$W/assets/lotuscrop-image.jpg"
echo "assets ok"
