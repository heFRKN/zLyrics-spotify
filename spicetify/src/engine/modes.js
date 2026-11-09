import { el, activeAt, setVar } from './util.js';
import { wordProgress, gapState } from './lyrics.js';

// Ek modlar: Klip (video üstünde altyazı), Kelime (tek kelime, dev) ve Daktilo (harf harf yazılır).
// Hepsi yalnızca saydamlık/konum canlandırır; bulanıklık geçişi yok (ekran kartına verilemiyor).

const lineAt = (lines, t) => activeAt(lines, t);

/* ───────── Klip: altta sinema altyazısı. Söylenen satır büyük, sıradaki küçük ve sönük. */
export class Clip {
  constructor(host) {
    this.host = host;
    this.box = el('div', 'cl-box');
    this.dots = el('div', 'cl-dots');
    this.dots.append(el('i'), el('i'), el('i'));
    host.append(this.dots, this.box);
    this.lines = [];
    this.items = [];
  }

  mount(prep) {
    this.lines = prep ? prep.lines : [];
    this.items = prep ? prep.items : [];
    this.box.textContent = '';
    this.cur = this.nx = null;
    this.idx = -2;
    this.c = {};
  }

  show() {}
  annotate() { this.idx = -2; this.box.textContent = ''; this.cur = this.nx = null; }
  busy() { return this._gap; }

  _make(L, cls) {
    const n = el('div', 'cl-line ' + cls);
    const words = L.words.map((w, k) => {
      const s = el('span', 'clw', w.text);
      if (k) n.append(' ');
      n.append(s);
      return s;
    });
    if (L.tr) n.append(el('div', 'cl-tr', L.tr));
    this.box.append(n);
    return { n, words, L, c: {} };
  }

  _drop(x, cls) {
    if (!x) return;
    x.n.classList.add(cls);
    setTimeout(() => x.n.remove(), 700);
  }

  update(t, now) {
    const L = this.lines;
    if (!L.length) return;
    const a = lineAt(L, t + 0.08);
    const live = a >= 0 && t < L[a].end + 0.6;
    const want = live ? a : -1;
    if (want !== this.idx) {
      this._drop(this.cur, 'out');
      // sıradaki satır zaten ekrandaysa yukarı kayıp büyür; değilse yeniden kurulur
      if (want >= 0 && this.nx?.L === L[want]) {
        this.cur = this.nx;
        this.cur.n.className = 'cl-line cur';
      } else {
        this._drop(this.nx, 'gone');
        this.cur = want >= 0 ? this._make(L[want], 'cur enter') : null;
      }
      const nl = L[(want >= 0 ? want : a) + 1];
      this.nx = nl ? this._make(nl, 'nx enter') : null;
      this.idx = want;
      const fresh = [this.cur, this.nx].filter((x) => x?.n.classList.contains('enter'));
      if (fresh.length) requestAnimationFrame(() => requestAnimationFrame(() => fresh.forEach((x) => x.n.classList.remove('enter'))));
    }
    if (this.cur) {
      const word = this.fillMode === 'word';
      this.cur.L.words.forEach((w, k) => setVar(this.cur.words[k], '--p', word ? (t >= w.t0 ? 1 : 0) : wordProgress(w, t), this.cur.c, k));
    }
    // uzun arada üç nokta
    const gi = activeAt(this.items, t + 0.08);
    const g = this.items[gi];
    this._gap = g?.kind === 'gap' && !this.cur;
    this.dots.classList.toggle('on', this._gap);
    if (this._gap) {
      const s = gapState(g, t, now);
      [...this.dots.children].forEach((d, k) => setVar(d, '--k', s.k[k], this.c, k));
    }
  }
}

/* ───────── Kelime: ekranda o an söylenen tek kelime, kocaman. Altında satırın tamamı. */
export class Words {
  constructor(host) {
    this.host = host;
    this.stage = el('div', 'wd-stage');
    this.ctx = el('div', 'wd-ctx');
    // satırlar arası boşlukta ekran boş kalmasın: bekleme noktaları + sıradaki satır
    this.dots = el('div', 'wd-dots');
    this.dots.append(el('i'), el('i'), el('i'));
    this.c = {};
    host.append(this.stage, this.dots, this.ctx);
    this.lines = [];
  }

  mount(prep) {
    this.lines = prep ? prep.lines : [];
    this.items = prep ? prep.items : [];
    this.stage.textContent = '';
    this.ctx.textContent = '';
    this.li = null;
    this.key = '';
    this.big = null;
  }

  show() {}
  annotate() { this.li = null; this.key = ''; }
  busy() { return this._gap; }

  _ctx(L) {
    this.ctx.textContent = '';
    this.ctxW = L ? L.words.map((w, k) => {
      const s = el('span', null, w.text);
      if (k) this.ctx.append(' ');
      this.ctx.append(s);
      return s;
    }) : [];
    if (L?.tr) this.ctx.append(el('div', 'wd-tr', L.tr));
  }

  update(t, now) {
    const L = this.lines;
    if (!L.length) return;
    const a = lineAt(L, t + 0.06);
    const line = L[a];
    const live = line && t < line.end + 0.5;
    // boşlukta sıradaki satır sönük gösterilir
    const li = live ? 'l' + a : L[a + 1] ? 'n' + a : '';
    if (li !== this.li) {
      this.li = li;
      this._ctx(live ? line : L[a + 1] || null);
      this.ctx.classList.toggle('on', !!li);
      this.ctx.classList.toggle('next', !live);
    }
    const gi = activeAt(this.items, t + 0.06);
    const g = this.items[gi];
    this._gap = !live && g?.kind === 'gap';
    this.dots.classList.toggle('on', this._gap);
    if (this._gap) {
      const s = gapState(g, t, now);
      [...this.dots.children].forEach((d, k) => setVar(d, '--k', s.k[k], this.c, k));
      this.dots.style.transform = `scale(${s.s.toFixed(3)})`;
    }
    let k = -1;
    if (live) for (let i = 0; i < line.words.length; i++) if (t >= line.words[i].t0 - 0.04) k = i;
    const key = live && k >= 0 ? a + ':' + k : '';
    if (key === this.key) return;
    this.key = key;
    if (this.big) {
      const old = this.big;
      old.classList.add('out');
      setTimeout(() => old.remove(), 600);
      this.big = null;
    }
    this.ctxW?.forEach((s, i) => { s.classList.toggle('on', i === k); s.classList.toggle('done', i < k); });
    if (!key) return;
    const w = line.words[k];
    const text = w.text.replace(/^[,.;:!?¿¡"'“”‘’()]+|[,.;:!?"'“”‘’()]+$/g, '') || w.text;
    const n = el('div', 'wd-big in', text);
    const len = [...text].length;
    if (len > 12) n.style.fontSize = '.5em';
    else if (len > 8) n.style.fontSize = '.68em';
    else if (len > 5) n.style.fontSize = '.85em';
    if (w.t1 - w.t0 > 0.9) n.classList.add('held');
    // her kelime biraz farklı eğim ve konumla gelsin: aynı kalıp tekrar etmesin
    const r = ((a * 7 + k * 13) % 9) - 4;
    n.style.setProperty('--r', r * 0.6 + 'deg');
    n.style.setProperty('--dx', (((a * 5 + k * 11) % 7) - 3) * 0.6 + 'cqw');
    this.stage.append(n);
    this.big = n;
    requestAnimationFrame(() => requestAnimationFrame(() => n.classList.remove('in')));
  }
}

/* ───────── Daktilo: harfler söylendikçe yazılır; önceki satırlar yukarı kayar. */
export class Typer {
  constructor(host) {
    this.host = host;
    this.col = el('div', 'ty-col');
    this.caret = el('i', 'ty-caret');
    host.append(this.col);
    this.lines = [];
  }

  mount(prep) {
    this.lines = prep ? prep.lines : [];
    this.col.textContent = '';
    this.idx = -2;
    this.cur = null;
  }

  show() {}
  annotate() { this.idx = -2; this.col.textContent = ''; this.cur = null; }

  _line(L, full) {
    const n = el('div', 'ty-line');
    const chars = [];
    L.words.forEach((w, k) => {
      if (k) { const sp = el('span', 'ty-c', ' '); n.append(sp); chars.push({ s: sp, w: k, f: 0 }); }
      const ws = el('span', 'ty-w');
      const cs = [...w.text];
      cs.forEach((ch, j) => {
        const s = el('span', 'ty-c', ch);
        ws.append(s);
        chars.push({ s, w: k, f: (j + 1) / cs.length });
      });
      n.append(ws);
    });
    if (L.tr) n.append(el('div', 'ty-tr', L.tr));
    if (full) { n.classList.add('old'); chars.forEach((c) => c.s.classList.add('on')); }
    return { n, chars, L, shown: full ? chars.length : 0 };
  }

  _push(node) {
    // FLIP: yeni satır eklenince eskiler yerinden zıplamasın, kayarak çıksın
    const before = this.col.offsetHeight;
    this.col.append(node);
    const d = this.col.offsetHeight - before;
    const olds = [...this.col.children];
    while (olds.length > 5) olds.shift().remove();
    this.col.style.transition = 'none';
    this.col.style.transform = `translateY(${d}px)`;
    void this.col.offsetWidth;
    this.col.style.transition = '';
    this.col.style.transform = '';
    [...this.col.children].reverse().forEach((c, i) => c.style.setProperty('--age', i));
  }

  update(t) {
    const L = this.lines;
    if (!L.length) return;
    const a = lineAt(L, t + 0.05);
    if (a !== this.idx) {
      if (this.cur) {
        this.cur.chars.forEach((c) => c.s.classList.add('on'));
        this.cur.n.classList.add('old');
      }
      this.caret.remove();
      this.cur = a >= 0 ? this._line(L[a], false) : null;
      if (this.cur) this._push(this.cur.n);
      this.idx = a;
    }
    const c = this.cur;
    if (!c) return;
    const words = c.L.words;
    let n = 0;
    for (const ch of c.chars) {
      const w = words[ch.w];
      if (t >= w.t0 + (w.t1 - w.t0) * ch.f * 0.85 - 0.02) n++;
      else break;
    }
    if (t > c.L.end) n = c.chars.length;
    if (n === c.shown) return;
    for (let i = c.shown; i < n; i++) c.chars[i].s.classList.add('on');
    for (let i = n; i < c.shown; i++) c.chars[i].s.classList.remove('on');
    c.shown = n;
    const last = c.chars[n - 1]?.s;
    if (n >= c.chars.length) this.caret.remove();
    else if (last) last.after(this.caret);
    else c.n.prepend(this.caret);
  }
}
