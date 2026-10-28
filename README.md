<div align="center">

# zLyrics

**Spotify için akıcı, şarkıyla birlikte akan söz ekranı ve sade, cam görünümlü bir tema.**

[![Sürüm](https://img.shields.io/github/v/release/heFRKN/zLyrics-spotify?color=990033&label=s%C3%BCr%C3%BCm)](https://github.com/heFRKN/zLyrics-spotify/releases/latest)
[![Lisans: MIT](https://img.shields.io/badge/lisans-MIT-990033)](LICENSE)
![Windows](https://img.shields.io/badge/Windows-10%20%2F%2011-222)

</div>

---

## Neler var?

- **Canlı sözler:** Sözler şarkıyla birlikte akar, söylenen kelime anında dolar.
- **Üç görünüm:** Akış, Karaoke ve Odak.
- **Yan panel ya da tam ekran:** Spotify'ı kullanırken sözler yanda durur, istersen tam ekrana geçer.
- **Tam ekranda sıra ve arama:** Sözlerden çıkmadan şarkı ara, çal, sıraya ekle.
- **Çeviri:** Yabancı şarkılarda sözlerin altında çevirisi.
- **zLyrics Stüdyo:** Renkler, hazır temalar, yazı tipi, köşeler ve söz görünümü. Tek tuşla orijinal Spotify'a dön.
- **Siyah ve bordo tema:** Yumuşak köşeler, sade cam görünüm.

---

## Kurulum

**1.** Başlat menüsüne **PowerShell** yazıp açın.

**2.** Bu satırı yapıştırıp **Enter**'a basın:

```powershell
iwr -useb https://raw.githubusercontent.com/heFRKN/zLyrics-spotify/main/install.ps1 | iex
```

**3.** Spotify yeniden açılınca hazır. Mikrofon (Şarkı sözleri) butonuna basın.

> Komut yazmak istemiyorsanız: [son sürümden](https://github.com/heFRKN/zLyrics-spotify/releases/latest) zip'i indirip açın, **`install.cmd`**'ye çift tıklayın.

Spotify'ın [spotify.com](https://www.spotify.com/download) sürümü gerekir (Microsoft Store sürümü çalışmaz).

---

<details>
<summary><b>Spotify güncellendi, tema gitti</b></summary>

<br>

Kurulum komutunu tekrar çalıştırın, hepsi bu.

</details>

<details>
<summary><b>Kaldırma</b></summary>

<br>

```powershell
iwr -useb https://raw.githubusercontent.com/heFRKN/zLyrics-spotify/main/uninstall.ps1 | iex
```
ya da zip'teki `uninstall.cmd`.

</details>

<details>
<summary><b>Güvenli mi?</b></summary>

<br>

- Yönetici izni istemez, hesap bilgisi istemez, hiçbir yere veri göndermez.
- İndirilen her dosya doğrulanır; tutmazsa kurulum durur.
- Tüm kod açık. Çalıştırmadan önce [install.ps1](install.ps1)'i okuyabilirsiniz.
- Kurulum [Spicetify](https://spicetify.app) kullanır. Spotify'ın uygulamasını değiştirdiği için kullanım risk size aittir.

</details>

<details>
<summary><b>Telefonda çalışır mı?</b></summary>

<br>

Hayır. Yalnızca Windows'taki Spotify masaüstü uygulamasında çalışır.

</details>

<details>
<summary><b>Geliştiriciler için</b></summary>

<br>

```
spicetify/src/      eklenti
spicetify/theme/    tema
spicetify/corners/  pencere köşeleri
```
`python spicetify/build.py --apply` derler ve uygular. Sürüm: `python tools/make_release.py X.Y.Z`.

</details>

---

<div align="center">
<sub>MIT Lisansı · heFRKN</sub>
</div>

---

## Destek · Support

zLyrics ücretsiz ve açık kaynak. İşine yaradıysa destek olabilirsin.<br>
<sub>zLyrics is free and open source. If it helped you, you can support its development.</sub>

[![Kreosus](https://img.shields.io/badge/Kreosus-furkantiril-990033?style=flat-square)](https://kreosus.com/furkantiril)
