#!/bin/bash
# Usage: bash build.sh epNN   → epNN/hidden-moves-epNN.mp4
set -e
E=$1; cd "$(dirname "$0")"
node -e "import('./$E/episode.mjs').then(m=>{require('fs').writeFileSync('$E/sfx.json', JSON.stringify({duration:m.DURATION, sfx:m.SFX(), T:m.T, C:m.C, silences:m.SILENCES||null}))})"
node render.mjs $E video $E/picture.mp4 | tail -1
python3 engine/audio.py $E
ffmpeg -loglevel error -y -i $E/picture.mp4 -i $E/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -shortest -movflags +faststart $E/hidden-moves-$E.mp4
ffmpeg -v error -i $E/hidden-moves-$E.mp4 -f null - && echo "$E decode ok $(ffprobe -v error -show_entries format=duration -of csv=p=0 $E/hidden-moves-$E.mp4)s"
