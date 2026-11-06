import json, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
M=sys.argv[1]; out=sys.argv[2]; voice=sys.argv[3]
k=Kokoro(M+'/kokoro-v1.0.onnx', M+'/voices-v1.0.bin')
script=json.load(open('script.json'))
sr=24000; parts=[]; sents=[]; t=0.0
for i,s in enumerate(script):
    a,sr=k.create(s['tts'], voice=voice, speed=1.0, lang='en-us')
    a=np.asarray(a,dtype=np.float32)
    # trim leading/trailing near-silence to 40ms margin
    env=np.abs(a); thr=0.01; idx=np.where(env>thr)[0]
    a=a[max(0,idx[0]-int(.04*sr)):min(len(a),idx[-1]+int(.06*sr))]
    sents.append({"start":t,"end":t+len(a)/sr,"n":len(a)}); parts.append(a)
    t+=len(a)/sr
    gap=0.32 if i<len(script)-1 else 0.0
    parts.append(np.zeros(int(gap*sr),np.float32)); t+=gap
    np.save(f'tools/s{i}.npy',a)
sf.write(out,np.concatenate(parts),sr)
json.dump(sents,open('tools/sentences.json','w'),indent=1)
print('total',t)
