import { $, $$, el, fmt, clamp, debounce, store, api, post } from './util.js';
import { Player } from './player.js';
import { prepare } from './lyrics.js';
import { Flow } from './flow.js';
import { Karaoke } from './karaoke.js';
import { Focus } from './focus.js';
import { Subs } from './subs.js';
import { setAmbient } from './ambient.js';

const body = document.body;
const MODES = ['flow', 'karaoke', 'focus', 'video'];

const S = {
  queue: [],
  qi: -1,
  track: null,
  lyr: null,
  prep: null,
  mode: store.get('mode', 'flow'),
  size: store.get('size', 'm'),
  align: store.get('align', 'left'),
  motion: store.get('motion', true),
  vol: store.get('vol', 80),
  offsets: store.get('offsets', {}),
  history: store.get('history', []),
  authed: false,
  onStage: false,
  tried: new Set(),
  lyrToken: 0,
};

const player = new Player('yt');
const R = {
  flow: new Flow($('#m-flow'), { onSeek: (t) => seekTo(t - offset()) }),
  karaoke: new Karaoke($('#m-karaoke')),
  focus: new Focus($('#m-focus')),
  video: new Subs($('#m-video')),
};
const LAYER = { flow: '#m-flow', karaoke: '#m-karaoke', focus: '#m-focus', video: '#m-video' };

const offset = () => (S.track ? S.offsets[S.track.id] || 0 : 0);

/* ─────────────────────────────────────────── yardımcı UI */

let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 2600);
}

// kapaklar kendi sunucumuzdan: tarayıcının izleme koruması Google görsellerini engelleyebiliyor
const px = (u) => (u ? '/api/img?u=' + encodeURIComponent(u) : '');

function img(src, cls) {
  const i = el('img', cls);
  i.loading = 'lazy';
  i.decoding = 'async';
  i.alt = '';
  i.onerror = () => i.classList.add('broken');
  if (src) i.src = px(src);
  return i;
}

function icon(id) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const u = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  u.setAttribute('href', '#' + id);
  s.append(u);
  return s;
}

// imleci takip eden cam parlaması
document.addEventListener('pointermove', (e) => {
  const g = e.target.closest?.('.glass');
  if (!g) return;
  const r = g.getBoundingClientRect();
  g.style.setProperty('--mx', `${e.clientX - r.left}px`);
  g.style.setProperty('--my', `${e.clientY - r.top}px`);
}, { passive: true });

/* ─────────────────────────────────────────── ana sayfa */

function rowItem(t, i, onClick) {
  const b = el('button', 'row-item in');
  b.style.setProperty('--i', i);
  const meta = el('div', 'meta');
  meta.append(el('b', null, t.title), el('span', null, [t.artist, t.album].filter(Boolean).join(' · ')));
  b.append(img(t.thumb), meta, el('span', 'dur', t.duration ? fmt(t.duration) : ''));
  b.onclick = onClick;
  return b;
}

function card(item, i, onClick, wide) {
  const b = el('button', 'card in' + (wide ? ' wide' : ''));
  b.style.setProperty('--i', i);
  const art = el('div', 'card-art');
  const fab = el('span', 'fab glass');
  fab.append(icon('i-play'));
  art.append(img(item.thumb), fab);
  b.append(art, el('b', null, item.title), el('span', null, item.artist ?? item.subtitle ?? ''));
  b.onclick = onClick;
  return b;
}

function shelf(title, nodes) {
  const s = el('div', 'shelf');
  const row = el('div', 'cards');
  row.append(...nodes);
  s.append(el('h3', 'sec-title', title), row);
  return s;
}

async function openPlaylist(id, title) {
  body.classList.add('searching');
  $('#q').value = '';
  const res = $('#results');
  res.innerHTML = '';
  res.append(el('h3', 'sec-title in', title || 'Çalma listesi'));
  try {
    const d = await api('/api/playlist', { id });
    if (!d.tracks.length) return res.append(el('p', 'empty-note', 'Liste boş.'));
    const rows = el('div', 'rows');
    d.tracks.forEach((t, i) => rows.append(rowItem(t, Math.min(i, 30), () => playTrack(t, { queue: d.tracks, index: i }))));
    res.append(rows);
  } catch (e) {
    res.append(el('p', 'empty-note', 'Liste açılamadı: ' + e.message));
  }
}

async function renderShelves() {
  const box = $('#shelves');
  box.innerHTML = '';

  if (!S.authed) {
    const h = el('button', 'hint-card glass in');
    const txt = el('div');
    txt.append(el('b', null, 'YouTube Music hesabını bağla'), el('p', null, 'Beğendiklerin ve çalma listelerin burada görünsün.'));
    h.append(txt, el('span', 'pill', 'Bağla'));
    h.onclick = openAccount;
    box.append(h);
  }

  if (S.history.length) {
    const hist = S.history.slice(0, 16);
    box.append(shelf('Son çalınanlar', hist.map((t, i) => card(t, i, () => playTrack(t)))));
  }

  if (S.authed) {
    try {
      const lib = await api('/api/library');
      const liked = { id: 'LM', title: 'Beğendiğin şarkılar', subtitle: 'Otomatik liste', thumb: null };
      const cards = [liked, ...lib.playlists.filter((p) => p.id !== 'LM')].map((p, i) => {
        const c = card({ ...p, subtitle: p.subtitle ?? (p.count ? `${p.count} şarkı` : '') }, i, () => openPlaylist(p.id, p.title));
        if (p.id === 'LM') c.querySelector('.card-art').classList.add('liked-art');
        return c;
      });
      box.append(shelf('Kitaplığın', cards));
    } catch {}
  }

  try {
    const home = await api('/api/home');
    home.shelves.slice(0, 5).forEach((sh) => {
      const nodes = sh.items.map((it, i) =>
        it.kind === 'track'
          ? card(it, i, () => playTrack(it))
          : card(it, i, () => openPlaylist(it.id, it.title)));
      box.append(shelf(sh.title, nodes));
    });
  } catch {}
}

const doSearch = debounce(async (q) => {
  const res = $('#results');
  if (!q) { body.classList.remove('searching'); res.innerHTML = ''; return; }
  body.classList.add('searching');
  const token = (doSearch.t = (doSearch.t || 0) + 1);
  try {
    const d = await api('/api/search', { q });
    if (token !== doSearch.t) return;
    res.innerHTML = '';
    if (!d.songs.length && !d.videos.length) return res.append(el('p', 'empty-note', 'Bir şey bulunamadı.'));
    if (d.songs.length) {
      const rows = el('div', 'rows');
      d.songs.forEach((t, i) => rows.append(rowItem(t, i, () => playTrack(t))));
      res.append(el('h3', 'sec-title in', 'Şarkılar'), rows);
    }
    if (d.videos.length) {
      res.append(shelf('Videolar', d.videos.map((t, i) => card(t, i, () => playTrack(t), true))));
    }
  } catch (e) {
    if (token === doSearch.t) { res.innerHTML = ''; res.append(el('p', 'empty-note', 'Arama başarısız: ' + e.message)); }
  }
}, 320);

$('#q').addEventListener('input', (e) => doSearch(e.target.value.trim()));
$('#search-form').addEventListener('submit', (e) => { e.preventDefault(); doSearch($('#q').value.trim()); });

/* ─────────────────────────────────────────── çalma */

function addHistory(t) {
  S.history = [t, ...S.history.filter((x) => x.id !== t.id)].slice(0, 30);
  store.set('history', S.history);
}

function setNow(t) {
  $('#now-title').textContent = t.title;
  $('#now-artist').textContent = t.artist;
  $('#now-art').src = px(t.thumb);
  $('#mini-title').textContent = t.title;
  $('#mini-artist').textContent = t.artist;
  $('#mini-art').src = px(t.thumb);
  $('#empty-art').src = px(t.thumb);
  document.title = `${t.title} — ${t.artist}`;
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: t.title, artist: t.artist, album: t.album,
      artwork: t.thumb ? [{ src: t.thumb, sizes: '720x720' }] : [],
    });
  }
}

async function playTrack(track, { queue, index } = {}) {
  if (queue) { S.queue = queue; S.qi = index ?? 0; S.radio = false; }
  else if (!S.queue.length || S.queue[S.qi]?.id !== track.id) {
    S.queue = [track]; S.qi = 0; S.radio = true;
  }
  S.track = track;
  S.tried = new Set([track.id]);
  setNow(track);
  addHistory(track);
  openStage();
  updateOffsetUI();
  setAmbient(track.thumb);
  loadLyrics(track);
  renderQueue();

  await player.ready;
  player.load(track.id);

  if (S.radio) {
    S.radio = false;
    api('/api/upnext', { v: track.id }).then((r) => {
      if (S.track !== track) return;
      S.queue = [track, ...r.tracks.filter((t) => t.id !== track.id)];
      S.qi = 0;
      renderQueue();
    }).catch(() => {});
  }
}

function playAt(i) {
  if (i < 0 || i >= S.queue.length) return;
  S.qi = i;
  playTrack(S.queue[i], { queue: S.queue, index: i });
}

function next() {
  if (S.qi < S.queue.length - 1) return playAt(S.qi + 1);
  // liste bitti: son parçadan radyo
  if (S.track) {
    api('/api/upnext', { v: S.track.id }).then((r) => {
      const fresh = r.tracks.filter((t) => !S.queue.some((q) => q.id === t.id));
      if (fresh.length) { S.queue.push(...fresh); playAt(S.qi + 1); }
    }).catch(() => {});
  }
}

function prev() {
  if (player.tick() > 3 || S.qi <= 0) return seekTo(0);
  playAt(S.qi - 1);
}

function seekTo(t) {
  player.seek(Math.max(0, t));
  if (!player.playing) player.play();
}

// bazı kliplerde gömülü oynatma kapalı (101/150): aynı şarkının başka kaydını dene
player.addEventListener('error', async (e) => {
  const t = S.track;
  if (!t) return;
  if (![100, 101, 150].includes(e.detail)) return toast('Oynatma hatası');
  toast('Bu kayıt gömülü açılmıyor, başka kayıt deneniyor…');
  try {
    const d = await api('/api/search', { q: `${t.title} ${t.artist}` });
    const alt = [...d.songs, ...d.videos].find((x) => !S.tried.has(x.id));
    if (alt && S.track === t) { S.tried.add(alt.id); player.load(alt.id); }
    else toast('Oynatılabilir kayıt bulunamadı');
  } catch { toast('Oynatılabilir kayıt bulunamadı'); }
});
player.addEventListener('ended', next);
player.addEventListener('state', (e) => {
  const playing = e.detail === 1;
  body.classList.toggle('paused', !playing);
  $('#btn-play use').setAttribute('href', playing ? '#i-pause' : '#i-play');
  if (e.detail === 1 && S.track && !S.track.duration) S.track.duration = player.duration;
  poke();
});
player.ready.then(() => player.setVolume(S.vol));

if ('mediaSession' in navigator) {
  const ms = navigator.mediaSession;
  ms.setActionHandler('play', () => player.play());
  ms.setActionHandler('pause', () => player.pause());
  ms.setActionHandler('nexttrack', next);
  ms.setActionHandler('previoustrack', prev);
}

/* ─────────────────────────────────────────── sözler */

async function loadLyrics(track) {
  const token = ++S.lyrToken;
  S.lyr = null;
  S.prep = null;
  body.classList.add('loading');
  showLayer();
  let res;
  try {
    res = await api('/api/lyrics', {
      v: track.id, title: track.title, artist: track.artist,
      album: track.album, duration: track.duration,
    });
  } catch {
    res = { synced: false, lines: [], plain: null };
  }
  if (token !== S.lyrToken) return;
  body.classList.remove('loading');
  S.lyr = res;

  if (res.synced) {
    S.prep = prepare(res.lines, track.duration || player.duration);
    Object.values(R).forEach((r) => r.mount(S.prep));
  } else {
    Object.values(R).forEach((r) => r.mount(null));
    const pl = $('#m-plain');
    pl.textContent = '';
    if (res.plain) {
      pl.append(el('small', null, 'Senkron söz yok · düz metin'), document.createTextNode(res.plain));
      pl.scrollTop = 0;
    }
  }
  $('#empty-msg').textContent = res.instrumental ? 'Enstrümantal' : 'Bu şarkı için söz bulunamadı';
  $('#lyr-src').textContent = res.source ? `Sözler: ${res.source}` : '';
  showLayer();
}

function showLayer() {
  let on = null;
  if (S.lyr) {
    if (S.lyr.synced) on = LAYER[S.mode];
    else if (S.mode !== 'video') on = S.lyr.plain ? '#m-plain' : '#m-empty';
  }
  $$('.layer').forEach((l) => l.classList.toggle('on', on != null && l.matches(on)));
  if (S.lyr?.synced) R[S.mode].show();
}

/* ─────────────────────────────────────────── mod */

function setMode(m) {
  if (!MODES.includes(m)) return;
  S.mode = m;
  store.set('mode', m);
  body.dataset.mode = m;
  $$('#modes button').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
  movePill();
  showLayer();
}

function movePill() {
  const b = $(`#modes button[data-mode="${S.mode}"]`);
  const pill = $('.modes-pill');
  if (!b || !b.offsetWidth) return;
  pill.style.left = b.offsetLeft + 'px';
  pill.style.width = b.offsetWidth + 'px';
}

$('#modes').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b) setMode(b.dataset.mode);
});
window.addEventListener('resize', movePill);

/* ─────────────────────────────────────────── sahne */

function openStage() {
  if (S.onStage) return;
  S.onStage = true;
  body.classList.add('on-stage');
  $('#stage').classList.add('is-active');
  $('#home').classList.remove('is-active');
  $('#mini').hidden = true;
  requestAnimationFrame(movePill);
  showLayer();
  poke();
}

function closeStage() {
  if (!S.onStage) return;
  S.onStage = false;
  body.classList.remove('on-stage', 'idle');
  $('#stage').classList.remove('is-active');
  $('#home').classList.add('is-active');
  closePanels();
  $('#mini').hidden = !S.track;
}

$('#btn-back').onclick = closeStage;
$('#mini').onclick = openStage;

// kontroller boştayken kaybolsun
let idleT;
let overChrome = false;
function poke() {
  body.classList.remove('idle');
  clearTimeout(idleT);
  idleT = setTimeout(() => {
    if (S.onStage && player.playing && !overChrome && !$('.panel.open')) body.classList.add('idle');
  }, 2800);
}
['pointermove', 'pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, poke, { passive: true }));
$$('.chrome').forEach((c) => {
  c.addEventListener('pointerenter', () => { overChrome = true; });
  c.addEventListener('pointerleave', () => { overChrome = false; poke(); });
});

$('#btn-play').onclick = () => player.toggle();
$('#btn-next').onclick = next;
$('#btn-prev').onclick = prev;
$('#btn-fs').onclick = toggleFs;

function toggleFs() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.().catch(() => {});
}

// sürüklenebilir çubuklar
function dragBar(bar, onMove, onEnd) {
  const frac = (e) => {
    const r = bar.getBoundingClientRect();
    return clamp((e.clientX - r.left) / r.width);
  };
  bar.addEventListener('pointerdown', (e) => {
    bar.setPointerCapture(e.pointerId);
    bar.classList.add('drag');
    onMove(frac(e));
    const mv = (ev) => onMove(frac(ev));
    const up = (ev) => {
      bar.classList.remove('drag');
      bar.removeEventListener('pointermove', mv);
      bar.removeEventListener('pointerup', up);
      bar.removeEventListener('pointercancel', up);
      onEnd?.(frac(ev));
    };
    bar.addEventListener('pointermove', mv);
    bar.addEventListener('pointerup', up);
    bar.addEventListener('pointercancel', up);
  });
}

let scrub = null;
dragBar($('#bar'), (f) => { scrub = f; }, (f) => {
  scrub = null;
  if (player.duration) seekTo(f * player.duration);
});

function setVol(v) {
  S.vol = Math.round(v);
  store.set('vol', S.vol);
  player.setVolume(S.vol);
  $('#vol-fill').style.setProperty('--v', S.vol / 100);
  $('#btn-mute use').setAttribute('href', S.vol ? '#i-vol' : '#i-mute');
}
dragBar($('#vol-bar'), (f) => setVol(f * 100));
let lastVol = S.vol || 80;
$('#btn-mute').onclick = () => {
  if (S.vol) { lastVol = S.vol; setVol(0); } else setVol(lastVol);
};
setVol(S.vol);

/* ─────────────────────────────────────────── paneller */

function closePanels() { $$('.panel').forEach((p) => p.classList.remove('open')); syncPanelBtns(); }
function togglePanel(sel) {
  const p = $(sel);
  const open = !p.classList.contains('open');
  closePanels();
  p.classList.toggle('open', open);
  syncPanelBtns();
}
function syncPanelBtns() {
  $('#btn-queue').classList.toggle('on', $('#queue').classList.contains('open'));
  $('#btn-settings').classList.toggle('on', $('#settings').classList.contains('open'));
}
$('#btn-queue').onclick = () => { togglePanel('#queue'); scrollQueue(); };
$('#btn-settings').onclick = () => togglePanel('#settings');
$$('.panel [data-close]').forEach((b) => (b.onclick = closePanels));

function renderQueue() {
  const ol = $('#queue-list');
  ol.innerHTML = '';
  S.queue.forEach((t, i) => {
    const li = el('li', i === S.qi ? 'cur' : i < S.qi ? 'past' : '');
    const b = el('button');
    const m = el('div');
    m.append(el('b', null, t.title), el('span', null, t.artist));
    b.append(img(t.thumb), m);
    b.onclick = () => playAt(i);
    li.append(b);
    ol.append(li);
  });
  scrollQueue();
}
function scrollQueue() {
  // scrollIntoView ekran dışındaki paneli göstermek için sahneyi kaydırır; elle kaydır
  const ol = $('#queue-list');
  const cur = $('li.cur', ol);
  if (cur) ol.scrollTo({ top: cur.offsetTop - ol.clientHeight / 2 + cur.offsetHeight / 2, behavior: 'smooth' });
}

// ayarlar
function updateOffsetUI() {
  const o = offset();
  $('#off-val').textContent = (o > 0 ? '+' : '') + o.toFixed(1) + 's';
}
$$('[data-off]').forEach((b) => (b.onclick = () => nudgeOffset(+b.dataset.off)));
function nudgeOffset(d) {
  if (!S.track) return;
  const v = Math.round((offset() + d) * 10) / 10;
  if (v) S.offsets[S.track.id] = v; else delete S.offsets[S.track.id];
  store.set('offsets', S.offsets);
  updateOffsetUI();
  toast(`Senkron ${(v > 0 ? '+' : '') + v.toFixed(1)}s`);
}

function bindSeg(id, key, apply) {
  const seg = $(id);
  const set = (v) => {
    S[key] = v;
    store.set(key, v);
    $$('button', seg).forEach((b) => b.classList.toggle('on', b.dataset.v === v));
    apply(v);
  };
  seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) set(b.dataset.v); });
  set(S[key]);
}
bindSeg('#seg-size', 'size', (v) => {
  body.classList.remove('size-s', 'size-m', 'size-l');
  body.classList.add('size-' + v);
  requestAnimationFrame(() => R.flow.measure());
});
bindSeg('#seg-align', 'align', (v) => {
  body.classList.toggle('align-center', v === 'center');
});

function setMotion(on) {
  S.motion = on;
  store.set('motion', on);
  body.classList.toggle('still', !on);
  $('#sw-motion').classList.toggle('on', on);
}
$('#sw-motion').onclick = () => setMotion(!S.motion);
setMotion(S.motion);

/* ─────────────────────────────────────────── hesap */

function openAccount() {
  $('#acc-off').hidden = S.authed;
  $('#acc-on').hidden = !S.authed;
  $('#account').hidden = false;
}
function closeAccount() { $('#account').hidden = true; }
$('#btn-account').onclick = openAccount;
$('#account [data-close]').onclick = closeAccount;
$('#account').addEventListener('click', (e) => { if (e.target.id === 'account') closeAccount(); });

function connected() {
  setAuthed(true);
  closeAccount();
  toast('Hesap bağlandı');
  renderShelves();
}

let loginPoll;
$('#acc-login').onclick = async () => {
  const btn = $('#acc-login');
  const st = $('#acc-state');
  st.classList.remove('err');
  btn.classList.add('busy');
  $('#acc-login-txt').textContent = 'Giriş bekleniyor';
  try {
    const r = await post('/api/login/start');
    st.textContent = r.msg;
  } catch (e) {
    st.textContent = e.message;
  }
  clearInterval(loginPoll);
  loginPoll = setInterval(async () => {
    let r;
    try { r = await api('/api/login/state'); } catch { return; }
    if (r.state === 'waiting') { st.textContent = r.msg; return; }
    clearInterval(loginPoll);
    btn.classList.remove('busy');
    $('#acc-login-txt').textContent = 'Google ile giriş yap';
    if (r.state === 'done' && r.authed) { st.textContent = ''; connected(); }
    else { st.textContent = r.msg || 'Bağlanamadı'; st.classList.add('err'); }
  }, 1200);
};

$('#acc-save').onclick = async () => {
  const headers = $('#acc-headers').value;
  const btn = $('#acc-save');
  btn.textContent = 'Bağlanıyor…';
  try {
    await post('/api/auth', { headers });
    $('#acc-headers').value = '';
    connected();
  } catch (e) {
    toast('Bağlanamadı: ' + e.message);
  } finally {
    btn.textContent = 'Header ile bağla';
  }
};
$('#acc-logout').onclick = async () => {
  await post('/api/logout');
  setAuthed(false);
  closeAccount();
  renderShelves();
};
function setAuthed(v) {
  S.authed = v;
  $('#btn-account').classList.toggle('linked', v);
}

/* ─────────────────────────────────────────── klavye */

document.addEventListener('keydown', (e) => {
  if (e.target.matches('input, textarea')) {
    if (e.key === 'Escape') e.target.blur();
    return;
  }
  const k = e.key;
  if (k === '/' && !S.onStage) { e.preventDefault(); $('#q').focus(); return; }
  if (k === 'Escape') {
    if (!$('#account').hidden) return closeAccount();
    if ($('.panel.open')) return closePanels();
    return closeStage();
  }
  if (!S.track) return;
  if (k === ' ') { e.preventDefault(); player.toggle(); }
  else if (k === 'ArrowRight') seekTo(player.tick() + 5);
  else if (k === 'ArrowLeft') seekTo(player.tick() - 5);
  else if (k === 'ArrowUp' && S.onStage) { e.preventDefault(); setVol(clamp(S.vol + 5, 0, 100)); }
  else if (k === 'ArrowDown' && S.onStage) { e.preventDefault(); setVol(clamp(S.vol - 5, 0, 100)); }
  else if (k === 'f' || k === 'F') toggleFs();
  else if (k === 'n' || k === 'N') next();
  else if (k === 'p' || k === 'P') prev();
  else if (k === '[') nudgeOffset(-0.1);
  else if (k === ']') nudgeOffset(0.1);
  else if (k === 'm' || k === 'M') setMode(MODES[(MODES.indexOf(S.mode) + 1) % MODES.length]);
  else if (k >= '1' && k <= '4') { openStage(); setMode(MODES[+k - 1]); }
});

/* ─────────────────────────────────────────── döngü */

let lastSec = -1;
function frame(now) {
  requestAnimationFrame(frame);
  const t = player.tick();
  if (S.onStage && S.prep) R[S.mode].update(t + offset(), now);

  const dur = player.duration || S.track?.duration || 0;
  const shown = scrub != null ? scrub * dur : t;
  $('#bar-fill').style.setProperty('--v', dur ? clamp(shown / dur) : 0);
  const sec = Math.floor(shown);
  if (sec !== lastSec) {
    lastSec = sec;
    $('#t-cur').textContent = fmt(shown);
    $('#t-dur').textContent = fmt(dur);
  }
}
requestAnimationFrame(frame);

/* ─────────────────────────────────────────── başlangıç */

setMode(S.mode);

// derin bağlantı: /?q=şarkı adı&play=1&mode=karaoke
const qs = new URLSearchParams(location.search);
if (qs.get('mode')) setMode(qs.get('mode'));
if (qs.get('q')) {
  $('#q').value = qs.get('q');
  if (qs.get('play')) {
    api('/api/search', { q: qs.get('q') }).then((d) => {
      const t = d.songs[0] || d.videos[0];
      if (t) playTrack(t).then(() => qs.get('t') && setTimeout(() => seekTo(+qs.get('t')), 1500));
    });
  } else doSearch(qs.get('q'));
}

api('/api/status')
  .then((s) => setAuthed(s.authed))
  .catch(() => toast('Sunucuya ulaşılamadı — python server.py çalışıyor mu?'))
  .finally(renderShelves);
