cd "$(dirname "$0")"
O=../render/stones_rt
for s in rond ovale coussin emeraude poire marquise radiant princesse; do node shot.js "solo=1&view=solo&shape=$s" $O/forme_$s.png 360 >/dev/null 2>&1; echo forme $s; done
j() { node shot.js "solo=1&view=solo&shape=rond&stone=$(node -e "process.stdout.write(encodeURIComponent(JSON.stringify($2)))")" $O/$1.png 360 >/dev/null 2>&1; echo $1; }
j labo_bleu '{color:"#3f6dff",absorb:0.34,gain:1.4}'
j labo_rose '{color:"#ff4f9a",absorb:0.34,gain:1.4}'
j labo_jaune '{color:"#ffc61a",absorb:0.34,gain:1.4}'
j labo_vert '{color:"#2fd06a",absorb:0.34,gain:1.4}'
j gemme_saphir '{color:"#1f45e6",absorb:0.5,ior:1.77,aberration:0.004,gain:1.5}'
j gemme_saphirrose '{color:"#ff5fa8",absorb:0.4,ior:1.77,aberration:0.004,gain:1.4}'
j gemme_saphirjaune '{color:"#ffc12e",absorb:0.4,ior:1.77,aberration:0.004,gain:1.4}'
j gemme_rubis '{color:"#e0142c",absorb:0.55,ior:1.77,aberration:0.004,gain:1.6}'
j gemme_emeraude '{color:"#1ea85a",absorb:0.5,ior:1.58,aberration:0.003,gain:1.6}'
j gemme_morganite '{color:"#ffb3a0",absorb:0.3,ior:1.58,aberration:0.003,gain:1.4}'
j gemme_aigue '{color:"#8fe3ff",absorb:0.3,ior:1.58,aberration:0.003,gain:1.4}'
j gemme_tanzanite '{color:"#5a5cf0",absorb:0.5,ior:1.69,aberration:0.004,gain:1.5}'
echo STONES_DONE
