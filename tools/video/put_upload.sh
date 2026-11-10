#!/bin/bash
# put_upload.sh <file.mp4> <signed_upload_url>  -> uploads bytes for a Supermetrics upload_ref
set -euo pipefail
f="$1"; url="$2"
code=$(curl -sS -o /dev/null -w "%{http_code}" -X PUT -H "Content-Type: video/mp4" --data-binary @"$f" --max-time 300 "$url")
echo "PUT $(basename "$f") -> HTTP $code ($(stat -c %s "$f") bytes)"
[ "$code" = "200" ] || exit 1
