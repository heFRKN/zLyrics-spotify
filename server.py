"""zLyrics — yerel sunucu.

YouTube Music araması / kitaplık (ytmusicapi) + senkron söz (LRCLIB, yedek: YT Music)
ve web arayüzünü tek porttan sunar.

    python server.py            -> http://localhost:8787
"""

import hashlib
import json
import os
import re
import threading
import urllib.parse
import webbrowser
from concurrent.futures import ThreadPoolExecutor
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

import requests
import ytmusicapi
from ytmusicapi import YTMusic

from login import Login

ROOT = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.join(ROOT, "web")
AUTH_FILE = os.path.join(ROOT, "browser.json")
IMG_CACHE = os.path.join(ROOT, ".cache", "img")
PORT = int(os.environ.get("PORT", "8787"))
UA = "zLyrics/1.0 (local lyrics player)"

_lock = threading.Lock()
_yt = None
_authed = False
_lyrics_cache = {}
_pool = ThreadPoolExecutor(max_workers=6)
_http = requests.Session()
_http.headers["User-Agent"] = UA


def yt():
    global _yt, _authed
    with _lock:
        if _yt is None:
            _authed = False
            if os.path.exists(AUTH_FILE):
                try:
                    _yt = YTMusic(AUTH_FILE, language="tr", location="TR")
                    _authed = True
                except Exception as e:  # bozuk dosya -> anonim devam
                    print("[auth] browser.json okunamadı:", e)
            if _yt is None:
                _yt = YTMusic(language="tr", location="TR")
        return _yt


def reset_client():
    global _yt
    with _lock:
        _yt = None


# ---------------------------------------------------------------- normalize

def parse_duration(v):
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    parts = [p for p in str(v).split(":") if p.strip().isdigit()]
    if not parts:
        return None
    s = 0
    for p in parts:
        s = s * 60 + int(p)
    return float(s)


def big_thumb(thumbs, size=720):
    if not thumbs:
        return None
    url = thumbs[-1].get("url") if isinstance(thumbs, list) else None
    if not url:
        return None
    if "googleusercontent.com" in url or "ggpht.com" in url:
        if re.search(r"=w\d+-h\d+", url):
            url = re.sub(r"=w\d+-h\d+.*$", f"=w{size}-h{size}-l90-rj", url)
        else:
            url = re.sub(r"=s\d+.*$", f"=s{size}", url)
    elif "ytimg.com" in url:
        m = re.search(r"/vi(?:_webp)?/([^/]+)/", url)
        if m:
            url = f"https://i.ytimg.com/vi/{m.group(1)}/hqdefault.jpg"
    return url


def norm_track(t):
    if not t or not t.get("videoId"):
        return None
    dur = t.get("duration_seconds")
    if dur is None:
        dur = parse_duration(t.get("duration") or t.get("length"))
    artists = [a["name"] for a in (t.get("artists") or []) if a and a.get("name")]
    album = t.get("album")
    album = album.get("name") if isinstance(album, dict) else (album or "")
    thumbs = t.get("thumbnails") or t.get("thumbnail") or []
    return {
        "id": t["videoId"],
        "title": t.get("title") or "",
        "artists": artists,
        "artist": ", ".join(artists),
        "album": album or "",
        "duration": dur,
        "thumb": big_thumb(thumbs),
        "kind": t.get("videoType") or t.get("resultType") or "",
    }


def clean(lst):
    return [x for x in (norm_track(t) for t in (lst or [])) if x]


# ------------------------------------------------------------------- lyrics

TS = re.compile(r"\[(\d+):(\d+(?:[.:]\d+)?)\]")
WORD_TS = re.compile(r"<(\d+):(\d+(?:[.:]\d+)?)>")


def _sec(m, s):
    return int(m) * 60 + float(s.replace(":", "."))


def parse_lrc(text):
    out = []
    for raw in (text or "").splitlines():
        stamps = list(TS.finditer(raw))
        if not stamps:
            continue
        body = raw[stamps[-1].end():]
        words = None
        if WORD_TS.search(body):  # enhanced LRC: <mm:ss.xx>kelime
            words = []
            parts = WORD_TS.split(body)
            # parts: [önce, m, s, metin, m, s, metin...]
            for i in range(1, len(parts) - 2, 3):
                w = parts[i + 2]
                if w.strip():
                    words.append({"t": _sec(parts[i], parts[i + 1]), "text": w.strip()})
            body = WORD_TS.sub("", body)
        body = re.sub(r"\s+", " ", body).strip()
        for st in stamps:
            line = {"t": round(_sec(st.group(1), st.group(2)), 3), "text": body}
            if words:
                line["words"] = words
            out.append(line)
    out.sort(key=lambda l: l["t"])
    return finalize(out)


def finalize(lines):
    """Boş satırlar -> önceki satırın bitişi. Nota işaretli satırlar düşer."""
    res = []
    for ln in lines:
        txt = ln["text"].strip()
        if not txt or re.fullmatch(r"[♪♫♬\s.…]+", txt):
            if res and "end" not in res[-1]:
                res[-1]["end"] = ln["t"]
            continue
        res.append(ln)
    return res


STRIP = [
    r"\s*[\(\[][^\)\]]*(official|video|audio|lyric|lyrics|klip|visualizer|music video|hd|4k|remaster)[^\)\]]*[\)\]]",
    r"\s*[\(\[]\s*(feat|ft)\.?[^\)\]]*[\)\]]",
    r"\s+-\s+.*remaster.*$",
]


def clean_title(t):
    t = t or ""
    for p in STRIP:
        t = re.sub(p, "", t, flags=re.I)
    return t.strip()


def lrclib(path, params):
    try:
        r = _http.get(f"https://lrclib.net/api/{path}", params=params, timeout=8)
        if r.status_code == 200:
            return r.json()
    except requests.RequestException as e:
        print("[lrclib]", e)
    return None


def pick_lrclib(title, artist, album, duration):
    params = {"track_name": title, "artist_name": artist}
    if album:
        params["album_name"] = album
    if duration:
        params["duration"] = int(round(duration))
    hit = lrclib("get", params)
    if hit and hit.get("syncedLyrics"):
        return hit
    plain_hit = hit if hit and hit.get("plainLyrics") else None

    results = lrclib("search", {"track_name": title, "artist_name": artist}) or []
    if not results:
        results = lrclib("search", {"q": f"{title} {artist}"}) or []

    def score(r):
        d = abs((r.get("duration") or 0) - (duration or r.get("duration") or 0))
        return (0 if r.get("syncedLyrics") else 1, d)

    results = [r for r in results if not r.get("instrumental")]
    results.sort(key=score)
    for r in results:
        if r.get("syncedLyrics") and (not duration or abs((r.get("duration") or 0) - duration) < 8):
            return r
    for r in results:
        if r.get("plainLyrics"):
            return plain_hit or r
    return plain_hit


def yt_lyrics(video_id):
    try:
        w = yt().get_watch_playlist(video_id, limit=1)
        bid = w.get("lyrics")
        if not bid:
            return None
        lyr = yt().get_lyrics(bid, timestamps=True)
        if not lyr:
            return None
        if lyr.get("hasTimestamps"):
            lines = [
                {"t": l.start_time / 1000, "end": l.end_time / 1000, "text": l.text}
                for l in lyr["lyrics"]
            ]
            return {"lines": finalize(lines), "source": lyr.get("source") or "YouTube Music"}
        return {"plain": lyr.get("lyrics"), "source": lyr.get("source") or "YouTube Music"}
    except Exception as e:
        print("[yt lyrics]", e)
        return None


def get_lyrics(q):
    vid = q.get("v", "")
    if vid in _lyrics_cache:
        return _lyrics_cache[vid]
    title = clean_title(q.get("title", ""))
    artist = (q.get("artist", "").split(",")[0]).strip()
    album = q.get("album", "")
    duration = parse_duration(q.get("duration"))

    yt_future = _pool.submit(yt_lyrics, vid) if vid else None
    hit = pick_lrclib(title, artist, album, duration) if title else None

    res = {"synced": False, "lines": [], "plain": None, "source": None}
    if hit and hit.get("syncedLyrics"):
        lines = parse_lrc(hit["syncedLyrics"])
        if lines:
            res.update(synced=True, lines=lines, source="LRCLIB")
    if not res["synced"] and yt_future:
        y = yt_future.result()
        if y and y.get("lines"):
            res.update(synced=True, lines=y["lines"], source=y["source"])
        elif y and y.get("plain"):
            res.update(plain=y["plain"], source=y["source"])
    if not res["synced"] and not res["plain"] and hit and hit.get("plainLyrics"):
        res.update(plain=hit["plainLyrics"], source="LRCLIB")
    if hit and hit.get("instrumental"):
        res["instrumental"] = True

    if res["synced"] or res["plain"]:
        _lyrics_cache[vid] = res
    return res


# --------------------------------------------------------------------- API

def api_search(q):
    term = q.get("q", "").strip()
    if not term:
        return {"songs": [], "videos": []}
    f_songs = _pool.submit(yt().search, term, filter="songs", limit=20)
    f_vids = _pool.submit(yt().search, term, filter="videos", limit=10)
    return {"songs": clean(f_songs.result()), "videos": clean(f_vids.result())[:12]}


def api_upnext(q):
    w = yt().get_watch_playlist(q["v"], limit=40, radio=True)
    return {"tracks": clean(w.get("tracks"))}


def api_status(_):
    yt()
    return {"authed": _authed}


def api_library(_):
    if not _authed:
        return {"authed": False, "playlists": []}
    pls = yt().get_library_playlists(limit=50) or []
    return {
        "authed": True,
        "playlists": [
            {
                "id": p.get("playlistId"),
                "title": p.get("title"),
                "count": p.get("count"),
                "thumb": big_thumb(p.get("thumbnails"), 480),
            }
            for p in pls
            if p.get("playlistId")
        ],
    }


def _album(bid):
    a = yt().get_album(bid)
    thumb = big_thumb(a.get("thumbnails"))
    tracks = []
    for t in a.get("tracks") or []:
        n = norm_track(t)
        if n:
            n["thumb"] = n["thumb"] or thumb
            n["album"] = n["album"] or a.get("title", "")
            tracks.append(n)
    return {"title": a.get("title"), "tracks": tracks}


def api_playlist(q):
    pid = q["id"]
    if pid == "LM":
        data = yt().get_liked_songs(limit=300)
        return {"title": data.get("title"), "tracks": clean(data.get("tracks"))}
    if pid.startswith("MPRE"):
        return _album(pid)
    if pid.startswith("OLAK"):
        try:
            return _album(yt().get_album_browse_id(pid))
        except Exception:
            pass
    try:
        data = yt().get_playlist(pid, limit=300)
        tracks = clean(data.get("tracks"))
        if tracks:
            return {"title": data.get("title"), "tracks": tracks}
    except Exception as e:
        print("[playlist]", pid, type(e).__name__)
    # mix / radyo / tek video: izleme listesi her türlü açılır
    try:
        if len(pid) == 11:
            w = yt().get_watch_playlist(videoId=pid, limit=50)
        else:
            w = yt().get_watch_playlist(playlistId=pid, limit=100)
        tracks = clean(w.get("tracks"))
        if tracks:
            return {"title": None, "tracks": tracks}
    except Exception as e:
        print("[playlist/watch]", pid, type(e).__name__)
    raise ValueError("Bu liste açılamıyor")


def api_home(_):
    shelves = []
    for sec in yt().get_home(limit=5) or []:
        items = []
        for c in sec.get("contents") or []:
            if not c:
                continue
            if c.get("videoId"):
                t = norm_track(c)
                if t:
                    items.append({"kind": "track", **t})
            elif c.get("playlistId") or str(c.get("browseId", "")).startswith("MPRE"):
                arts = ", ".join(a["name"] for a in (c.get("artists") or []) if a and a.get("name"))
                items.append({
                    "kind": "playlist",
                    "id": c.get("playlistId") or c["browseId"],
                    "title": c.get("title"),
                    "subtitle": c.get("description") or arts or "",
                    "thumb": big_thumb(c.get("thumbnails"), 480),
                })
        if items:
            shelves.append({"title": sec.get("title"), "items": items[:16]})
    return {"shelves": shelves}


def save_auth(raw):
    ytmusicapi.setup(filepath=AUTH_FILE, headers_raw=raw)
    reset_client()
    try:
        yt().get_library_playlists(limit=1)
        if not _authed:
            raise ValueError("oturum yok")
    except Exception as e:
        if os.path.exists(AUTH_FILE):
            os.remove(AUTH_FILE)
        reset_client()
        raise ValueError(f"Giriş doğrulanamadı ({e})")


def _cookies_to_auth(cookie, ua):
    save_auth("\n".join([
        "accept: */*",
        "content-type: application/json",
        f"cookie: {cookie}",
        "origin: https://music.youtube.com",
        f"user-agent: {ua or 'Mozilla/5.0'}",
        "x-goog-authuser: 0",
    ]))


_login = Login(_cookies_to_auth)


def api_auth(body):
    raw = (body or {}).get("headers", "")
    if not raw.strip():
        raise ValueError("Header boş")
    save_auth(raw)
    return {"authed": True}


def api_login_start(_):
    return _login.start()


def api_login_state(_):
    st = _login.status()
    st["authed"] = _authed
    return st


def api_logout(_):
    if os.path.exists(AUTH_FILE):
        os.remove(AUTH_FILE)
    reset_client()
    return {"authed": False}


GET_ROUTES = {
    "/api/status": api_status,
    "/api/search": api_search,
    "/api/upnext": api_upnext,
    "/api/lyrics": get_lyrics,
    "/api/library": api_library,
    "/api/playlist": api_playlist,
    "/api/home": api_home,
    "/api/login/state": api_login_state,
}
POST_ROUTES = {"/api/auth": api_auth, "/api/logout": api_logout, "/api/login/start": api_login_start}
IMG_HOSTS = ("googleusercontent.com", "ggpht.com", "ytimg.com")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=WEB, **kw)

    def log_message(self, fmt, *args):
        if "/api/" in (args[0] if args else ""):
            super().log_message(fmt, *args)

    def end_headers(self):
        if not self.path.startswith("/api/img"):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _json(self, code, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _run(self, fn, arg):
        try:
            self._json(200, fn(arg))
        except Exception as e:
            print("[api]", self.path, repr(e))
            self._json(500, {"error": str(e)})

    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        q = {k: v[0] for k, v in urllib.parse.parse_qs(u.query).items()}
        if u.path == "/api/img":
            return self._img(q.get("u", ""))
        if u.path in GET_ROUTES:
            return self._run(GET_ROUTES[u.path], q)
        if u.path.startswith("/api/"):
            return self._json(404, {"error": "yok"})
        return super().do_GET()

    def do_POST(self):
        u = urllib.parse.urlparse(self.path)
        n = int(self.headers.get("Content-Length") or 0)
        body = json.loads(self.rfile.read(n) or b"{}") if n else {}
        if u.path in POST_ROUTES:
            return self._run(POST_ROUTES[u.path], body)
        self._json(404, {"error": "yok"})

    def _img(self, url):
        host = urllib.parse.urlparse(url).hostname or ""
        if not host.endswith(IMG_HOSTS):
            return self._json(400, {"error": "izin yok"})
        path = os.path.join(IMG_CACHE, hashlib.sha1(url.encode()).hexdigest())
        try:
            if os.path.exists(path):
                with open(path, "rb") as f:
                    data = f.read()
                ctype = "image/jpeg" if data[:2] == b"\xff\xd8" else "image/webp" if data[8:12] == b"WEBP" else "image/png"
            else:
                r = _http.get(url, timeout=10)
                r.raise_for_status()
                data, ctype = r.content, r.headers.get("Content-Type", "image/jpeg")
                os.makedirs(IMG_CACHE, exist_ok=True)
                with open(path, "wb") as f:
                    f.write(data)
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Cache-Control", "max-age=604800")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except (requests.RequestException, OSError):
            self._json(502, {"error": "görsel alınamadı"})


if __name__ == "__main__":
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    url = f"http://localhost:{PORT}"
    print(f"\n  zLyrics  ->  {url}\n  (kapatmak için Ctrl+C)\n")
    if not os.environ.get("NO_BROWSER"):
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
