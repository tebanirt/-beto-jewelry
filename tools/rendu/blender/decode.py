"""Décode un modèle models/*.json (format du configurateur) en tableaux numpy."""
import json, base64, numpy as np
def load(path):
    m = json.load(open(path))
    buf = base64.b64decode(m.pop('bin'))
    parts = []
    for p in m['parts']:
        if 'q' in p:
            raw = np.frombuffer(buf, np.int16, p['nv']*3, p['p']).reshape(-1, 3).astype(np.float64)
            q = p['q']; P = np.empty_like(raw)
            for a in range(3): P[:, a] = q[2*a] + (raw[:, a]+32768)/65535*(q[2*a+1]-q[2*a])
            N = np.frombuffer(buf, np.int8, p['nv']*3, p['n']).reshape(-1, 3).astype(np.float64)
            N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-9)
        else:
            P = np.frombuffer(buf, np.float32, p['nv']*3, p['p']).reshape(-1, 3).astype(np.float64)
            N = np.frombuffer(buf, np.float32, p['nv']*3, p['n']).reshape(-1, 3).astype(np.float64)
        dt = np.uint16 if p.get('i16') else np.uint32
        I = np.frombuffer(buf, dt, p['nt']*3, p['i']).reshape(-1, 3).astype(np.int64)
        parts.append(dict(meta={k: v for k, v in p.items() if k not in ('p', 'n', 'i', 'q')}, P=P, N=N, I=I))
    defs = {}
    for name, d in m['defs'].items():
        P = np.frombuffer(buf, np.float32, d['nv']*3, d['p']).reshape(-1, 3).astype(np.float64)
        I = np.frombuffer(buf, np.uint32, d['nt']*3, d['i']).reshape(-1, 3).astype(np.int64)
        defs[name] = dict(P=P, I=I, bb=d['bb'])
    gems = [dict(defn=g['def'], layer=g['layer'], m=np.array(g['m'])) for g in m['gems']]
    return dict(parts=parts, defs=defs, gems=gems, innerR=m.get('innerR'), beads=m.get('beads'))
if __name__ == '__main__':
    import sys
    for f in sys.argv[1:]:
        d = load(f)
        allP = np.vstack([p['P'] for p in d['parts']])
        print(f, 'bbox', allP.min(0).round(2), allP.max(0).round(2), 'gems', [(g['defn'], np.linalg.norm(g['m'][:, :3], axis=0).round(3).tolist(), g['m'][:, 3].round(2).tolist()) for g in d['gems'][:3]])
