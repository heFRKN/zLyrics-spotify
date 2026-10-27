// Söz ekranındayken sıra ve arama: sağdan kayan cam çekmeceler.

const DR_SVG = {
  queue: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h12M4 11h12M4 16h7"/><path d="M15 14.2v5.6c0 .5.5.8.9.5l4-2.8c.4-.3.4-.8 0-1.1l-4-2.8c-.4-.2-.9.1-.9.6Z" fill="currentColor" stroke="none"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m7 7 10 10M17 7 7 17"/></svg>',
};

function nkDrawers({ root, P, toast, img }) {
  const box = el('div', 'nk-drawer nk-glass');
  box.innerHTML = `
    <header>
      <div class="dr-tabs"><button data-tab="queue">Sıradakiler</button><button data-tab="search">Ara</button></div>
      <button class="nk-ib sm" data-dr-close title="Kapat">${DR_SVG.close}</button>
    </header>
    <div class="dr-search"><span>${DR_SVG.search}</span><input type="text" placeholder="Şarkı ya da sanatçı ara" spellcheck="false"></div>
    <ol class="dr-list"></ol>
    <p class="dr-empty"></p>`;
  root.append(box);
  const list = box.querySelector('.dr-list');
  const input = box.querySelector('input');
  const empty = box.querySelector('.dr-empty');
  let tab = 'queue';
  let results = [];
  let qTimer = 0;

  function row(t, i, onPlay, canQueue) {
    const li = el('li');
    li.style.setProperty('--i', Math.min(i, 14));
    const b = el('button', 'dr-row');
    const im = el('img');
    im.loading = 'lazy';
    im.src = t.image || '';
    const m = el('div');
    m.append(el('b', null, t.title), el('span', null, t.artist));
    b.append(im, m);
    b.onclick = onPlay;
    li.append(b);
    if (canQueue) {
      const add = el('button', 'nk-ib sm dr-add');
      add.title = 'Sıraya ekle';
      add.innerHTML = DR_SVG.plus;
      add.onclick = async () => {
        try { await Spicetify.addToQueue([{ uri: t.uri }]); toast('Sıraya eklendi'); } catch { toast('Eklenemedi'); }
      };
      li.append(add);
    }
    return li;
  }

  function renderQueue() {
    const next = (Spicetify.Queue?.nextTracks || []).filter((x) => x?.contextTrack?.uri && !x.contextTrack.uri.includes('delimiter')).slice(0, 60);
    list.textContent = '';
    empty.textContent = next.length ? '' : 'Sırada şarkı yok';
    next.forEach((x, i) => {
      const c = x.contextTrack, m = c.metadata || {};
      list.append(row({ title: m.title, artist: m.artist_name, image: img(m.image_url || m.image_small_url), uri: c.uri }, i, async () => {
        try { await Spicetify.Platform.PlayerAPI.skipTo({ uri: c.uri, uid: c.uid }); } catch { P.playUri(c.uri); }
      }, false));
    });
  }

  async function search(term) {
    if (!term.trim()) { results = []; renderResults(); return; }
    empty.textContent = 'Aranıyor…';
    try {
      const r = await Spicetify.GraphQL.Request(Spicetify.GraphQL.Definitions.searchModalResults, {
        searchTerm: term, offset: 0, limit: 30, numberOfTopResults: 30,
        includeAudiobooks: false, includeArtistHasConcertsField: false, includePreReleases: false,
        includeLocalConcertsField: false, includeAuthors: false,
      });
      if (input.value !== term) return;
      results = (r?.data?.searchV2?.topResultsV2?.itemsV2 || [])
        .map((x) => x?.item?.data)
        .filter((d) => d?.__typename === 'Track' && d.uri)
        .map((d) => ({
          uri: d.uri,
          title: d.name,
          artist: (d.artists?.items || []).map((a) => a.profile?.name).filter(Boolean).join(', '),
          image: d.albumOfTrack?.coverArt?.sources?.[0]?.url,
        }));
    } catch {
      results = [];
    }
    renderResults();
  }

  function renderResults() {
    list.textContent = '';
    empty.textContent = input.value.trim() ? (results.length ? '' : 'Sonuç yok') : 'Bir şey yaz';
    results.forEach((t, i) => list.append(row(t, i, () => P.playUri(t.uri), true)));
  }

  function setTab(t) {
    tab = t;
    box.dataset.tab = t;
    box.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === t));
    if (t === 'queue') renderQueue();
    else { renderResults(); setTimeout(() => input.focus(), 60); }
  }

  box.addEventListener('click', (e) => {
    const tb = e.target.closest('[data-tab]');
    if (tb) setTab(tb.dataset.tab);
    if (e.target.closest('[data-dr-close]')) close();
  });
  input.addEventListener('input', () => { clearTimeout(qTimer); qTimer = setTimeout(() => search(input.value), 280); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && results[0]) P.playUri(results[0].uri);
    if (e.key === 'Escape') { e.stopPropagation(); input.value ? (input.value = '', renderResults()) : close(); }
  });

  function open(t) {
    box.classList.add('open');
    root.classList.add('drawer-open');
    setTab(t || tab);
  }
  function close() {
    box.classList.remove('open');
    root.classList.remove('drawer-open');
    input.blur();
  }
  const isOpen = () => box.classList.contains('open');

  return {
    open, close, isOpen,
    toggle: (t) => (isOpen() && tab === t ? close() : open(t)),
    refresh: () => isOpen() && tab === 'queue' && renderQueue(),
  };
}
