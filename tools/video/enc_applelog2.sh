#!/bin/bash
# usage: enc_applelog2.sh IN.mov grade.cube mask.mkv OUT.mp4 [test t1 t2 ...]
# Apple Log 2 turntable clip (4K vertical) -> graded Rec.709 master for the edit engine.
#  1. python applelog2_grade.py grade.cube
#  2. ffmpeg -i IN.mov -vf "scale=540:960:in_range=tv:out_range=pc,format=gbrp16le,lut3d=file=grade.cube,format=gray" \
#       -f rawvideo - | python stone_mask.py 85 | ffmpeg -f rawvideo -pix_fmt gray -s 540x960 -r 24 -i - -c:v ffv1 mask.mkv
#  3. this script (v10, realism first): LUT, diamond kept white inside the tracked stone mask (the band stays 14k gold),
#     subtle 8-bit bloom on the sparkles (a 16-bit blend washes the image out). No denoise (it softened the facets),
#     no 4K sharpening (its halos showed after the downscale): one fine sharpening happens once, at the final 1080 size.
IN=$1; CUBE=$2; MASK=$3; OUT=$4
FG="[0:v]scale=in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int,format=gbrp16le,lut3d=file=$CUBE:interp=tetrahedral,format=gbrp,split=2[o][dz];\
[1:v]scale=2160:3840:flags=bicubic,format=gbrp[m];\
[dz]hue=s=0.15[d];[o][d][m]maskedmerge[st];\
[st]split[a][b];\
[b]scale=540:960,curves=all='0/0 0.82/0 1/1',gblur=sigma=10,scale=2160:3840[g];\
[a][g]blend=all_mode=screen:all_opacity=0.12,scale=out_range=tv:flags=accurate_rnd,format=yuv420p[v]"
if [ "$5" = test ]; then
  shift 5
  for t in "$@"; do ffmpeg -v error -y -ss $t -i "$IN" -ss $t -i "$MASK" -frames:v 1 -filter_complex "$FG" -map "[v]" test_$t.png; done
else
  ffmpeg -v error -y -i "$IN" -i "$MASK" -an -filter_complex "$FG" -map "[v]" -c:v libx264 -preset fast -crf 10 -profile:v high -r 24 \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv -movflags +faststart "$OUT"
fi
echo "EXIT $?"
