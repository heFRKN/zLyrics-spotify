"""Sürüm paketi hazırlar.

    python tools/make_release.py 1.0.0

1. Eklentiyi derler (spicetify/dist)
2. Kurulan dosyaların SHA-256 özetlerini install.ps1'e gömer (indirilen her dosya bunlarla doğrulanır)
3. release/ klasörüne GitHub sürüm dosyalarını ve elle kurulum zip'ini koyar
"""
import hashlib, os, re, shutil, subprocess, sys, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSION = sys.argv[1] if len(sys.argv) > 1 else sys.exit("kullanım: make_release.py <sürüm>")

# yayın dosyası adı -> depodaki yeri
FILES = {
    "zlyrics.js": "spicetify/dist/zlyrics.js",
    "user.css": "spicetify/dist/theme/user.css",
    "color.ini": "spicetify/dist/theme/color.ini",
    "ZLyricsCorners.cs": "spicetify/corners/ZLyricsCorners.cs",
}

subprocess.run([sys.executable, os.path.join(ROOT, "spicetify", "build.py")], check=True)


def sha(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest().upper()


hashes = {name: sha(os.path.join(ROOT, rel)) for name, rel in FILES.items()}

inst_path = os.path.join(ROOT, "install.ps1")
with open(inst_path, encoding="utf-8-sig") as f:
    inst = f.read()
block = "# <surum>\n$Version = '%s'\n$Hashes = @{\n%s\n}\n# </surum>" % (
    VERSION, "\n".join(f"    '{n}' = '{h}'" for n, h in hashes.items()))
inst, n = re.subn(r"# <surum>.*?# </surum>", lambda _: block, inst, flags=re.S)
if n != 1:
    sys.exit("install.ps1 içinde '# <surum>' bloğu bulunamadı")
# depodaki kopya BOM'suz: "iwr | iex" BOM karakterini ayrıştıramaz
with open(inst_path, "w", encoding="utf-8") as f:
    f.write(inst)

out = os.path.join(ROOT, "release")
shutil.rmtree(out, ignore_errors=True)
os.makedirs(out)
for name, rel in FILES.items():
    shutil.copy(os.path.join(ROOT, rel), os.path.join(out, name))
# zip'teki kopya BOM'lu: Windows PowerShell 5.1 "-File" ile Türkçe karakterleri ancak böyle doğru okur
for name in ("install.ps1", "uninstall.ps1"):
    with open(os.path.join(ROOT, name), encoding="utf-8-sig") as f:
        src = f.read()
    with open(os.path.join(out, name), "w", encoding="utf-8-sig") as f:
        f.write(src)

zname = os.path.join(out, f"zLyrics-v{VERSION}.zip")
with zipfile.ZipFile(zname, "w", zipfile.ZIP_DEFLATED) as z:
    for name in list(FILES) + ["install.ps1", "uninstall.ps1"]:
        z.write(os.path.join(out, name), f"zLyrics-v{VERSION}/{name}")
    z.write(os.path.join(ROOT, "LICENSE"), f"zLyrics-v{VERSION}/LICENSE")

with open(os.path.join(out, "SHA256SUMS.txt"), "w", encoding="utf-8") as f:
    for name in sorted(os.listdir(out)):
        if name != "SHA256SUMS.txt":
            f.write(f"{sha(os.path.join(out, name))}  {name}\n")
print("hazır:", out)
for name in sorted(os.listdir(out)):
    print("  ", name)
