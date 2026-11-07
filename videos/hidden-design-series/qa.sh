# usage: qa.sh EPDIR OUTPNG  — sample one frame per shot (midpoint+0.4) into a contact sheet
E=$1; i=0
mkdir -p $E/qa
python3 -c "
import json;p=json.load(open('$E/project.json'))
print(' '.join(str(round(min(s['start']+ (s['end']-s['start'])*0.8, s['end']-0.05),2)) for s in p['shots']))" > $E/qa/times
for t in $(cat $E/qa/times); do i=$((i+1)); ffmpeg -loglevel error -y -ss $t -i $E/output/preview.mp4 -frames:v 1 -vf scale=300:-1 $E/qa/f_$(printf %02d $i).png; done
ffmpeg -loglevel error -y -pattern_type glob -i "$E/qa/f_*.png" -filter_complex "tile=6x3" $2
