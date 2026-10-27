"""zLyrics Spicetify eklentisini ve temasını derleyip Spicetify klasörüne kopyalar.

    python spicetify/build.py           -> derle + kopyala
    python spicetify/build.py --apply   -> + spicetify apply (Spotify yeniden başlar)

Söz motoru web sitesiyle ortaktır (web/js); ES modül import/export'ları
ayıklanıp tek bir IIFE içine konur.
"""

import json
import os
import re
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
WEB_JS = os.path.join(HERE, "..", "web", "js")
SHARED = ["util.js", "lyrics.js", "flow.js", "karaoke.js", "focus.js"]
SPICE = os.path.join(os.environ["APPDATA"], "spicetify")
CLI = os.path.join(os.environ["LOCALAPPDATA"], "spicetify", "spicetify.exe")


def strip_module(src):
    src = re.sub(r"^import .*?;\s*$", "", src, flags=re.M)
    return re.sub(r"^export\s+", "", src, flags=re.M)


def build():
    parts = []
    for name in SHARED:
        with open(os.path.join(WEB_JS, name), encoding="utf-8") as f:
            parts.append(f"// ── {name}\n" + strip_module(f.read()))
    with open(os.path.join(HERE, "src", "style.css"), encoding="utf-8") as f:
        css = f.read()
    app = ""
    for name in ("studio.js", "drawers.js", "app.js"):
        with open(os.path.join(HERE, "src", name), encoding="utf-8") as f:
            app += f"// ── {name}\n" + f.read() + "\n"

    js = "\n".join([
        "// zLyrics — derlenmiş dosya, düzenleme: spicetify/src + web/js",
        "(function zlyrics() {",
        "'use strict';",
        "{ const st = document.createElement('style'); st.id = 'zlyrics-style';",
        f"  st.textContent = {json.dumps(css, ensure_ascii=False)};",
        "  document.head.append(st); }",
        *parts,
        app,
        "})();",
    ])
    # dağıtım kopyası: install.ps1 bunu kullanır (kurulan kişinin Python'a ihtiyacı olmaz)
    dist = os.path.join(HERE, "dist")
    os.makedirs(os.path.join(dist, "theme"), exist_ok=True)
    with open(os.path.join(dist, "zlyrics.js"), "w", encoding="utf-8") as f:
        f.write(js)
    for name in ("color.ini", "user.css"):
        shutil.copy(os.path.join(HERE, "theme", name), os.path.join(dist, "theme", name))

    ext_dir = os.path.join(SPICE, "Extensions")
    os.makedirs(ext_dir, exist_ok=True)
    with open(os.path.join(ext_dir, "zlyrics.js"), "w", encoding="utf-8") as f:
        f.write(js)

    theme_dir = os.path.join(SPICE, "Themes", "zlyrics")
    os.makedirs(theme_dir, exist_ok=True)
    for name in ("color.ini", "user.css"):
        shutil.copy(os.path.join(HERE, "theme", name), os.path.join(theme_dir, name))
    print("derlendi ->", ext_dir, "+", theme_dir)


def apply():
    subprocess.run([
        CLI, "config",
        "extensions", "zlyrics.js",
        "current_theme", "zlyrics",
        "color_scheme", "zlyrics",
        "inject_css", "1", "replace_colors", "1", "inject_theme_js", "1",
    ], check=True)
    subprocess.run([CLI, "apply", "--bypass-admin"], check=True)


if __name__ == "__main__":
    build()
    if "--apply" in sys.argv:
        apply()
