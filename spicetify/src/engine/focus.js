import { el, activeAt, setVar } from './util.js';
import { gapState } from './lyrics.js';

// Odak: ekranda tek satır. Kelimeler söylendikleri an bulanıklıktan
// süzülerek belirir; satır biterken yukarı doğru dağılır.

export class Focus {
  constructor(host) {
    this.host = host;
    this.items = [];
    this.cur = null;
    this.idx = -2;
  }

  mount(prep) {
    this.items = prep ? prep.items : [];
    this.host.textContent = '';
    this.cur = null;
    this.idx = -2;
  }

  show() {}

  // çeviri gelince mevcut satır çeviriyle yeniden kurulsun
  annotate() { this.cur?.node.remove(); this.cur = null; this.idx = -2; }

  _swap(idx) {
    if (this.cur) {
      const old = this.cur.node;
      old.classList.add('out');
      setTimeout(() => old.remove(), 1000);
    }
    this.cur = null;
    const it = this.items[idx];
    if (!it) return;

    if (it.kind === 'gap') {
      const node = el('div', 'fo-dots');
      node.append(el('i'), el('i'), el('i'));
      this.host.append(node);
      this.cur = { node, it, dots: [...node.children], c: {} };
      return;
    }
    const node = el('div', 'fo-line');
    const inner = el('span');
    if (it.text.length > 70) inner.style.fontSize = '.62em';
    else if (it.text.length > 42) inner.style.fontSize = '.78em';
    const words = it.words.map((w, k) => {
      const s = el('span', 'fo-w', w.text);
      if (k) inner.append(' ');
      inner.append(s);
      return s;
    });
    node.append(inner);
    if (it.tr) node.append(el('div', 'fo-tr', it.tr));
    this.host.append(node);
    this.cur = { node, it, words, state: words.map(() => 0) };
  }

  update(t, now) {
    if (!this.items.length) return;
    const idx = activeAt(this.items, t + 0.12);
    if (idx !== this.idx) { this.idx = idx; this._swap(idx); }
    const c = this.cur;
    if (!c) return;

    if (c.it.kind === 'gap') {
      const g = gapState(c.it, t, now);
      c.dots.forEach((d, k) => setVar(d, '--k', g.k[k], c.c, k));
      c.node.style.transform = `scale(${g.s.toFixed(3)})`;
      return;
    }
    c.it.words.forEach((w, k) => {
      const st = t >= w.t1 + 0.5 ? 2 : t >= w.t0 - 0.1 ? 1 : 0;
      if (st === c.state[k]) return;
      c.state[k] = st;
      c.words[k].classList.toggle('on', st >= 1);
      c.words[k].classList.toggle('done', st === 2);
    });
  }
}
