import { clamp } from './util.js';

const GAP_MIN = 4.2; // bu kadar boşlukta "• • •" ara gösterilir

/**
 * Sunucudan gelen satırları ({t, end?, text, words?}) zamanlamaya hazırlar:
 *  - her satırın söylenme bitişi (gelmediyse tahmin)
 *  - kelime kelime zamanlama (enhanced LRC yoksa harf uzunluğuna göre dağıtım)
 *  - uzun boşluklar için "ara" öğeleri
 */
export function prepare(raw, duration) {
  const lines = raw
    .filter((l) => l.text && l.text.trim())
    .map((l) => ({ kind: 'line', t: l.t, end: l.end, text: l.text.trim(), rawWords: l.words }));

  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    const next = lines[i + 1]?.t ?? (duration > L.t ? duration : L.t + 8);
    const est = clamp(L.text.length * 0.12 + 0.5, 1.1, 7);
    L.estimated = !(L.end > L.t);
    if (L.estimated) {
      const avail = next - L.t;
      L.end = L.t + (avail <= est * 1.6 ? avail * 0.94 : est);
    }
    L.end = Math.min(L.end, next);
    L.next = next;
    L.idx = i;
    L.words = buildWords(L);
  }

  const items = [];
  if (lines.length && lines[0].t > GAP_MIN) items.push({ kind: 'gap', t: 0, end: lines[0].t });
  lines.forEach((L, i) => {
    items.push(L);
    const nx = lines[i + 1];
    if (!nx) return;
    const start = L.end + (L.estimated ? 1.2 : 0.35);
    if (nx.t - start > GAP_MIN - 1) items.push({ kind: 'gap', t: start, end: nx.t });
  });

  return { lines, items };
}

function buildWords(L) {
  if (L.rawWords?.length) {
    return L.rawWords.map((w, k, a) => {
      const t1 = a[k + 1]?.t ?? L.end;
      return { text: w.text, t0: w.t, t1, long: t1 - w.t > 1.1 && w.text.length <= 14 };
    });
  }
  const toks = L.text.split(/\s+/).filter(Boolean);
  const weights = toks.map((w) => w.replace(/[^\p{L}\p{N}]/gu, '').length + 1.4);
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const span = L.end - L.t;
  let acc = 0;
  return toks.map((text, k) => {
    const t0 = L.t + (acc / total) * span;
    acc += weights[k];
    const t1 = L.t + (acc / total) * span;
    return { text, t0, t1, long: t1 - t0 > 1.1 && text.length <= 14 };
  });
}

/** Kelime ilerlemesi 0..1, hafif ease ile — dolgu doğrusal görünmesin. */
export function wordProgress(w, t) {
  const p = clamp((t - w.t0) / (w.t1 - w.t0 || 1));
  return p < 1 ? p * (2 - p) * 0.35 + p * 0.65 : 1;
}

/** Ara boyunca üç noktanın doluluğu ve nefes ölçeği. */
export function gapState(g, t, now) {
  const len = g.end - g.t;
  const p = clamp((t - g.t) / len);
  const k = [0, 1, 2].map((i) => clamp(p * 3 - i));
  const left = g.end - t;
  let s = 1 + 0.07 * Math.sin(now / 1000 * 2.6);
  if (left < 0.5) s *= clamp(left / 0.5) ** 2;
  return { k, s };
}
