"""Tek tıkla YouTube Music girişi.

Ayrı bir profille Chrome/Edge penceresi açar (uzaktan hata ayıklama portu ile).
Kullanıcı Google'a giriş yapınca youtube.com çerezlerini DevTools protokolünden
okur, ytmusicapi'nin anlayacağı header'lara çevirir ve pencereyi kapatır.
Profil klasörde kalır; sonraki bağlanmalar anında olur.
"""

import json
import os
import subprocess
import threading
import time
import urllib.request

import websocket

ROOT = os.path.dirname(os.path.abspath(__file__))
PROFILE = os.path.join(ROOT, ".login-profile")
PORT = 9339
LOGIN_URL = (
    "https://accounts.google.com/ServiceLogin?service=youtube&passive=true"
    "&continue=https%3A%2F%2Fmusic.youtube.com%2F"
)
NEEDED = {"SAPISID", "__Secure-3PSID"}

BROWSERS = [
    r"%ProgramFiles%\Google\Chrome\Application\chrome.exe",
    r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe",
    r"%LocalAppData%\Google\Chrome\Application\chrome.exe",
    r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe",
    r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe",
    r"%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe",
]


def find_browser():
    for p in BROWSERS:
        p = os.path.expandvars(p)
        if os.path.exists(p):
            return p
    return None


def _devtools(method, params=None):
    with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/version", timeout=2) as r:
        info = json.loads(r.read())
    ws = websocket.create_connection(info["webSocketDebuggerUrl"], timeout=5, suppress_origin=True)
    try:
        ws.send(json.dumps({"id": 1, "method": method, "params": params or {}}))
        while True:
            msg = json.loads(ws.recv())
            if msg.get("id") == 1:
                return msg.get("result", {}), info.get("User-Agent", "")
    finally:
        ws.close()


class Login:
    def __init__(self, on_cookies):
        self.on_cookies = on_cookies  # (cookie_header, user_agent) -> None, hata atarsa başarısız
        self.state = "idle"
        self.msg = ""
        self._lock = threading.Lock()

    def status(self):
        return {"state": self.state, "msg": self.msg}

    def start(self):
        with self._lock:
            if self.state == "waiting":
                return self.status()
            exe = find_browser()
            if not exe:
                self.state, self.msg = "error", "Chrome ya da Edge bulunamadı"
                return self.status()
            self.state, self.msg = "waiting", "Açılan pencerede giriş yap"
        threading.Thread(target=self._run, args=(exe,), daemon=True).start()
        return self.status()

    def _run(self, exe):
        try:
            subprocess.Popen([
                exe,
                f"--remote-debugging-port={PORT}",
                f"--user-data-dir={PROFILE}",
                "--no-first-run",
                "--no-default-browser-check",
                "--new-window",
                LOGIN_URL,
            ])
        except OSError as e:
            self.state, self.msg = "error", f"Tarayıcı açılamadı: {e}"
            return

        started = time.time()
        deadline = started + 600
        seen_alive = False
        while time.time() < deadline:
            time.sleep(1.2)
            try:
                res, ua = _devtools("Storage.getCookies")
                seen_alive = True
            except Exception:
                if seen_alive:
                    self.state, self.msg = "error", "Pencere giriş yapılmadan kapatıldı"
                    return
                if time.time() - started > 25:
                    self.state, self.msg = "error", "Tarayıcıya bağlanılamadı"
                    return
                continue

            yt = [c for c in res.get("cookies", []) if c.get("domain", "").endswith("youtube.com")]
            if not NEEDED <= {c["name"] for c in yt}:
                continue

            time.sleep(1.5)  # yönlendirmeler son çerezleri yazsın
            try:
                res, ua = _devtools("Storage.getCookies")
                yt = [c for c in res.get("cookies", []) if c.get("domain", "").endswith("youtube.com")]
                cookie = "; ".join(f"{c['name']}={c['value']}" for c in yt)
                self.on_cookies(cookie, ua)
                self.state, self.msg = "done", "Bağlandı"
            except Exception as e:
                self.state, self.msg = "error", f"Giriş doğrulanamadı: {e}"
            try:
                _devtools("Browser.close")
            except Exception:
                pass
            return

        self.state, self.msg = "error", "Zaman aşımı"
        try:
            _devtools("Browser.close")
        except Exception:
            pass
