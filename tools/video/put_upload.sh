#!/bin/bash
# put_upload.sh <file> <signed_upload_url>  -> uploads bytes for a Supermetrics upload_ref
# Content type follows the extension: .mp4 video, .jpg/.jpeg and .png images (carousels).
set -euo pipefail
f="$1"; url="$2"
case "${f,,}" in
  *.jpg|*.jpeg) ct="image/jpeg" ;;
  *.png) ct="image/png" ;;
  *.mov) ct="video/quicktime" ;;
  *) ct="video/mp4" ;;
esac
code=$(curl -sS -o /dev/null -w "%{http_code}" -X PUT -H "Content-Type: $ct" --data-binary @"$f" --max-time 300 "$url")
echo "PUT $(basename "$f") ($ct) -> HTTP $code ($(stat -c %s "$f") bytes)"
[ "$code" = "200" ] || exit 1
