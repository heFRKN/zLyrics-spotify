# zLyrics

[![Sürüm](https://img.shields.io/github/v/release/heFRKN/zLyrics-spotify?color=990033&label=s%C3%BCr%C3%BCm)](https://github.com/heFRKN/zLyrics-spotify/releases/latest)
[![Lisans: MIT](https://img.shields.io/badge/lisans-MIT-990033)](LICENSE)
![Windows](https://img.shields.io/badge/Windows-10%20%2F%2011-222)

Şarkıyla birlikte akan, akıcı animasyonlu söz ekranı ve siyah + bordo (#990033) cam görünümlü, yumuşak köşeli bir Spotify masaüstü teması.
Hafif çalışacak şekilde tasarlandı: arka planda neredeyse hiç kaynak harcamaz, oyun oynarken hissedilmez.
Ayrıca YouTube Music ile çalışan bağımsız bir web sürümü var.

> Windows · Spotify masaüstü (spotify.com sürümü) · [Spicetify](https://spicetify.app) üzerinde çalışır

---

## Kurulum

PowerShell'i açıp yapıştırın:

```powershell
iwr -useb https://raw.githubusercontent.com/heFRKN/zLyrics-spotify/main/install.ps1 | iex
```

Betik sırasıyla:
1. Spotify'ın **spotify.com** sürümünün kurulu olduğunu kontrol eder (Microsoft Store sürümü desteklenmez: [buradan](https://www.spotify.com/download) indirin).
2. Spicetify yoksa kurar.
3. zLyrics eklentisini ve temasını kurup uygular (Spotify bir kez yeniden başlar).
4. İsterseniz pencere köşelerini yuvarlatan küçük programı kurar (sorar).

Komut satırı istemiyorsanız: [son sürümden](https://github.com/heFRKN/zLyrics-spotify/releases/latest) `zLyrics-vX.Y.Z.zip` dosyasını indirip açın, klasörde `install.ps1`'e sağ tıklayıp **PowerShell ile çalıştır** deyin.

**Kaldırma:**

```powershell
iwr -useb https://raw.githubusercontent.com/heFRKN/zLyrics-spotify/main/uninstall.ps1 | iex
```
Spotify'ı tamamen orijinaline döndürmek için ayrıca: `spicetify restore`

**Spotify güncellendikten sonra tema kaybolursa:** `spicetify backup apply` (olmazsa `spicetify restore backup apply`)

### Güvenlik
- Yönetici izni istemez; yalnızca kendi kullanıcı klasörünüze (`%APPDATA%\spicetify`, `%LOCALAPPDATA%\zlyrics`) yazar.
- İndirilen her zLyrics dosyası, betiğe gömülü **SHA-256** özetleriyle doğrulanır; tutmazsa kurulum durur. Spicetify, kendi resmi GitHub sürümünden indirilir.
- Hazır `.exe` dağıtılmaz: köşe programı bilgisayarınızda, Windows'un kendi derleyicisiyle, [açık kaynak koddan](spicetify/corners/ZLyricsCorners.cs) derlenir.
- Hiçbir yere veri göndermez, hesap bilgisi istemez. Sözler yalnızca Spotify'ın kendisinden ve [LRCLIB](https://lrclib.net)'den alınır.
- Çalıştırmadan önce okumak isterseniz: [install.ps1](install.ps1) (~120 satır).

---

## Özellikler

### Sözler
Spotify'ın **Şarkı sözleri (mikrofon)** butonu zLyrics'i sağ panelde açar; Spotify'ı kullanmaya devam edebilirsiniz. Büyüt butonu ya da Spotify'ın **tam ekran** butonu tam ekrana geçirir, `Esc` geri alır.

| Mod | |
|---|---|
| **Akış** | Satırlar yay fiziğiyle kayar, söylenen kelime dolar, uzak satırlar bulanıklaşır, aralarda `• • •` |
| **Karaoke** | İki satır, söylenen kısım vurgu rengiyle dolar, uzun aradan önce geri sayım |
| **Odak** | Ekranda tek satır, kelimeler söylendiği an belirir |

- Sözler Spotify'dan (varsa kelime kelime zamanlamayla), yoksa [LRCLIB](https://lrclib.net)'den. Spotify'ın sözünü bulamadığı şarkılarda da mikrofon çalışır.
- Çeviri (`T`), kapak düzeni (`C`), ritim nabzı, sıradaki şarkı kartı
- Tam ekranda **sıradakiler** (`Q`) ve **arama** (`/`): sonuca tıkla = çal, `+` = sıraya ekle
- Senkron kaydırma (`[` `]`), her şarkı için hatırlanır
- Kısayollar: `1` `2` `3` mod · `M` sonraki mod · `F` tam ekran · `Esc` kapat

### zLyrics Stüdyo
Sol üstteki **palet** düğmesi. Değişiklikler anında uygulanır.
- **Tema:** 6 hazır tema, vurgu rengi (veya kapak rengine uy)
- **Arayüz:** panel koyuluğu, panel ve pencere köşeleri, kenar ışığı, gölge, arka plan ışığı, bulanık kapak, yazı tipi
- **Sözler:** yazı tipi, boyut, kalınlık, satır aralığı, pasif satır görünürlüğü/bulanıklığı, parlama, arka plan, karaoke rengi, mikrofon davranışı
- **Spotify'ı orijinale al:** temayı anında kapatır, aynı düğmeyle geri açılır

### Performans
- Tema, orijinal Spotify kadar hızlı ölçüldü (sayfa geçişi, kaydırma).
- Spotify odakta değilken (ör. oyun oynarken) arka plan animasyonları ve Spotify'ın Canvas videoları durur; pencere saniyede ~1 kare çizer. Spotify'a dönünce kaldığı yerden devam eder.
- Söz ekranı kapalıyken bellekte tutulmaz.
- Köşe programı Windows olaylarıyla çalışır, yoklama yapmaz: boştayken ~%0 işlemci, ~24 MB.

---

## Web sürümü (YouTube Music)

Spotify gerektirmeyen, tarayıcıda çalışan sürüm: YouTube Music'ten arar ve çalar, aynı söz modlarını gösterir (+ klibi arka planda oynatan **Video** modu).

```
pip install -r requirements.txt
python server.py        # http://localhost:8787
```
Ya da `start.bat`. YouTube Music hesabı bağlamak isteğe bağlıdır (sağ üstteki kişi simgesi).

---

## Telefon?

Spotify'ın telefon uygulamasına tema/eklenti **kurulamaz**: Spicetify yalnızca masaüstü uygulamasını değiştirebilir. iOS'ta bu tamamen imkânsız; Android'de yalnızca değiştirilmiş (korsan) Spotify APK'larıyla olur, bu da hesap kapatılma riski taşır.

---

## Geliştirme

```
spicetify/src/        eklenti kaynağı (app.js, studio.js, drawers.js, style.css)
spicetify/theme/      tema (user.css, color.ini)
spicetify/corners/    köşe programı (ZLyricsCorners.cs)
web/js/               söz motoru (flow/karaoke/focus) - web ve eklentide ortak
```
`python spicetify/build.py --apply` derler (`spicetify/dist/`) ve kendi Spotify'ınıza uygular.  
Sürüm: `python tools/make_release.py 1.2.3` → özetleri `install.ps1`'e yazar, `release/` klasörünü hazırlar; ardından `gh release create v1.2.3 release/*`.

---

## Notlar

- Spotify ile bağlantısı yoktur. Spicetify, Spotify istemcisini değiştirir; bu, Spotify'ın kullanım şartlarına teknik olarak aykırıdır (yaygın kullanılır, bilinen bir hesap kapatma vakası yok; risk size aittir).
- Köşe programı Spotify penceresine yuvarlak şekil verir ve Windows'un pencere gölgesini/Mica efektini kapatır (köşede saydam iz kalmasın diye).

### English (short)
Smooth, word-synced animated lyrics and a black/crimson glass theme with soft rounded corners for the **Spotify desktop app on Windows** (via Spicetify). Built to stay light: near-zero cost in the background.
Install (PowerShell): `iwr -useb https://raw.githubusercontent.com/heFRKN/zLyrics-spotify/main/install.ps1 | iex`  
Uninstall: same command with `uninstall.ps1`. No admin rights, every download is SHA-256 verified, the optional corner helper is compiled locally from source.
Open with Spotify's lyrics (mic) button; customize with the palette button (zLyrics Studio).
