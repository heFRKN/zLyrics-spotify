import { el, activeAt, setVar } from './util.js';
import { wordProgress } from './lyrics.js';

// Klasik karaoke: iki yuva (üst sola, alt sağa yaslı). Çift satırlar üstte,
// tek satırlar altta. Biri söylenirken diğeri sıradakini bekletir.
// Uzun bir aradan sonra gelen satırdan önce 3-2-1 noktaları.

export class Karaoke {
  constructor(host) {
    this.host = host;
    const stage = el('div', 'k-stage');
    this.count = el('div', 'k-count');
    for (let i = 0; i < 3; i++) this.count.append(el('i', 'off'));
    this.slots = [el('div', 'k-slot top'), el('div', 'k-slot bot')].map((node) => ({ node, idx: -1, line: null, c: {} }));
    stage.append(this.count, this.slots[0].node, this.slots[1].node);
    host.append(stage);
    this.lines = [];
  }

  mount(prep) {
    this.lines = prep ? prep.lines : [];
    this.slots.forEach((s) => { s.node.textContent = ''; s.idx = -1; s.line = null; });
  }

  show() {}

  annotate() { this.slots.forEach((s) => { s.line?.remove(); s.line = null; s.idx = -1; }); }

  _put(slot, idx) {
    if (slot.idx === idx) return;
    slot.idx = idx;
    const old = slot.line;
    if (old) {
      old.classList.add('leave');
      setTimeout(() => old.remove(), 650);
    }
    slot.line = null;
    slot.c = {};
    if (idx < 0 || !this.lines[idx]) return;
    const L = this.lines[idx];
    const ln = el('div', 'k-line enter');
    slot.words = L.words.map((w, k) => {
      const s = el('span', 'kw', w.text);
      if (k) ln.append(' ');
      ln.append(s);
      return s;
    });
    if (L.tr) ln.append(el('div', 'k-tr', L.tr));
    slot.node.append(ln);
    slot.line = ln;
    requestAnimationFrame(() => requestAnimationFrame(() => ln.classList.remove('enter')));
  }

  update(t) {
    const L = this.lines;
    if (!L.length) return;
    const a = activeAt(L, t + 0.05);
    const from = Math.max(a, 0);
    // her yuvaya kendi paritesinin sıradaki satırı
    for (let p = 0; p < 2; p++) {
      let j = from % 2 === p ? from : from + 1;
      // söylenip biten satırın yuvası hemen iki sonrakini hazırlar
      if (j === a && L[j] && t > L[j].end + 0.6 && L[j + 2]) j += 2;
      this._put(this.slots[p], j < L.length ? j : -1);
    }

    for (const s of this.slots) {
      if (!s.line) continue;
      const ln = L[s.idx];
      const singing = s.idx === a;
      s.line.classList.toggle('sing', singing && t < ln.end + 0.4);
      s.line.classList.toggle('wait', !singing);
      ln.words.forEach((w, k) => setVar(s.words[k], '--p', singing ? wordProgress(w, t) : 0, s.c, k));
    }

    // geri sayım: uzun boşluk sonrası satır
    const nx = L[a + 1];
    const prevEnd = a >= 0 ? L[a].end : 0;
    let n = 0;
    if (nx && nx.t - prevEnd > 4) {
      const left = nx.t - t;
      if (left > 0 && left <= 3) n = Math.ceil(left);
    }
    if (n !== this._n) {
      this._n = n;
      [...this.count.children].forEach((d, i) => d.classList.toggle('off', i >= n));
    }
  }
}
