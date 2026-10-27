// zLyrics Stüdyo: temayı ve söz ekranını canlı özelleştirme paneli (üst çubuktaki palet düğmesi).
// Ayarlar yalnızca değiştiklerinde yazılır: tema değişkenleri :root'a, söz ayarları söz ekranının köküne.

const NK_DEFAULTS = {
  // tema
  accent: '#990033',
  follow: false,      // vurgu rengi çalan şarkının kapağından gelsin
  // arayüz
  panel: 55,          // panel koyuluğu %
  radius: 28,         // panel köşeleri px
  win: 36,            // pencere köşeleri px: alt çubuk 28 + 8 boşluk = eş merkezli (0 = Windows varsayılanı)
  rim: 60,            // kenar ışığı %
  shadow: 70,         // gölge derinliği %
  glow: 80,           // arka plan ışığı %
  art: true,          // arkada bulanık kapak
  font: 'geist',      // geist | inter | spotify
  // sözler
  lfont: 'geist',     // geist | inter | serif
  lsize: 100,         // %
  lweight: 700,
  lgap: 34,           // satır aralığı (em/100)
  ldim: 30,           // pasif satır görünürlüğü %
  lblur: 50,          // pasif satır bulanıklığı %
  lglow: 0,           // aktif satır parlaması %
  llift: true,        // söylenen kelime hafifçe kalksın
  lbg: 'art',         // art | color | black
  lshade: 30,         // arka plan karartma %
  kfill: 'accent',    // karaoke dolum: accent | white
  mic: 'side',        // mikrofon: side | full
  // hareket
  motion: true,       // arka plan hareketi
  anim: true,         // sayfa / kart animasyonları
  original: false,    // Spotify'ın kendi görünümü
};
const NK_SWATCHES = [
  ['Bordo', '#990033'], ['Kızıl', '#d61f45'], ['Gül', '#db2777'], ['Mor', '#7c3aed'],
  ['Gece', '#2563eb'], ['Okyanus', '#0891b2'], ['Orman', '#16a34a'], ['Kehribar', '#d97706'],
];
// hazır temalar: birden çok ayarı birlikte değiştirir
const NK_THEMES = [
  { name: 'Bordo Gece', c: ['#990033', '#2a000e'], set: { accent: '#990033', glow: 80, panel: 55, art: true, lbg: 'art', lshade: 30, rim: 60 } },
  { name: 'Okyanus', c: ['#0891b2', '#032a33'], set: { accent: '#0891b2', glow: 85, panel: 50, art: true, lbg: 'art', lshade: 25, rim: 60 } },
  { name: 'Orman', c: ['#16a34a', '#06260f'], set: { accent: '#16a34a', glow: 70, panel: 60, art: true, lbg: 'color', lshade: 35, rim: 50 } },
  { name: 'Neon', c: ['#a855f7', '#1e0b3a'], set: { accent: '#a855f7', glow: 100, panel: 40, art: true, lbg: 'art', lshade: 15, rim: 90, lglow: 45 } },
  { name: 'Kehribar', c: ['#d97706', '#2b1700'], set: { accent: '#d97706', glow: 75, panel: 55, art: false, lbg: 'color', lshade: 30, rim: 55 } },
  { name: 'Mono', c: ['#e5e5e5', '#111111'], set: { accent: '#d4d4d4', glow: 25, panel: 75, art: false, lbg: 'black', lshade: 50, rim: 40, kfill: 'white' } },
];
const NK_FONTS = {
  geist: '"Geist", ui-sans-serif, system-ui, sans-serif',
  inter: '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
  serif: '"Fraunces", Georgia, serif',
  spotify: 'SpotifyMixUI, "Helvetica Neue", Arial, sans-serif',
};
const NK_PALETTE = '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 1 0 0 13c.9 0 1.4-.6 1.4-1.3 0-.4-.2-.7-.4-1-.2-.3-.4-.6-.4-1 0-.7.6-1.3 1.3-1.3h1.5A3.1 3.1 0 0 0 14.5 6.8C14.5 3.8 11.6 1.5 8 1.5ZM4.3 8.4a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1.9-2.8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm3.6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm2 2.8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>';
const NK_WIN_PORT = 47391; // köşe programı (ZLyricsCorners) bu porttan pencere yarıçapını alır

function nkHex2Hsl(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function nkHsl2Hex(h, s, l) {
  const f = (n) => {
    const k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, '0');
  };
  return '#' + f(0) + f(8) + f(4);
}
const nkRgb = (hex) => { const n = parseInt(hex.slice(1), 16); return `${n >> 16},${(n >> 8) & 255},${n & 255}`; };

function nkStudio({ root, amb }) {
  let cfg = { ...NK_DEFAULTS, ...store.get('studio', {}) };
  // sürüm 2: pencere köşesi varsayılanı 26 -> 36 (alt çubukla eş merkezli). Elle seçilmiş değere dokunma.
  if (!cfg.v) { if (cfg.win === 26) cfg.win = 36; cfg.v = 2; }
  let albumAccent = null;
  let tab = 'tema';
  const de = document.documentElement;

  const range = (k, label, min, max, unit = '%', step = 1) =>
    `<div class="st-row col"><span>${label} <output data-o="${k}" data-u="${unit}"></output></span><input type="range" min="${min}" max="${max}" step="${step}" data-r="${k}"></div>`;
  const toggleRow = (k, label) => `<div class="st-row"><span>${label}</span><button class="st-tg" data-t="${k}"><i></i></button></div>`;
  const seg = (k, label, opts) => `<div class="st-row"><span>${label}</span><div class="st-seg" data-s="${k}">${opts.map(([v, t]) => `<button data-v="${v}">${t}</button>`).join('')}</div></div>`;

  const ui = el('div', 'nk-studio');
  ui.id = 'nk-studio';
  ui.innerHTML = `
    <div class="st-card">
      <header><b>zLyrics Stüdyo</b><button class="st-x" data-x title="Kapat">✕</button></header>
      <nav class="st-tabs"><i class="st-pill"></i>
        <button data-tab="tema">Tema</button><button data-tab="arayuz">Arayüz</button><button data-tab="sozler">Sözler</button><button data-tab="hareket">Hareket</button>
      </nav>
      <div class="st-page" data-page="tema">
        <section>
          <h4>Hazır temalar</h4>
          <div class="st-themes">${NK_THEMES.map((t, i) => `<button data-theme="${i}" style="--a:${t.c[0]};--b:${t.c[1]}"><i></i><span>${t.name}</span></button>`).join('')}</div>
        </section>
        <section>
          <h4>Vurgu rengi</h4>
          <div class="st-sw">${NK_SWATCHES.map(([n, c]) => `<button data-c="${c}" title="${n}" style="--c:${c}"></button>`).join('')}<label class="st-custom" title="Özel renk"><input type="color"><span>+</span></label></div>
          ${toggleRow('follow', 'Kapak rengine uy')}
        </section>
      </div>
      <div class="st-page" data-page="arayuz">
        <section>
          <h4>Paneller</h4>
          ${range('panel', 'Koyuluk', 15, 95)}
          ${range('radius', 'Panel köşeleri', 6, 40, 'px')}
          ${range('win', 'Pencere köşeleri', 0, 48, 'px')}
          ${range('rim', 'Kenar ışığı', 0, 100)}
          ${range('shadow', 'Gölge derinliği', 0, 100)}
        </section>
        <section>
          <h4>Arka plan</h4>
          ${range('glow', 'Işık', 0, 100)}
          ${toggleRow('art', 'Bulanık kapak')}
        </section>
        <section>
          <h4>Yazı</h4>
          ${seg('font', 'Yazı tipi', [['geist', 'Geist'], ['inter', 'Inter'], ['spotify', 'Spotify']])}
        </section>
      </div>
      <div class="st-page" data-page="sozler">
        <section>
          <h4>Yazı</h4>
          ${seg('lfont', 'Yazı tipi', [['geist', 'Geist'], ['inter', 'Inter'], ['serif', 'Serif']])}
          ${range('lsize', 'Boyut', 70, 140)}
          ${range('lweight', 'Kalınlık', 400, 900, '', 50)}
          ${range('lgap', 'Satır aralığı', 10, 80, '')}
        </section>
        <section>
          <h4>Satırlar</h4>
          ${range('ldim', 'Pasif satır görünürlüğü', 8, 70)}
          ${range('lblur', 'Pasif satır bulanıklığı', 0, 100)}
          ${range('lglow', 'Aktif satır parlaması', 0, 100)}
          ${toggleRow('llift', 'Söylenen kelime kalksın')}
          ${seg('kfill', 'Karaoke dolumu', [['accent', 'Vurgu'], ['white', 'Beyaz']])}
        </section>
        <section>
          <h4>Arka plan</h4>
          ${seg('lbg', 'Tür', [['art', 'Kapak'], ['color', 'Renkli'], ['black', 'Sade']])}
          ${range('lshade', 'Karartma', 0, 80)}
          ${seg('mic', 'Mikrofon butonu', [['side', 'Sağ panel'], ['full', 'Tam ekran']])}
        </section>
      </div>
      <div class="st-page" data-page="hareket">
        <section>
          ${toggleRow('motion', 'Hareketli arka plan')}
          ${toggleRow('anim', 'Sayfa ve kart animasyonları')}
          <p class="st-note">İkisini de kapatmak eski bilgisayarlarda en çok rahatlatan ayardır.</p>
        </section>
      </div>
      <footer>
        <button class="st-btn" data-reset>Varsayılana dön</button>
        <button class="st-btn warn" data-orig></button>
      </footer>
    </div>`;
  document.body.append(ui);
  const $s = (s) => ui.querySelector(s);

  const accentNow = () => (cfg.follow && albumAccent ? albumAccent : cfg.accent);

  // pencere köşesi yerel izleyiciye (round.ps1) iletilir; izleyici yoksa sessizce geçer
  let lastWin = null;
  function sendWin() {
    const r = cfg.original ? 0 : cfg.win;
    if (r === lastWin) return;
    lastWin = r;
    fetch(`http://127.0.0.1:${NK_WIN_PORT}/radius?v=${r}`, { mode: 'no-cors' }).catch(() => {});
  }

  function apply() {
    const html = de.classList;
    const st = de.style;
    html.toggle('nk-original', cfg.original);
    document.querySelectorAll('link.userCSS').forEach((l) => (l.disabled = cfg.original));
    amb.style.display = cfg.original ? 'none' : '';
    const props = ['--nk-accent', '--nk-accent-hi', '--nk-r', '--nk-panel-a', '--nk-glow', '--nk-rim-a', '--nk-shadow-a', '--nk-font',
      '--spice-button', '--spice-rgb-button', '--essential-bright-accent', '--spice-notification'];
    if (cfg.original) {
      props.forEach((p) => st.removeProperty(p));
    } else {
      const a = accentNow();
      const [h, s, l] = nkHex2Hsl(a);
      const hi = s < 0.08 ? '#ffffff' : nkHsl2Hex(h, Math.min(1, s + 0.05), Math.min(0.68, l + 0.22));
      st.setProperty('--nk-accent', a);
      st.setProperty('--nk-accent-hi', hi);
      st.setProperty('--nk-r', cfg.radius + 'px');
      st.setProperty('--nk-panel-a', (cfg.panel / 100).toFixed(2));
      st.setProperty('--nk-glow', (cfg.glow / 100).toFixed(2));
      st.setProperty('--nk-rim-a', (cfg.rim / 100).toFixed(2));
      st.setProperty('--nk-shadow-a', (cfg.shadow / 100).toFixed(2));
      st.setProperty('--nk-font', NK_FONTS[cfg.font] || NK_FONTS.geist);
      st.setProperty('--spice-button', hi);
      st.setProperty('--spice-rgb-button', nkRgb(hi));
      st.setProperty('--essential-bright-accent', hi);
      st.setProperty('--spice-notification', a);

      // söz ekranı: değişkenler yalnızca kendi köküne (Spotify'ın sayfası yeniden hesaplanmaz)
      const rs = root.style;
      rs.setProperty('--accent', a);
      rs.setProperty('--accent-hi', hi);
      rs.setProperty('--l-font', NK_FONTS[cfg.lfont] || NK_FONTS.geist);
      rs.setProperty('--l-scale', (cfg.lsize / 100).toFixed(2));
      rs.setProperty('--l-weight', cfg.lweight);
      rs.setProperty('--l-weight2', Math.min(900, cfg.lweight + 100)); // karaoke/odak bir kademe kalın
      root.toggleAttribute('data-lglow', cfg.lglow > 0); // 0'ken filtre katmanı hiç oluşmasın
      rs.setProperty('--l-gap', (cfg.lgap / 100).toFixed(2));
      rs.setProperty('--l-dim', (cfg.ldim / 100).toFixed(2));
      rs.setProperty('--l-blur', (cfg.lblur / 100).toFixed(2));
      rs.setProperty('--l-glow', (cfg.lglow / 100).toFixed(2));
      rs.setProperty('--l-lift', cfg.llift ? 1 : 0);
      rs.setProperty('--l-shade', (cfg.lshade / 100).toFixed(2));
      rs.setProperty('--l-rad', cfg.radius + 'px');
      rs.setProperty('--kfill', cfg.kfill === 'white' ? '#ffffff' : hi);
      root.dataset.lbg = cfg.lbg;
      root.dispatchEvent(new CustomEvent('zl-style'));
    }
    html.toggle('nk-noart', !cfg.art);
    html.toggle('nk-still', !cfg.motion);
    html.toggle('nk-noanim', !cfg.anim);
    html.toggle('nk-font-spotify', cfg.font === 'spotify');
    sendWin();
    sync();
  }

  function sync() {
    ui.querySelectorAll('.st-sw [data-c]').forEach((b) => b.classList.toggle('on', !cfg.follow && b.dataset.c.toLowerCase() === cfg.accent.toLowerCase()));
    $s('.st-custom input').value = cfg.accent;
    ui.querySelectorAll('[data-t]').forEach((b) => b.classList.toggle('on', !!cfg[b.dataset.t]));
    ui.querySelectorAll('[data-r]').forEach((r) => (r.value = cfg[r.dataset.r]));
    ui.querySelectorAll('[data-o]').forEach((o) => {
      const k = o.dataset.o, v = cfg[k];
      o.textContent = k === 'win' && v <= 8 ? 'Windows' : v + o.dataset.u;
    });
    ui.querySelectorAll('[data-s]').forEach((sg) => sg.querySelectorAll('button').forEach((b) => b.classList.toggle('on', cfg[sg.dataset.s] === b.dataset.v)));
    $s('[data-orig]').textContent = cfg.original ? 'zLyrics temasını geri aç' : "Spotify'ı orijinale al";
    ui.classList.toggle('orig', cfg.original);
    ui.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    ui.querySelectorAll('[data-page]').forEach((p) => (p.hidden = p.dataset.page !== tab));
    requestAnimationFrame(() => {
      const b = $s(`[data-tab="${tab}"]`), pill = $s('.st-pill');
      if (b && b.offsetWidth) { pill.style.left = b.offsetLeft + 'px'; pill.style.width = b.offsetWidth + 'px'; }
    });
  }

  const set = (patch) => {
    cfg = { ...cfg, ...patch };
    store.set('studio', cfg);
    apply();
  };

  ui.addEventListener('click', (e) => {
    const t = e.target;
    if (t === ui || t.closest('[data-x]')) return toggle(false);
    const tb = t.closest('[data-tab]');
    if (tb) { tab = tb.dataset.tab; return sync(); }
    const th = t.closest('[data-theme]');
    if (th) return set({ ...NK_THEMES[+th.dataset.theme].set, follow: false });
    const c = t.closest('[data-c]');
    if (c) return set({ accent: c.dataset.c, follow: false });
    const tg = t.closest('[data-t]');
    if (tg) return set({ [tg.dataset.t]: !cfg[tg.dataset.t] });
    const sb = t.closest('[data-s] button');
    if (sb) return set({ [sb.parentElement.dataset.s]: sb.dataset.v });
    if (t.closest('[data-reset]')) return set({ ...NK_DEFAULTS });
    if (t.closest('[data-orig]')) return set({ original: !cfg.original });
  });
  // kaydırıcılar: sürüklerken canlı, karede en fazla bir kez
  let raf = 0;
  ui.addEventListener('input', (e) => {
    const r = e.target.closest('[data-r]');
    if (r) {
      cfg[r.dataset.r] = +r.value;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => set({}));
    } else if (e.target.type === 'color') {
      cancelAnimationFrame(raf);
      const v = e.target.value;
      raf = requestAnimationFrame(() => set({ accent: v, follow: false }));
    }
  });

  function toggle(on) {
    ui.classList.toggle('open', typeof on === 'boolean' ? on : !ui.classList.contains('open'));
    if (ui.classList.contains('open')) sync();
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ui.classList.contains('open')) { e.stopImmediatePropagation(); toggle(false); }
  }, true);

  try {
    new Spicetify.Topbar.Button('zLyrics Stüdyo', NK_PALETTE, () => toggle(), false);
  } catch {}

  apply();
  // izleyici Spotify'dan sonra başlamış olabilir: birkaç kez daha bildir
  [3000, 10000].forEach((ms) => setTimeout(() => { lastWin = null; sendWin(); }, ms));

  return {
    get cfg() { return cfg; },
    toggle,
    open(t) { if (t) tab = t; toggle(true); },
    // kapaktan gelen canlı renk: koyu/soluk olsa bile vurgu olarak okunacak hale getir
    albumColor(hex) {
      if (!hex) return;
      const [h, s, l] = nkHex2Hsl(hex);
      albumAccent = nkHsl2Hex(h, Math.max(0.55, s), Math.min(0.48, Math.max(0.36, l)));
      if (cfg.follow && !cfg.original) apply();
    },
  };
}
