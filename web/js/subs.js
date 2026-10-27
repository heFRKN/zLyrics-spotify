import { el, activeAt, setVar } from './util.js';
import { wordProgress } from './lyrics.js';

// Video modu: klip arka planda, sözler altyazı gibi altta.

export class Subs {
  constructor(host) {
    this.host = host;
    this.cur = el('div', 'sb-cur');
    this.next = el('div', 'sb-next');
    host.append(this.cur, this.next);
    this.lines = [];
    this.idx = -2;
  }

  mount(prep) {
    this.lines = prep ? prep.lines : [];
    this.idx = -2;
    this.key = null;
    this.cur.textContent = '';
    this.next.textContent = '';
  }

  show() { this.key = null; }

  update(t) {
    const L = this.lines;
    if (!L.length) return;
    const a = activeAt(L, t + 0.1);
    const showing = a >= 0 && t > L[a].end + 1.5 ? -1 : a; // satır bitti -> ara
    const key = showing * 10000 + a;
    if (key === this.key) return this._fill(t);
    this.key = key;
    this.idx = showing;

    const ln = L[showing];
    this.cur.textContent = '';
    this.c = {};
    this.words = [];
    if (ln) {
      ln.words.forEach((w, k) => {
        const s = el('span', 'w', w.text);
        if (k) this.cur.append(' ');
        this.cur.append(s);
        this.words.push(s);
      });
    }
    const nx = L[a + 1];
    this.next.textContent = nx ? nx.text : '';
    for (const n of [this.cur, this.next]) {
      n.classList.remove('sb-anim');
      void n.offsetWidth;
      n.classList.add('sb-anim');
    }
    this._fill(t);
  }

  _fill(t) {
    const ln = this.lines[this.idx];
    if (!ln) return;
    ln.words.forEach((w, k) => setVar(this.words[k], '--p', wordProgress(w, t), this.c, k));
  }
}
