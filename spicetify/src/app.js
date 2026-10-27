// zLyrics — Spotify (Spicetify) eklentisi.
// Ortak söz motoru (flow/karaoke/focus) build.py ile bu dosyanın önüne eklenir.
//
// Görünümler: closed | side (sağ panelde, Spotify kullanılabilir kalır) |
//            embed (Spotify'ın söz sayfasında, ana panelin içinde) | full (tam pencere)

const sv = (body, fill) => `<svg viewBox="0 0 24 24"${fill ? '' : ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'}>${body}</svg>`;
const SVG = {
  play: sv('<path d="M8 5.6v12.8c0 .8.9 1.3 1.6.9l10.2-6.4c.6-.4.6-1.4 0-1.8L9.6 4.7C8.9 4.3 8 4.8 8 5.6Z" fill="currentColor"/>', 1),
  pause: sv('<rect x="6.5" y="5" width="3.6" height="14" rx="1.3" fill="currentColor"/><rect x="13.9" y="5" width="3.6" height="14" rx="1.3" fill="currentColor"/>', 1),
  next: sv('<path d="M4 7.2v9.6c0 .7.8 1.1 1.4.7l7-4.8c.5-.3.5-1.1 0-1.4l-7-4.8C4.8 6.1 4 6.5 4 7.2Zm8.5 0v9.6c0 .7.8 1.1 1.4.7l7-4.8c.5-.3.5-1.1 0-1.4l-7-4.8c-.6-.4-1.4 0-1.4.7Z" fill="currentColor"/>', 1),
  prev: sv('<path d="M20 7.2v9.6c0 .7-.8 1.1-1.4.7l-7-4.8c-.5-.3-.5-1.1 0-1.4l7-4.8c.6-.4 1.4 0 1.4.7Zm-8.5 0v9.6c0 .7-.8 1.1-1.4.7l-7-4.8c-.5-.3-.5-1.1 0-1.4l7-4.8c.6-.4 1.4 0 1.4.7Z" fill="currentColor"/>', 1),
  down: sv('<path d="m6 9.5 6 6 6-6"/>'),
  tune: sv('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>'),
  expand: sv('<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>'),
  shrink: sv('<path d="M20 10h-6V4M4 14h6v6M14 10l7-7M10 14l-7 7"/>'),
  fs: sv('<path d="M4.5 9V5.8c0-.7.6-1.3 1.3-1.3H9M15 4.5h3.2c.7 0 1.3.6 1.3 1.3V9M19.5 15v3.2c0 .7-.6 1.3-1.3 1.3H15M9 19.5H5.8c-.7 0-1.3-.6-1.3-1.3V15"/>'),
  heart: sv('<path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z"/>'),
  heartOn: sv('<path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" fill="currentColor"/>', 1),
  shuffle: sv('<path d="M16 4h4v4M4 19 20 4M20 16v4h-4M15 15l5 5M4 5l5 5"/>'),
  repeat: sv('<path d="M17 2.5 20.5 6 17 9.5"/><path d="M3.5 11V9.5A3.5 3.5 0 0 1 7 6h13.5M7 21.5 3.5 18 7 14.5"/><path d="M20.5 13v1.5A3.5 3.5 0 0 1 17 18H3.5"/>'),
  vol: sv('<path d="M4 9.5v5c0 .6.4 1 1 1h2.6l4.1 3.4c.7.5 1.6.1 1.6-.8V5.9c0-.8-.9-1.3-1.6-.8L7.6 8.5H5c-.6 0-1 .4-1 1Z" fill="currentColor" stroke="none"/><path d="M16.3 9a4.2 4.2 0 0 1 0 6M18.8 6.5a7.8 7.8 0 0 1 0 11"/>'),
  mute: sv('<path d="M4 9.5v5c0 .6.4 1 1 1h2.6l4.1 3.4c.7.5 1.6.1 1.6-.8V5.9c0-.8-.9-1.3-1.6-.8L7.6 8.5H5c-.6 0-1 .4-1 1Z" fill="currentColor" stroke="none"/><path d="m16.5 9.5 5 5m0-5-5 5"/>'),
  tr: sv('<path d="M3 5h9M7.5 3v2M5 5c.6 3 2.6 5.4 5.5 6.5M10 5c-.8 3.5-3 6-6.5 7.5M13 21l4-10 4 10M14.4 17.5h5.2"/>'),
  cover: sv('<rect x="3" y="5" width="8" height="8" rx="2"/><path d="M14 7h7M14 11h7M3 17h18M3 21h12"/>'),
};
const MODES = ['flow', 'karaoke', 'focus'];
const MODE_TR = { flow: 'Akış', karaoke: 'Karaoke', focus: 'Odak' };

function nkMain() {
  const P = Spicetify.Player;
  // Spotify yeni açılıp henüz parça yüklenmemişken oynatıcı fonksiyonları hata fırlatıyor;
  // açılışta tek bir hata tüm eklentiyi durduruyordu.
  const safe = (fn, d) => { try { return fn(); } catch { return d; } };
  const playing = () => safe(() => P.isPlaying(), false);
  const H = Spicetify.Platform.History;
  const S = {
    view: 'closed',
    mode: store.get('mode', 'flow'),
    size: store.get('size', 'm'),
    align: store.get('align', 'left'),
    bg: store.get('bg', 'live'),
    pulse: store.get('pulse', true),
    cover: store.get('cover', false),
    tr: store.get('tr', false),
    offsets: store.get('offsets', {}),
    uri: null,
    meta: null,
    lyr: null,
    prep: null,
    token: 0,
    cache: new Map(),
    trCache: new Map(),
    beats: null,
    nextShownFor: null,
  };

  /* ───────────── DOM */
  const root = el('div', 'nk asleep');
  root.id = 'zlyrics';
  root.dataset.view = 'closed';
  root.innerHTML = `
    <div class="nk-amb">
      <canvas class="nk-art" width="40" height="40"></canvas><canvas class="nk-art" width="40" height="40"></canvas>
      <div class="nk-blobs"><div class="nk-blob b1"></div><div class="nk-blob b2"></div><div class="nk-blob b3"></div><div class="nk-blob b4"></div></div>
      <div class="nk-pulse"></div>
      <div class="nk-shade"></div><div class="nk-grain"></div>
    </div>
    <div class="nk-top nk-chrome">
      <button class="nk-ib nk-glass only-full" data-a="shrink" title="Küçült (Esc)">${SVG.down}</button>
      <div class="nk-now"><img alt=""><div><b></b><span></span></div></div>
      <div class="nk-modes nk-glass"><i class="nk-pill"></i>${MODES.map((m) => `<button data-mode="${m}">${MODE_TR[m]}</button>`).join('')}</div>
      <div class="nk-tools nk-glass">
        <button class="nk-ib sm" data-a="queue" title="Sıradakiler (Q)">${DR_SVG.queue}</button>
        <button class="nk-ib sm" data-a="search" title="Ara (/)">${DR_SVG.search}</button>
        <button class="nk-ib sm" data-a="tr" title="Çeviri (T)">${SVG.tr}</button>
        <button class="nk-ib sm" data-a="settings" title="Görünüm">${SVG.tune}</button>
        <button class="nk-ib sm only-embed" data-a="expand" title="Tam ekran (F)">${SVG.expand}</button>
      </div>
    </div>
    <div class="nk-cover"><img alt=""><b></b><span></span></div>
    <div class="nk-host">
      <div class="nk-layer flow" data-l="flow"></div>
      <div class="nk-layer karaoke" data-l="karaoke"></div>
      <div class="nk-layer focus" data-l="focus"></div>
      <div class="nk-layer nk-plain" data-l="plain"></div>
      <div class="nk-layer nk-empty" data-l="empty"><img alt=""><p></p></div>
      <div class="nk-loader"><i></i><i></i><i></i></div>
    </div>
    <div class="nk-dock nk-glass nk-chrome only-full">
      <div class="nk-ctrl">
        <button class="nk-ib ghost sm" data-a="shuffle" title="Karıştır">${SVG.shuffle}</button>
        <button class="nk-ib ghost" data-a="prev">${SVG.prev}</button>
        <button class="nk-ib nk-play" data-a="play">${SVG.play}</button>
        <button class="nk-ib ghost" data-a="next">${SVG.next}</button>
        <button class="nk-ib ghost sm" data-a="repeat" title="Tekrarla">${SVG.repeat}<i class="nk-one">1</i></button>
      </div>
      <div class="nk-time"><span class="nk-t cur">0:00</span><div class="nk-bar seek"><div class="nk-fill"></div></div><span class="nk-t dur">0:00</span></div>
      <div class="nk-side">
        <button class="nk-ib ghost sm" data-a="heart" title="Beğen">${SVG.heart}</button>
        <div class="nk-vol"><button class="nk-ib ghost sm" data-a="mute">${SVG.vol}</button><div class="nk-bar vol"><div class="nk-fill"></div></div></div>
        <button class="nk-ib ghost sm" data-a="coverToggle" title="Kapak düzeni (C)">${SVG.cover}</button>
        <button class="nk-ib ghost sm" data-a="fs" title="Pencereyi tam ekran yap">${SVG.fs}</button>
      </div>
    </div>
    <div class="nk-next nk-glass"><img alt=""><div><small>Sıradaki</small><b></b><span></span></div></div>
    <div class="nk-panel nk-glass">
      <div class="nk-row"><label>Senkron</label><div class="nk-seg"><button data-off="-0.1">−</button><output>0.0s</output><button data-off="0.1">+</button></div></div>
      <div class="nk-row"><label>Yazı boyutu</label><div class="nk-seg" data-k="size"><button data-v="s">S</button><button data-v="m">M</button><button data-v="l">L</button></div></div>
      <div class="nk-row"><label>Hizalama</label><div class="nk-seg" data-k="align"><button data-v="left">Sol</button><button data-v="center">Orta</button></div></div>
      <div class="nk-row"><label>Ritim nabzı</label><button class="nk-switch" data-sw="pulse"><i></i></button></div>
      <div class="nk-row"><label>Kapak düzeni</label><button class="nk-switch" data-sw="cover"><i></i></button></div>
      <div class="nk-row"><label>Çeviri</label><button class="nk-switch" data-sw="tr"><i></i></button></div>
      <button class="nk-more" data-a="studio">Yazı, renk, arka plan… <b>Stüdyo'da aç</b></button>
      <p class="nk-keys"><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> mod · <kbd>T</kbd> çeviri · <kbd>C</kbd> kapak · <kbd>F</kbd> tam ekran · <kbd>[</kbd><kbd>]</kbd> senkron · <kbd>Esc</kbd></p>
      <p class="nk-src"></p>
    </div>
    <div class="nk-toast nk-glass"></div>`;
  document.body.append(root);

  // Tema arka planı: Spotify'ın arkasında, kapak + iki renk ışığı.
  // Renkler sadece bu birkaç elemente yazılır; :root'a yazmak 7000 elementi her karede yeniden hesaplatıyordu.
  const amb = el('div');
  amb.id = 'nk-ambient';
  amb.innerHTML = '<canvas class="art" width="40" height="40"></canvas><canvas class="art" width="40" height="40"></canvas>' +
    '<canvas class="g g1" width="48" height="48"></canvas><canvas class="g g2" width="48" height="48"></canvas><i class="g3"></i>';
  // Hareketli ışıklar küçük tuvale radyal degrade olarak çizilir (CSS büyütür). Renk değişiminde
  // eski -> yeni 0.7 sn'de karışır; yalnızca bu sırada iki 48px tuval güncellenir.
  const glows = [...amb.querySelectorAll('canvas.g')].map((c) => ({ c, x: c.getContext('2d'), from: '#3a0014', to: '#3a0014' }));
  glows[1].from = glows[1].to = '#1a0008';
  const drawGlow = (g, color, alpha) => {
    const s = g.c.width, gr = g.x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, color);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.x.globalAlpha = alpha;
    g.x.fillStyle = gr;
    g.x.fillRect(0, 0, s, s);
  };
  let glowRaf = 0;
  const setGlows = (cols) => {
    cancelAnimationFrame(glowRaf);
    glows.forEach((g, i) => { g.from = g.to; g.to = cols[i] || g.to; });
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 700);
      for (const g of glows) {
        g.x.clearRect(0, 0, g.c.width, g.c.height);
        drawGlow(g, g.from, 1 - k);
        drawGlow(g, g.to, k);
      }
      if (k < 1) glowRaf = requestAnimationFrame(step);
    };
    glowRaf = requestAnimationFrame(step);
  };
  glows.forEach((g) => drawGlow(g, g.to, 1));
  document.body.prepend(amb);

  const studio = nkStudio({ root, amb });
  // Stüdyo söz ayarlarını değiştirince satır aralığı vs. değişir: Akış yeniden ölçsün
  root.addEventListener('zl-style', () => requestAnimationFrame(() => R.flow.measure(false)));

  const q = (s) => root.querySelector(s);
  const pulseEl = root.querySelector('.nk-pulse');
  const blobsEl = root.querySelector('.nk-blobs');
  const coverImg = root.querySelector('.nk-cover img');
  const seekFill = root.querySelector('.nk-bar.seek .nk-fill');
  const L = {};
  root.querySelectorAll('[data-l]').forEach((n) => (L[n.dataset.l] = n));

  const R = {
    flow: new Flow(L.flow, { onSeek: (t) => seek(t - offset()) }),
    karaoke: new Karaoke(L.karaoke),
    focus: new Focus(L.focus),
  };
  R.flow.paused = true;

  /* ───────────── saat: Spotify'ın ilerlemesini kare kare yumuşat */
  let disp = 0, lastNow = performance.now();
  function tick() {
    const now = performance.now();
    const dt = Math.min(0.25, (now - lastNow) / 1000);
    lastNow = now;
    const raw = (safe(() => P.getProgress(), 0) || 0) / 1000;
    if (playing()) {
      disp += dt;
      const err = raw - disp;
      if (Math.abs(err) > 0.35) disp = raw;
      else disp += err * Math.min(1, dt * 5);
    } else disp = raw;
    return disp;
  }

  const offset = () => S.offsets[S.uri] || 0;
  function seek(t) {
    P.seek(Math.max(0, t) * 1000);
    disp = Math.max(0, t);
    if (!playing()) P.play();
  }

  /* ───────────── parça bilgisi */
  const img = (u) => (u || '').replace(/^spotify:image:/, 'https://i.scdn.co/image/');

  function readMeta() {
    const it = P.data?.item;
    if (!it) return null;
    const m = it.metadata || {};
    return {
      uri: it.uri,
      id: (it.uri || '').split(':')[2],
      title: it.name || m.title || '',
      artist: it.artists?.map((a) => a.name).join(', ') || m.artist_name || '',
      album: it.album?.name || m.album_title || '',
      image: img(m.image_xlarge_url || m.image_large_url || it.album?.images?.[0]?.url || m.image_url),
      duration: (it.duration?.milliseconds || +m.duration || 0) / 1000,
    };
  }

  /* ───────────── sözler */
  function finalize(lines) {
    const out = [];
    for (const l of lines) {
      const txt = (l.text || '').trim();
      if (!txt || /^[♪♫♬\s.…]+$/.test(txt)) {
        if (out.length && !(out[out.length - 1].end > 0)) out[out.length - 1].end = l.t;
        continue;
      }
      out.push({ ...l, text: txt });
    }
    return out;
  }

  function parseLrc(text) {
    const out = [];
    for (const raw of (text || '').split(/\r?\n/)) {
      const st = [...raw.matchAll(/\[(\d+):(\d+(?:[.:]\d+)?)\]/g)];
      if (!st.length) continue;
      const last = st[st.length - 1];
      const body = raw.slice(last.index + last[0].length).replace(/<\d+:\d+(?:[.:]\d+)?>/g, '').replace(/\s+/g, ' ').trim();
      for (const s of st) out.push({ t: +s[1] * 60 + parseFloat(s[2].replace(':', '.')), text: body });
    }
    return finalize(out.sort((a, b) => a.t - b.t));
  }

  // Spotify hece zamanlaması verdiyse kelime başlangıçlarını ondan çıkar
  function syllableWords(line) {
    const syl = line.syllables;
    if (!syl?.length) return undefined;
    const times = [];
    let pos = 0;
    for (const s of syl) {
      const n = +(s.numChars ?? s.charCount ?? 0);
      if (!n) return undefined;
      for (let k = 0; k < n; k++) times[pos + k] = +s.startTimeMs / 1000;
      pos += n;
    }
    const words = [];
    for (const m of line.words.matchAll(/\S+/g)) {
      const t = times[m.index];
      if (t == null) return undefined;
      words.push({ t, text: m[0] });
    }
    return words;
  }

  async function spotifyLyrics(m) {
    const r = await Spicetify.CosmosAsync.get(
      `https://spclient.wg.spotify.com/color-lyrics/v2/track/${m.id}?format=json&vocalRemoval=false&market=from_token`);
    const ly = r?.lyrics;
    if (!ly?.lines?.length) return null;
    const base = { source: ly.providerDisplayName || 'Spotify', lang: ly.language };
    if (ly.syncType === 'UNSYNCED') return { ...base, synced: false, plain: ly.lines.map((l) => l.words).join('\n') };
    const lines = ly.lines.map((l) => {
      const end = +l.endTimeMs / 1000;
      return { t: +l.startTimeMs / 1000, end: end > 0 ? end : undefined, text: l.words, words: syllableWords(l) };
    });
    return { ...base, synced: true, lines: finalize(lines) };
  }

  async function lrclib(m) {
    const p = new URLSearchParams({ track_name: m.title, artist_name: m.artist.split(',')[0], album_name: m.album, duration: Math.round(m.duration) });
    let r = await fetch('https://lrclib.net/api/get?' + p).then((x) => (x.ok ? x.json() : null)).catch(() => null);
    if (!r?.syncedLyrics) {
      const list = await fetch('https://lrclib.net/api/search?' + new URLSearchParams({ track_name: m.title, artist_name: m.artist.split(',')[0] }))
        .then((x) => (x.ok ? x.json() : [])).catch(() => []);
      r = list.find((x) => x.syncedLyrics && Math.abs((x.duration || 0) - m.duration) < 8) || r || list.find((x) => x.plainLyrics);
    }
    if (r?.syncedLyrics) return { synced: true, lines: parseLrc(r.syncedLyrics), source: 'LRCLIB' };
    if (r?.plainLyrics) return { synced: false, plain: r.plainLyrics, source: 'LRCLIB' };
    if (r?.instrumental) return { synced: false, instrumental: true };
    return null;
  }

  async function loadLyrics(m) {
    const token = ++S.token;
    S.lyr = null;
    S.prep = null;
    root.classList.add('loading');
    showLayer();
    let res = S.cache.get(m.uri);
    if (!res) {
      res = await spotifyLyrics(m).catch(() => null);
      if (!res?.synced) res = (await lrclib(m).catch(() => null)) || res;
      res = res || { synced: false };
      S.cache.set(m.uri, res);
      if (S.cache.size > 40) S.cache.delete(S.cache.keys().next().value); // bellek: en eski 40'ı tut
    }
    if (token !== S.token) return;
    root.classList.remove('loading');
    S.lyr = res;
    if (res.synced && res.lines?.length) {
      S.prep = prepare(res.lines, m.duration);
      Object.values(R).forEach((r) => r.mount(S.prep));
      if (S.tr) translate();
    } else {
      res.synced = false;
      Object.values(R).forEach((r) => r.mount(null));
      L.plain.textContent = '';
      if (res.plain) L.plain.append(el('small', null, 'Senkron söz yok · düz metin'), document.createTextNode(res.plain));
    }
    q('.nk-empty p').textContent = res.instrumental ? 'Enstrümantal' : 'Bu şarkı için söz bulunamadı';
    q('.nk-src').textContent = res.source ? `Sözler: ${res.source}` : '';
    showLayer();
  }

  function showLayer() {
    let on = null;
    if (S.lyr) on = S.lyr.synced ? S.mode : S.lyr.plain ? 'plain' : 'empty';
    Object.entries(L).forEach(([k, n]) => n.classList.toggle('on', k === on));
    if (S.lyr?.synced && S.view !== 'closed') R[S.mode].show();
  }

  /* ───────────── çeviri: Türkçe şarkı -> İngilizce, diğerleri -> Türkçe */
  async function gtx(text, tl) {
    const r = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&dt=t&tl=' + tl + '&q=' + encodeURIComponent(text));
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    return { text: (d[0] || []).map((x) => x[0]).join(''), src: d[2] };
  }

  async function translate() {
    const prep = S.prep, uri = S.uri;
    if (!prep) return;
    let trs = S.trCache.get(uri);
    if (!trs) {
      const src = prep.lines.map((l) => l.text).join('\n');
      try {
        let tl = S.lyr.lang === 'tr' ? 'en' : 'tr';
        let r = await gtx(src, tl);
        if (r.src === tl) r = await gtx(src, (tl = tl === 'tr' ? 'en' : 'tr'));
        trs = r.text.split('\n').map((x) => x.trim());
        S.trCache.set(uri, trs);
        if (S.trCache.size > 40) S.trCache.delete(S.trCache.keys().next().value);
      } catch {
        toast('Çeviri alınamadı');
        return;
      }
    }
    if (S.prep !== prep || !S.tr) return;
    prep.lines.forEach((l, i) => {
      const t = trs[i];
      l.tr = t && t.toLocaleLowerCase() !== l.text.toLocaleLowerCase() ? t : undefined;
    });
    Object.values(R).forEach((r) => r.annotate?.());
  }

  function setTr(on) {
    S.tr = on;
    store.set('tr', on);
    root.classList.toggle('tr-on', on);
    syncSwitches();
    if (on) translate();
    else if (S.prep) {
      S.prep.lines.forEach((l) => (l.tr = undefined));
      Object.values(R).forEach((r) => r.annotate?.());
    }
  }

  /* ───────────── renkler: kapaktan, koyulaştırılmış; Spotify temasına da yayılır */
  function hexToHsl(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l];
    const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
  }
  const deep = (hex, lMin = 16, lMax = 34) => {
    const [h, s, l] = hexToHsl(hex);
    return `hsl(${h.toFixed(0)} ${Math.min(95, s * 100 + 10).toFixed(0)}% ${clamp(l * 60, lMin, lMax).toFixed(0)}%)`;
  };

  // Kapak küçük bir tuvale bir kez bulanık çizilir, CSS ile büyütülür:
  // her karede dev bir katmana blur uygulamaktan yüzlerce kat ucuz.
  function paintArt(canvas, src) {
    return new Promise((res) => {
      const im = new Image();
      im.onload = () => {
        const x = canvas.getContext('2d');
        // parlaklık burada bir kez uygulanır: CSS filter ekran boyutunda ayrı bir yüzey (ekran kartı belleği) istiyordu
        x.filter = 'blur(2px) saturate(1.6) brightness(.55)';
        x.clearRect(0, 0, canvas.width, canvas.height);
        x.drawImage(im, -4, -4, canvas.width + 8, canvas.height + 8);
        // yumuşak kenar tuvalin içine çizilir: CSS maskesi ekran boyutunda ayrı bir katman (bellek) istiyordu
        const w = canvas.width, g = x.createRadialGradient(w / 2, w / 2, w * 0.18, w / 2, w / 2, w / 2);
        g.addColorStop(0, '#000');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        x.filter = 'none';
        x.globalCompositeOperation = 'destination-in';
        x.fillStyle = g;
        x.fillRect(0, 0, w, w);
        x.globalCompositeOperation = 'source-over';
        res(true);
      };
      im.onerror = () => res(false);
      im.src = src;
    });
  }

  let flip = false;
  let colorTok = 0;
  async function setColors(m) {
    const tok = ++colorTok;
    let cols = ['hsl(340 100% 22%)', 'hsl(345 80% 14%)', 'hsl(335 90% 18%)'];
    try {
      const c = await Spicetify.colorExtractor(m.uri);
      if (c && tok === colorTok) {
        cols = [deep(c.VIBRANT || c.PROMINENT), deep(c.DARK_VIBRANT || c.DESATURATED), deep(c.PROMINENT || c.VIBRANT_NON_ALARMING)];
        studio.albumColor(c.VIBRANT || c.PROMINENT);
      }
    } catch {}
    if (tok !== colorTok) return;
    root.querySelectorAll('.nk-blob:not(.b4)').forEach((b, i) => (b.style.color = cols[i]));
    setGlows(cols);
    coverImg.style.boxShadow = `0 50px 90px -30px rgba(0,0,0,.95), 0 0 0 1px rgba(255,255,255,.06), 0 0 120px -20px ${cols[0]}`;
    flip = !flip;
    for (const box of [root, amb]) {
      const arts = box.querySelectorAll(box === amb ? 'canvas.art' : 'canvas.nk-art');
      const on = arts[flip ? 0 : 1], off = arts[flip ? 1 : 0];
      paintArt(on, m.image).then((ok) => {
        if (!ok || tok !== colorTok) return;
        on.classList.add('on');
        off.classList.remove('on');
      });
    }
  }

  /* ───────────── ritim */
  let beatTok = 0;
  async function loadBeats(m) {
    const tok = ++beatTok;
    S.beats = null;
    if (!S.pulse) return;
    try {
      const a = await Spicetify.getAudioData(m.uri);
      if (tok !== beatTok) return;
      S.beats = (a?.beats || []).map((b) => ({ t: b.start, c: b.confidence ?? 0.6 }));
    } catch {}
  }

  function onSong() {
    const m = readMeta();
    if (!m || m.uri === S.uri) return;
    S.uri = m.uri;
    S.meta = m;
    S.nextShownFor = null;
    q('.nk-next').classList.remove('show');
    q('.nk-now img').src = m.image;
    q('.nk-now b').textContent = m.title;
    q('.nk-now span').textContent = m.artist;
    q('.nk-cover img').src = m.image;
    q('.nk-cover b').textContent = m.title;
    q('.nk-cover span').textContent = m.artist;
    q('.nk-empty img').src = m.image;
    root.classList.remove('swap');
    void root.offsetWidth;
    root.classList.add('swap');
    updateOffset();
    setColors(m);
    loadBeats(m);
    loadLyrics(m);
  }

  /* ───────────── görünüm: kapalı / panel içi / tam pencere */
  const mainView = () => document.getElementById('main-view');
  const SIDE_W = 420;

  // sağ panel açıksa onun yerine oturur, kapalıysa sağda yüzen panel olur
  function sideRect() {
    const mv = mainView()?.getBoundingClientRect();
    const rp = document.getElementById('Desktop_PanelContainer_Id')?.getBoundingClientRect();
    const top = mv ? mv.top : 64, h = mv ? mv.height : innerHeight - 160;
    if (rp && rp.width > 240 && rp.height > 200) {
      // sağ panel bazı düzenlerde pencerenin en üstüne uzanıyor: ana alanla aynı hizada kal,
      // yoksa Windows'un küçült/büyüt/kapat düğmeleri panelin araçlarının üstüne biniyor
      const y = Math.max(rp.top, top), b = Math.min(rp.bottom, top + h);
      return { x: rp.left, y, width: rp.width, height: b - y };
    }
    return { x: innerWidth - SIDE_W - 8, y: top, width: SIDE_W, height: h };
  }

  function place() {
    let x = 0, y = 0, w = innerWidth, h = innerHeight;
    if (S.view === 'embed') {
      const mv = mainView();
      if (mv) ({ x, y, width: w, height: h } = mv.getBoundingClientRect());
    } else if (S.view === 'side') {
      ({ x, y, width: w, height: h } = sideRect());
    }
    const st = root.style;
    st.setProperty('--x', x + 'px');
    st.setProperty('--y', y + 'px');
    st.setProperty('--w', w + 'px');
    st.setProperty('--h', h + 'px');
  }

  // zLyrics'in altında kalan Spotify parçalarını çizim ve yerleşimden çıkar.
  // <html>'e sınıf eklemek tüm sayfanın stilini yeniden hesaplatıyordu; doğrudan ilgili elementlere yazılır.
  // content-visibility:hidden içeriği yerleşimden de düşürür (visibility:hidden düşürmüyordu, 6000+ element).
  // Gizleme/gösterme 6000+ elementi bir kez yeniden yerleştirir (~70-100 ms). Bu, panel tamamen
  // saydamken (morph'un ortası) yapılır: ekranda hareket eden bir şey yokken kaçan kare hissedilmez.
  let hideT = 0;
  function hideBehind(v, was) {
    const cv = (n, on) => n && (n.style.contentVisibility = on ? 'hidden' : '');
    clearTimeout(hideT);
    const applyNow = () => {
      if (S.view !== v) return;
      const full = v === 'full';
      cv(document.querySelector('.Root__top-container'), full);
      amb.style.visibility = full ? 'hidden' : '';
      cv(document.querySelector('#main-view .main-view-container'), v === 'embed');
      const rp = document.getElementById('Desktop_PanelContainer_Id');
      if (rp) [...rp.children].forEach((c) => cv(c, v === 'side'));
    };
    const morphing = was !== 'closed' && v !== 'closed';
    if (v === 'full') hideT = setTimeout(applyNow, morphing ? 135 : 450);
    else if (morphing) hideT = setTimeout(applyNow, 135);
    else applyNow();
    const drag = document.querySelector('.body-drag-top');
    if (drag) drag.style.webkitAppRegion = v === 'full' ? 'no-drag' : '';
    const mic = document.querySelector('[data-testid="lyrics-button"]');
    if (mic) mic.style.color = v === 'side' ? 'var(--nk-accent-hi, #ff3d6f)' : '';
  }

  const viewLog = [];
  window.zlyrics = { get view() { return S.view; }, log: viewLog };
  function setView(v) {
    viewLog.push(`${S.view}->${v} ${new Error().stack.split('\n').slice(2, 5).map((l) => l.trim().split(' ')[1]).join('<')}`);
    if (viewLog.length > 30) viewLog.shift();
    if (v === S.view) return;
    const was = S.view;
    S.view = v;
    root.dataset.view = v;
    hideBehind(v, was);
    if (v === 'full' && was !== 'full') S.back = was;
    R.flow.paused = v === 'closed';
    // tam ekrandan çıkınca pencere de tam ekrandan çıksın
    if (v !== 'full' && was === 'full' && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (v === 'closed') {
      root.classList.remove('idle');
      q('.nk-panel').classList.remove('open');
      drawers.close();
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      // bellek: kapalıyken söz DOM'u ve katmanları tutulmaz; açılınca önbellekten anında kurulur
      clearTimeout(S.freeT);
      S.freeT = setTimeout(() => {
        if (S.view !== 'closed') return;
        // uyku: görünmezken bile sonsuz animasyonlar katman ve kare üretmeye devam ediyordu (~75 MB)
        root.classList.add('asleep');
        Object.values(R).forEach((r) => r.mount(null));
        L.plain.textContent = '';
        S.prep = null;
        S.lyr = null;
        S.uri = null;
      }, 600);
      return;
    }
    if (was === 'closed') {
      // kapalıyken animasyonsuz yerine otur, sonra görünür ol
      clearTimeout(S.freeT);
      root.classList.remove('asleep');
      root.classList.add('jump');
      place();
      void root.offsetWidth;
      root.classList.remove('jump');
    } else morph();
    onSong();
    startLoop();
    requestAnimationFrame(movePill);
    showLayer();
    poke();
  }

  // Görünümler arası geçiş: boyutu canlandırmak yerine kısa çapraz geçiş.
  // left/top/width/height'i her karede değiştirmek tüm söz yerleşimini yeniden hesaplatıyordu.
  let morphT = 0;
  function morph() {
    clearTimeout(morphT);
    root.classList.add('morph');
    morphT = setTimeout(() => {
      root.classList.add('jump');
      place();
      void root.offsetWidth;
      root.classList.remove('jump');
      if (S.lyr?.synced) R[S.mode].show();
      requestAnimationFrame(() => root.classList.remove('morph'));
    }, 140);
  }

  const onLyricsRoute = () => H.location?.pathname === '/lyrics';
  // tam ekrandan küçülünce geldiği yere döner
  const shrink = () => setView(S.back === 'side' ? 'side' : onLyricsRoute() ? 'embed' : 'closed');
  const toggleFull = () => (S.view === 'full' ? shrink() : setView('full'));

  const docked = () => S.view === 'embed' || S.view === 'side';
  new ResizeObserver(() => docked() && place()).observe(document.body);
  window.addEventListener('resize', () => { if (S.view !== 'closed') place(); movePill(); });
  let mvObs = null;
  const watchMain = () => {
    const mv = mainView();
    if (!mv || mv === mvObs) return;
    mvObs = mv;
    new ResizeObserver(() => docked() && place()).observe(mv);
  };

  /* ───────────── mod & ayarlar */
  function setMode(m) {
    if (!MODES.includes(m)) return;
    S.mode = m;
    store.set('mode', m);
    root.dataset.mode = m;
    root.querySelectorAll('.nk-modes button').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
    movePill();
    showLayer();
  }
  function movePill() {
    const b = q(`.nk-modes button[data-mode="${S.mode}"]`);
    if (!b || !b.offsetWidth) return;
    const pill = q('.nk-pill');
    pill.style.left = b.offsetLeft + 'px';
    pill.style.width = b.offsetWidth + 'px';
  }
  // butonlar alan daralınca küçülüyor; vurgu her boyut değişiminde yeniden yerleşsin
  new ResizeObserver(() => movePill()).observe(q('.nk-modes'));
  q('.nk-modes').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) setMode(b.dataset.mode);
  });

  function updateOffset() {
    const o = offset();
    q('.nk-panel output').textContent = (o > 0 ? '+' : '') + o.toFixed(1) + 's';
  }
  function nudge(d) {
    if (!S.uri) return;
    const v = Math.round((offset() + d) * 10) / 10;
    if (v) S.offsets[S.uri] = v; else delete S.offsets[S.uri];
    store.set('offsets', S.offsets);
    updateOffset();
    toast(`Senkron ${(v > 0 ? '+' : '') + v.toFixed(1)}s`);
  }
  root.querySelectorAll('[data-off]').forEach((b) => (b.onclick = () => nudge(+b.dataset.off)));
  root.querySelectorAll('.nk-seg[data-k]').forEach((seg) => {
    const k = seg.dataset.k;
    const set = (v) => {
      S[k] = v;
      store.set(k, v);
      seg.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.v === v));
      root.dataset[k] = v;
      root.classList.toggle('align-center', S.align === 'center');
      requestAnimationFrame(() => R.flow.measure(false));
    };
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) set(b.dataset.v); });
    set(S[k]);
  });

  const SW = {
    pulse: (on) => { S.pulse = on; store.set('pulse', on); if (on && S.meta) loadBeats(S.meta); else { S.beats = null; setBeat(0); } },
    cover: (on) => { S.cover = on; store.set('cover', on); root.classList.toggle('cover', on); requestAnimationFrame(() => R.flow.measure(false)); },
    tr: setTr,
  };
  function syncSwitches() {
    root.querySelectorAll('[data-sw]').forEach((b) => b.classList.toggle('on', !!S[b.dataset.sw]));
    q('[data-a="tr"]').classList.toggle('on', S.tr);
    q('[data-a="coverToggle"]').classList.toggle('on', S.cover);
  }
  root.querySelectorAll('[data-sw]').forEach((b) => (b.onclick = () => { SW[b.dataset.sw](!S[b.dataset.sw]); syncSwitches(); }));
  root.classList.toggle('cover', S.cover);
  root.classList.toggle('tr-on', S.tr);
  syncSwitches();

  let toastT;
  function toast(msg) {
    const t = q('.nk-toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ───────────── kontroller */
  const drawers = nkDrawers({ root, P, toast, img });
  let lastVol = safe(() => P.getVolume(), 1) || 1;
  const actions = {
    queue: () => drawers.toggle('queue'),
    search: () => drawers.toggle('search'),
    shrink,
    expand: () => setView('full'),
    play: () => P.togglePlay(),
    next: () => P.next(),
    prev: () => P.back(),
    shuffle: () => P.toggleShuffle(),
    repeat: () => P.toggleRepeat(),
    heart: () => P.toggleHeart(),
    mute: () => { const v = safe(() => P.getVolume(), 1); if (v > 0) { lastVol = v; P.setVolume(0); } else P.setVolume(lastVol || 1); },
    tr: () => setTr(!S.tr),
    coverToggle: () => { SW.cover(!S.cover); syncSwitches(); },
    settings: () => q('.nk-panel').classList.toggle('open'),
    studio: () => { q('.nk-panel').classList.remove('open'); studio.open('sozler'); },
    fs: () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {}),
  };
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-a]');
    if (b && actions[b.dataset.a]) actions[b.dataset.a]();
  });
  q('.nk-next').addEventListener('click', () => P.next());

  function dragBar(bar, onMove, onEnd) {
    const frac = (e) => { const r = bar.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width); };
    bar.addEventListener('pointerdown', (e) => {
      bar.setPointerCapture(e.pointerId);
      bar.classList.add('drag');
      onMove(frac(e));
      const mv = (ev) => onMove(frac(ev));
      const up = (ev) => {
        bar.classList.remove('drag');
        bar.removeEventListener('pointermove', mv);
        bar.removeEventListener('pointerup', up);
        onEnd?.(frac(ev));
      };
      bar.addEventListener('pointermove', mv);
      bar.addEventListener('pointerup', up);
    });
  }
  let scrub = null;
  dragBar(q('.nk-bar.seek'), (f) => (scrub = f), (f) => { scrub = null; if (S.meta?.duration) seek(f * S.meta.duration); });
  dragBar(q('.nk-bar.vol'), (f) => P.setVolume(f));

  let idleT;
  let over = false;
  function poke() {
    root.classList.remove('idle');
    clearTimeout(idleT);
    idleT = setTimeout(() => {
      if (S.view === 'full' && playing() && !over && !q('.nk-panel.open')) root.classList.add('idle');
    }, 2800);
  }
  root.addEventListener('pointermove', poke, { passive: true });
  root.querySelectorAll('.nk-chrome').forEach((c) => {
    c.addEventListener('pointerenter', () => (over = true));
    c.addEventListener('pointerleave', () => { over = false; poke(); });
  });
  root.addEventListener('pointermove', (e) => {
    const g = e.target.closest?.('.nk-glass');
    if (!g) return;
    const r = g.getBoundingClientRect();
    g.style.setProperty('--mx', `${e.clientX - r.left}px`);
    g.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });

  // klavye: tam ekranda her şey bizim; panel içindeyken sadece bize ait tuşlar
  window.addEventListener('keydown', (e) => {
    if (S.view === 'closed' || e.ctrlKey || e.metaKey || e.altKey || e.target.matches?.('input, textarea, [contenteditable]')) return;
    const k = e.key;
    const cycle = () => setMode(MODES[(MODES.indexOf(S.mode) + 1) % MODES.length]);
    const ours = {
      1: () => setMode('flow'), 2: () => setMode('karaoke'), 3: () => setMode('focus'),
      m: cycle, M: cycle,
      t: actions.tr, T: actions.tr,
      q: actions.queue, Q: actions.queue, '/': actions.search,
      c: actions.coverToggle, C: actions.coverToggle,
      f: toggleFull, F: toggleFull,
      '[': () => nudge(-0.1), ']': () => nudge(0.1),
    };
    const full = S.view === 'full' ? {
      Escape: () => (drawers.isOpen() ? drawers.close() : q('.nk-panel.open') ? q('.nk-panel').classList.remove('open') : shrink()),
      ' ': () => P.togglePlay(),
      ArrowRight: () => seek(tick() + 5),
      ArrowLeft: () => seek(tick() - 5),
    } : {};
    const fn = full[k] || ours[k];
    if (fn) {
      e.preventDefault();
      e.stopImmediatePropagation();
      fn();
      poke();
    }
  }, true);

  /* ───────────── Spotify'a bağlan */
  const syncPlay = () => { q('[data-a="play"]').innerHTML = playing() ? SVG.pause : SVG.play; };
  P.addEventListener('songchange', () => {
    drawers.refresh();
    if (S.view !== 'closed') onSong();
    else S.uri = null;
    paint();
    // animasyon sınıfı sadece çalma çubuğuna: <html>'e eklemek tüm sayfayı yeniden hesaplatıyordu
    const bar = document.querySelector('.main-nowPlayingBar-container');
    if (bar) {
      bar.classList.remove('nk-swap');
      requestAnimationFrame(() => bar.classList.add('nk-swap'));
    }
  });
  // müzik dururken arka plan animasyonları da dursun: aksi halde Spotify boştayken bile
  // her karede tüm pencere yeniden çiziliyordu. Çalarken görüntü aynı.
  // Spotify odakta değilken (ör. oyun oynarken) süs animasyonları da dursun: aksi halde arka planda
  // saniyede ~180 kare çizip ekran kartını oyunla paylaşıyordu. Sözler açıksa yazı akmaya devam eder;
  // Spotify'a dönünce her şey kaldığı yerden sürer, yani göz önündeyken görüntü aynı.
  S.focused = document.hasFocus();
  const pausedVideos = new Set();
  const syncPaused = () => {
    const p = !playing() || !S.focused;
    amb.classList.toggle('paused', p);
    root.classList.toggle('paused', p);
    if (p) pulseEl.style.opacity = 0; // (setBeat burada henüz tanımsız değişkene dokunur: açılışta çağrılıyor)
    // Spotify'ın kendi döngü videoları (Canvas): odak dışındayken video çözme işini durdur
    if (!S.focused) {
      document.querySelectorAll('video').forEach((v) => { if (!v.paused && !v.closest('#zlyrics')) { v.pause(); pausedVideos.add(v); } });
    } else {
      pausedVideos.forEach((v) => v.isConnected && v.play().catch(() => {}));
      pausedVideos.clear();
    }
  };
  window.addEventListener('focus', () => { S.focused = true; syncPaused(); });
  window.addEventListener('blur', () => { S.focused = false; syncPaused(); });
  P.addEventListener('onplaypause', () => { syncPlay(); syncPaused(); poke(); });
  syncPlay();
  syncPaused();

  // Spotify'ın "Şarkı Sözleri" (mikrofon) butonu zLyrics'ı sağ panelde açıp kapatır.
  // Yakalama aşamasında dinleniyor ki Spotify kendi söz sayfasına gitmesin.
  // Basıldığı an (pointerdown) yakalanır: Spotify butonu hover/basışta yeniden çizdiği için
  // "click" bazen butona değil üst elemente düşüyor ve ıskalanıyordu. Ardından gelen olaylar yutulur.
  const MIC = '[data-testid="lyrics-button"]';
  const toggleMic = () => {
    watchMain();
    if (studio.cfg.mic === 'full') toggleFull();
    else setView(S.view === 'side' ? 'closed' : 'side');
  };
  // Spotify sözünü bulamadığı şarkıda mikrofonu devre dışı bırakıyor; zLyrics LRCLIB'den bulabilir.
  // Devre dışı buton tıklama olayı bile almaz: Spotify her kapattığında yeniden aç.
  const unlockMic = () => {
    if (studio.cfg.original) return;
    const b = document.querySelector(MIC);
    if (b && b.disabled) {
      b.disabled = false;
      b.setAttribute('aria-label', 'Şarkı Sözleri (zLyrics)');
    }
  };
  // yalnızca butonun bulunduğu sağ bölümü izle (ilerleme çubuğu her saniye değişiyor, onu izlemeye gerek yok)
  new MutationObserver(unlockMic).observe(document.querySelector('.main-nowPlayingBar-right') || document.querySelector('.main-nowPlayingBar-container') || document.body,
    { subtree: true, childList: true, attributes: true, attributeFilter: ['disabled'] });
  unlockMic();
  let micSwallow = 0;
  // Spotify'ın "Tam ekrana geç" butonu kendi tam ekran görünümünü açıyordu: zLyrics'in büyüt butonuyla
  // aynı işi yapsın. Pencereyi tarayıcı tam ekranına almıyoruz: Spotify o değişikliği dinleyip
  // kendi tam ekran görünümünü yine açıyordu.
  const FS = '[data-testid="fullscreen-mode-button"]';
  const BUTTONS = [[MIC, toggleMic], [FS, () => { watchMain(); toggleFull(); }]];
  const hit = (e) => BUTTONS.find(([sel]) => e.target.closest?.(sel));
  window.addEventListener('pointerdown', (e) => {
    if (studio.cfg.original || e.button !== 0) return;
    const b = hit(e);
    if (!b) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    micSwallow = performance.now() + 700;
    b[1]();
  }, true);
  for (const type of ['mousedown', 'mouseup', 'click']) {
    window.addEventListener(type, (e) => {
      if (studio.cfg.original) return;
      const b = hit(e);
      const onBar = b || e.target.closest?.('.main-nowPlayingBar-extraControls');
      if (performance.now() < micSwallow && onBar) {
        e.preventDefault();
        e.stopImmediatePropagation();
      } else if (type === 'click' && e.detail === 0 && b) {
        // klavyeyle (Enter/Boşluk) basıldı
        e.preventDefault();
        e.stopImmediatePropagation();
        b[1]();
      }
    }, true);
  }

  // Spotify'ın kendi söz sayfası -> panel içi zLyrics
  const route = (loc) => {
    watchMain();
    if (studio.cfg.original) { if (S.view === 'embed') setView('closed'); return; }
    // Spotify kendi söz sayfasına geçerse (ör. sağdaki söz önizlemesi kartı) onu hiç gösterme:
    // kapalıysa ya da sağ paneldeysek zLyrics ana alana taşınır
    if (loc?.pathname === '/lyrics') { if (S.view === 'closed' || S.view === 'side') setView('embed'); }
    else if (S.view === 'embed') setView('closed');
  };
  H.listen(route);
  route(H.location);

  setMode(S.mode);

  /* ───────────── döngü */
  let lastSec = -1, lastState = 0, lastBeat = -1;
  // nabız sadece 3 elemente yazılır (kökte değişken olarak tüm söz ağacını yeniden hesaplatıyordu)
  function setBeat(r) {
    if (r === lastBeat) return;
    lastBeat = r;
    pulseEl.style.opacity = r;
    blobsEl.style.transform = `scale(${(1 + r * 0.035).toFixed(4)})`;
    if (S.cover) coverImg.style.transform = `scale(${(1 + r * 0.012).toFixed(4)})`;
  }
  // döngü yalnızca söz ekranı açıkken döner; kapalıyken tarayıcı her karede uyandırılmaz
  function startLoop() {
    if (S.looping) return;
    S.looping = true;
    requestAnimationFrame(frame);
  }
  function frame(now) {
    if (S.view === 'closed') { S.looping = false; return; }
    requestAnimationFrame(frame);
    const t = tick();
    if (S.prep && S.lyr?.synced) R[S.mode].update(t + offset(), now);

    const dur = S.meta?.duration || 0;
    const shown = scrub != null ? scrub * dur : t;
    seekFill.style.transform = `scaleX(${dur ? clamp(shown / dur).toFixed(4) : 0})`;
    const sec = Math.floor(shown);
    if (sec !== lastSec) {
      lastSec = sec;
      q('.nk-t.cur').textContent = fmt(shown);
      q('.nk-t.dur').textContent = fmt(dur);
    }

    // ritim nabzı
    if (S.beats?.length && S.focused && playing()) {
      const b = S.beats[activeAt(S.beats, t)];
      const v = b ? Math.exp(-(t - b.t) * 7) * clamp(b.c * 1.4) : 0;
      setBeat(Math.round(v * 100) / 100);
    }

    // sıradaki parça kartı
    const left = dur - t;
    const nx = Spicetify.Queue?.nextTracks?.[0]?.contextTrack?.metadata;
    const card = q('.nk-next');
    if (nx && dur && left < 14 && left > 1.2) {
      if (S.nextShownFor !== S.uri) {
        S.nextShownFor = S.uri;
        card.querySelector('img').src = img(nx.image_url || nx.image_large_url);
        card.querySelector('b').textContent = nx.title || '';
        card.querySelector('span').textContent = nx.artist_name || '';
      }
      card.classList.add('show');
    } else card.classList.remove('show');

    // düşük frekanslı durumlar
    if (now - lastState > 400) {
      lastState = now;
      q('[data-a="shuffle"]').classList.toggle('on', !!safe(() => P.getShuffle(), false));
      const rep = safe(() => P.getRepeat(), 0);
      q('[data-a="repeat"]').classList.toggle('on', rep > 0);
      q('[data-a="repeat"]').classList.toggle('one', rep === 2);
      const h = !!safe(() => P.getHeart(), false);
      const hb = q('[data-a="heart"]');
      if (hb.classList.contains('on') !== h) { hb.classList.toggle('on', h); hb.innerHTML = h ? SVG.heartOn : SVG.heart; }
      const v = safe(() => P.getVolume(), 1);
      q('.nk-bar.vol .nk-fill').style.transform = `scaleX(${v})`;
      q('[data-a="mute"]').innerHTML = v > 0 ? SVG.vol : SVG.mute;
    }
  }
  if (S.view !== 'closed') startLoop();

  // kapalıyken de tema renkleri şarkıyla değişsin
  function paint() { const m = readMeta(); if (m && S.view === 'closed') setColors(m); }
  paint();
}

(function wait() {
  if (!window.Spicetify?.Player?.addEventListener || !Spicetify.CosmosAsync || !Spicetify.Platform?.History || !document.body) {
    setTimeout(wait, 300);
    return;
  }
  nkMain();
})();
