import json, numpy as np
sr=24000; LEAD=0.15
script=json.load(open('script.json')); sents=json.load(open('tools/sentences.json'))
cues=[]; report=[]
for i,(s,se) in enumerate(zip(script,sents)):
    a=np.load(f'tools/s{i}.npy'); dur=len(a)/sr
    win=int(.02*sr); e=np.array([np.sqrt(np.mean(a[j:j+win]**2)) for j in range(0,len(a)-win,win//2)])
    caps=s['caps']; L=[len(c) for c in caps]; tot=sum(L); bounds=[0.0]; acc=0
    for c in L[:-1]:
        acc+=c; est=dur*acc/tot
        lo=max(0,int((est-.3)/(.01))); hi=min(len(e)-1,int((est+.3)/.01))
        # find longest low-energy run center near estimate
        k=lo+int(np.argmin(e[lo:hi+1])); bounds.append(k*.01+.01)
        report.append((caps[len(bounds)-2], round(est,2), round(bounds[-1],2), float(e[k])))
    bounds.append(dur)
    for j,c in enumerate(caps):
        st=se['start']+bounds[j]+LEAD; en=se['start']+bounds[j+1]+LEAD
        if j==len(caps)-1 and i<len(script)-1: en=sents[i+1]['start']+LEAD-0.02
        cues.append({"start":round(st,3),"end":round(en,3),"text":c})
json.dump(cues,open('captions.json','w'),indent=1)
for r in report: print(r)
for c in cues: print(c)
