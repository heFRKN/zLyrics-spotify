import { el, clamp, activeAt, setVar } from './util.js';
import { wordProgress, gapState } from './lyrics.js';

// Akış modu. Her satır mutlak konumda; dikey kayma her satır için ayrı bir
// yay (spring) ile ilerler ve aktif satırın altındakiler kademeli gecikmeyle
// hedefi alır — satırlar birbirini dalga gibi takip eder.

const LEAD = 0.22;      // satır, söylenmeden biraz önce yerine otursun
const STAGGER = 42;     // ms / satır
const K = 125, C = 21;  // yay sertliği / sönüm
const STEP = 1 / 240;   // sabit fizik adımı: her ekran hızında aynı his
const FREE_MS = 2800;   // elle kaydırmadan sonra senkrona dönüş

export class Flow {
  constructor(host, { onSeek }) {
    this.host = host;
    this.onSeek = onSeek;
    this.col = el('div', 'flow-col');
    host.append(this.col);
    this.items = [];
    this.nodes = [];
    this.st = [];
    this.active = -2;
    this.user = 0;
    this.userAt = 0;
    this.lastNow = performance.now();
    this.needSnap = true;

    host.addEventListener('wheel', (e) => {
      e.preventDefault();
      this._nudge(-e.deltaY * (e.deltaMode === 1 ? 32 : 1));
    }, { passive: false });

    let ty = null;
    host.addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; }, { passive: true });
    host.addEventListener('touchmove', (e) => {
      if (ty == null) return;
      const y = e.touches[0].clientY;
      this._nudge(y - ty);
      ty = y;
    }, { passive: true });
    host.addEventListener('touchend', () => { ty = null; });

    this.col.addEventListener('click', (e) => {
      const n = e.target.closest('.fl');
      if (!n || n.classList.contains('gap')) return;
      const it = this.items[+n.dataset.i];
      this.user = 0;
      this.host.classList.remove('free');
      this.onSeek(it.t);
    });

    new ResizeObserver(() => this.measure()).observe(host);
    document.fonts?.ready.then(() => this.measure());
  }

  _nudge(d) {
    if (!this.items.length) return;
    const lim = this.total + this.host.clientHeight;
    this.user = clamp(this.user + d, -lim, lim);
    this.userAt = performance.now();
    this.host.classList.add('free');
  }

  mount(prep) {
    this.col.textContent = '';
    this.items = prep ? prep.items : [];
    this.nodes = [];
    this.st = [];
    this.words = [];
    this.dots = [];
    this.items.forEach((it, i) => {
      const n = el('div', 'fl');
      n.dataset.i = i;
      if (it.kind === 'gap') {
        n.classList.add('gap');
        const d = el('div', 'dots');
        d.style.transform = 'scale(0)';
        d.append(el('i'), el('i'), el('i'));
        n.append(d);
        this.dots[i] = { wrap: d, dots: [...d.children], c: {} };
      } else {
        const ws = it.words.map((w, k) => {
          const s = el('span', 'w' + (w.long ? ' long' : ''), w.text);
          if (k) n.append(' ');
          n.append(s);
          return s;
        });
        if (it.tr) n.append(el('div', 'tr', it.tr));
        this.words[i] = { els: ws, c: {} };
      }
      this.col.append(n);
      this.nodes.push(n);
      this.st.push({ y: 0, v: 0, target: 0, pend: null, pendAt: 0, f: it.kind === 'gap' ? 0 : 1, drawn: Infinity, d: -1 });
    });
    this.active = -2;
    this.user = 0;
    this.host.classList.remove('free');
    this.measure();
    this.needSnap = true;
    this.acc = 0;
  }

  /** Satır altına çeviri ekler; satırlar yeni yerlerine yayla kayar. */
  annotate(trs) {
    this.items.forEach((it, i) => {
      if (it.kind !== 'line') return;
      const n = this.nodes[i];
      n.querySelector('.tr')?.remove();
      if (it.tr) n.append(el('div', 'tr', it.tr));
    });
    this.measure(false);
  }

  measure(instant = true) {
    // görünmezken ölçmek (offsetHeight) tüm sayfanın yerleşimini zorlar; açılınca show() ölçer
    if (this.paused) return;
    if (!this.nodes.length) return;
    this.h = this.nodes.map((n) => n.offsetHeight);
    const fs = parseFloat(getComputedStyle(this.nodes[0]).fontSize) || 40;
    // satır aralığı CSS'ten ayarlanabilir (--l-gap, em cinsinden); yoksa 0.34em
    this.space = fs * (parseFloat(getComputedStyle(this.host).getPropertyValue('--l-gap')) || 0.34);
    this.H = this.host.clientHeight;
    this.anchor = this.H * 0.3;
    this.total = this.h.reduce((a, b) => a + b + this.space, 0);
    this._retarget(performance.now(), instant);
  }

  // Aktif satırı çapaya getiren kaydırma değeri (ara öğeleri hedef boyda sayılır)
  _scrollFor(active) {
    let y = 0;
    const upto = Math.max(0, active);
    for (let i = 0; i < upto; i++) {
      const f = this.items[i].kind === 'gap' ? 0 : 1;
      y += (this.h[i] + this.space) * f;
    }
    return this.anchor - y;
  }

  _retarget(now, instant) {
    if (!this.h) return;
    const S = this._scrollFor(this.active);
    const a = Math.max(0, this.active);
    this.st.forEach((s, i) => {
      const delay = i <= a ? 0 : Math.min(i - a, 10) * STAGGER;
      if (instant || delay === 0) { s.target = S; s.pend = null; }
      else { s.pend = S; s.pendAt = now + delay; }
    });
  }

  _setActive(idx, now) {
    const prev = this.active;
    this.active = idx;
    this.nodes.forEach((n, i) => {
      const d = Math.min(Math.abs(i - idx), 6);
      const s = this.st[i];
      if (s.d !== d) { s.d = d; n.style.setProperty('--d', d); }
      n.classList.toggle('on', i === idx);
    });
    this._retarget(now, Math.abs(idx - prev) > 12);
  }

  show() { this.paused = false; this.needSnap = true; this.measure(); }

  update(t, now) {
    const dt = Math.min(0.05, (now - this.lastNow) / 1000);
    this.lastNow = now;
    if (!this.items.length) return;

    const idx = activeAt(this.items, t + LEAD);
    if (idx !== this.active) this._setActive(idx, now);

    if (this.user && now - this.userAt > FREE_MS) {
      this.user += (0 - this.user) * Math.min(1, dt * 4);
      if (Math.abs(this.user) < 0.5) { this.user = 0; this.host.classList.remove('free'); }
    }

    // ara öğelerinin açılıp kapanması
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].kind !== 'gap') continue;
      const s = this.st[i];
      const was = s.f;
      s.f += ((i === idx ? 1 : 0) - s.f) * Math.min(1, dt * 7);
      if (s.f < 0.002) s.f = 0;
      if (i !== idx && s.f !== was) this.dots[i].wrap.style.transform = `scale(${s.f.toFixed(3)})`;
    }

    // her karede clientHeight okumak, Spotify gibi sürekli değişen bir sayfada tüm yerleşimi zorlar;
    // yükseklik measure()'da (boyut değişince) önbelleğe alınır
    const H = this.H || this.host.clientHeight;
    let pos = 0;
    const snap = this.needSnap;
    this.acc = Math.min(this.acc + dt, 0.1);
    const steps = Math.floor(this.acc / STEP);
    this.acc -= steps * STEP;
    for (let i = 0; i < this.nodes.length; i++) {
      const s = this.st[i];
      if (s.pend != null && (snap || now >= s.pendAt)) { s.target = s.pend; s.pend = null; }
      const goal = s.target + this.user;
      if (snap) { s.y = goal; s.v = 0; }
      else {
        // yarı-örtük Euler, sabit adım
        for (let k = 0; k < steps; k++) {
          s.v += (K * (goal - s.y) - C * s.v) * STEP;
          s.y += s.v * STEP;
        }
      }
      const y = s.y + pos;
      pos += (this.h[i] + this.space) * s.f;

      const far = y < -this.h[i] - 260 || y > H + 260;
      const n = this.nodes[i];
      if (far !== n._far) { n._far = far; n.classList.toggle('far', far); }
      if (!far && Math.abs(y - s.drawn) > 0.05) {
        s.drawn = y;
        n.style.transform = `translate3d(0,${y.toFixed(2)}px,0)`;
      }
    }
    this.needSnap = false;

    // önceki satırın son kelimeleri yarım kalmasın
    const prev = this.items[idx - 1];
    if (prev?.kind === 'line') this._fill(prev, idx - 1, t);

    const it = this.items[idx];
    if (!it) return;
    if (it.kind === 'gap') {
      const g = gapState(it, t, now);
      const d = this.dots[idx];
      d.dots.forEach((e, k) => setVar(e, '--k', g.k[k], d.c, k));
      d.wrap.style.transform = `scale(${(g.s * this.st[idx].f).toFixed(3)})`;
    } else {
      this._fill(it, idx, t);
    }
  }

  _fill(it, i, t) {
    const W = this.words[i];
    it.words.forEach((w, k) => {
      const p = wordProgress(w, t);
      setVar(W.els[k], '--p', p, W.c, k);
      if (w.long) setVar(W.els[k], '--g', p > 0 && p < 1 ? Math.sin(p * Math.PI) : 0, W.c, 'g' + k);
    });
  }
}
