# Production : designs de Rayane, 5 vues, studio du diamant final, retouche des pierres par courbe tonale.
cd "$(dirname "$0")"; U=${BETO_3DM_DIR:?dossier des fichiers .3dm (jamais dans ce dépôt)}
export BETO_JAUNE=1.0,0.66,0.22 HYB_NSTRIP=8 HYB_SW=14 HYB_SPARK=0 HYB_DARK=0.1 HYB_PHOTO=30 HYB_SEED=${HYB_SEED:-2}
VIEWS=${VIEWS:-"hero trois_quarts face cote dessus"}; OUT=${OUT:-prod}; mkdir -p $OUT
run() { f="$1"; n="$2"; m="$3"; shift 3
  if [ "$m" = jaune ]; then H="--hdri ../hdri/studio_small_09.hdr --rot 90 --exposure 0.6"; export BETO_TENT=1.0; else H="--hdri ../hdri/studio_small_09.hdr --rot 90 --exposure 0.8"; export BETO_TENT=1.6; fi
  for v in $VIEWS; do
    [ -f $OUT/${n}_$v.png ] && continue
    ./venv/bin/python scripts/scene_3dm.py -- "$U/$f" $OUT/${n}_$v.png --metal $m --view $v --res ${RES:-1000} --samples ${SPP:-160} $H --finish --gempass --gemmatch 1.0 "$@" 2>&1 | grep -E --line-buffered "rendu|nouvelle|rror|Traceback"
  done; }
