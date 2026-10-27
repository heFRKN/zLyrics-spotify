export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);

export function fmt(s) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return m + ':' + String(r).padStart(2, '0');
}

export function debounce(fn, ms) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}

export const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem('nk.' + k);
      return v == null ? d : JSON.parse(v);
    } catch {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem('nk.' + k, JSON.stringify(v));
    } catch {}
  },
};

export async function api(path, params) {
  const u = new URL(path, location.origin);
  if (params) for (const [k, v] of Object.entries(params)) if (v != null && v !== '') u.searchParams.set(k, v);
  const r = await fetch(u);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || r.status);
  return j;
}

export async function post(path, body) {
  const r = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || r.status);
  return j;
}

/** t anında aktif olan öğenin indeksi (öğeler .t'ye göre sıralı). */
export function activeAt(items, t) {
  let lo = 0, hi = items.length - 1, ans = -1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (items[m].t <= t) { ans = m; lo = m + 1; } else hi = m - 1;
  }
  return ans;
}

/** Sadece değiştiyse CSS değişkeni yaz — her karede DOM'a dokunmamak için. */
export function setVar(node, name, v, cache, key) {
  const r = Math.round(v * 1000) / 1000;
  if (cache[key] === r) return;
  cache[key] = r;
  node.style.setProperty(name, r);
}
