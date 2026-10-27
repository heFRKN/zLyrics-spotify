# zLyrics kurulum / installer  (Windows, Spotify masaüstü / desktop)
#
#   iwr -useb https://raw.githubusercontent.com/heFRKN/zLyrics-spotify/main/install.ps1 | iex
#   ya da / or (sürüm zip'inden / from the release zip):  powershell -ExecutionPolicy Bypass -File install.ps1
#
# Yaptıkları / What it does:
#   1. Spotify'ın spotify.com sürümü kurulu mu kontrol eder (Microsoft Store sürümü desteklenmez)
#   2. Spicetify yoksa resmi son sürümünü kurar (github.com/spicetify/cli)
#   3. zLyrics eklentisini ve temasını kurar, uygular (Spotify bir kez yeniden başlar)
#   4. İsteğe bağlı: köşe programını kaynak koddan (ZLyricsCorners.cs) derler ve başlangıca ekler
#
# İndirilen her zLyrics dosyası aşağıdaki SHA-256 özetleriyle doğrulanır; tutmazsa hiçbir şey kurulmaz.
# Yönetici izni gerekmez. Hiçbir yere veri gönderilmez.
# Every downloaded file is verified with the SHA-256 hashes below. No admin rights needed. Nothing is sent anywhere.

$ErrorActionPreference = 'Stop'
# <surum>
$Version = '1.0.1'
$Hashes = @{
    'zlyrics.js' = '79EE4478360D1CFC1F0EA20CDF507E2125AE204F292F76E224AEDB2C501C9DF6'
    'user.css' = 'D8F41833FB769157A1D72C6E4DF748868CADB90105D59679CEDFA2A0993B5797'
    'color.ini' = '8626EC031CFD932C8BB310BB9B32F50E39475EB8453D8A9B568E0272065E04FD'
    'ZLyricsCorners.cs' = 'CC471A58CB5CFB571756A29BE6335B76094B70C810D14648EF69F38584A84136'
}
# </surum>
$Base = "https://github.com/heFRKN/zLyrics-spotify/releases/download/v$Version"

function Say($t, $c = 'Gray') { Write-Host $t -ForegroundColor $c }
function Step($t) { Write-Host "`n> $t" -ForegroundColor Magenta }
# exit yerine throw: "iwr | iex" ile çalışırken PowerShell penceresini kapatmasın
function Fail($t) { Write-Host "`n  $t`n" -ForegroundColor Red; throw 'zLyrics: kurulum durduruldu / install aborted' }
# Spicetify uyarıları stderr'e yazar; Windows PowerShell bunu katı modda hata sayıp betiği durdurur.
function Spice { $old = $ErrorActionPreference; $ErrorActionPreference = 'Continue'; & $Sp @args *> $null; $code = $LASTEXITCODE; $ErrorActionPreference = $old; return $code }

# Dosya kaynağı: betiğin yanı (sürüm zip'i), depo (geliştirme) ya da GitHub sürümü (indirilir, doğrulanır)
$Here = if ($PSScriptRoot) { $PSScriptRoot } else { $null }
$RepoPath = @{ 'zlyrics.js' = 'spicetify\dist\zlyrics.js'; 'user.css' = 'spicetify\dist\theme\user.css'; 'color.ini' = 'spicetify\dist\theme\color.ini'; 'ZLyricsCorners.cs' = 'spicetify\corners\ZLyricsCorners.cs' }
function Get-File($name, $dest) {
    if ($Here -and (Test-Path (Join-Path $Here $name))) { Copy-Item (Join-Path $Here $name) $dest -Force }
    elseif ($Here -and (Test-Path (Join-Path $Here $RepoPath[$name]))) { Copy-Item (Join-Path $Here $RepoPath[$name]) $dest -Force; return }
    else { Invoke-WebRequest "$Base/$name" -OutFile $dest -UseBasicParsing }
    if ($Hashes.Count -gt 0 -and (Get-FileHash $dest -Algorithm SHA256).Hash -ne $Hashes[$name]) {
        Remove-Item $dest -Force
        Fail "Doğrulama başarısız / verification failed: $name"
    }
}

Say "`n  zLyrics $Version`n" 'White'

# 1. Spotify
Step 'Spotify'
if (Get-AppxPackage -Name 'SpotifyAB.SpotifyMusic' -ErrorAction SilentlyContinue) {
    Fail "Spotify Microsoft Store sürümü desteklenmiyor / Microsoft Store version is not supported.`n  Kaldırıp şuradan kurun / uninstall it and install from: https://www.spotify.com/download"
}
if (-not (Test-Path "$env:APPDATA\Spotify\Spotify.exe")) {
    Fail "Spotify bulunamadı / Spotify not found.`n  Kurup bir kez açın / install it and open it once: https://www.spotify.com/download"
}
Say 'OK' 'Green'

# 2. Spicetify
Step 'Spicetify'
$SpDir = "$env:LOCALAPPDATA\spicetify"
$Sp = "$SpDir\spicetify.exe"
if (-not (Test-Path $Sp)) {
    Say 'Kuruluyor / installing...'
    $rel = Invoke-RestMethod 'https://api.github.com/repos/spicetify/cli/releases/latest' -UseBasicParsing
    $asset = $rel.assets | Where-Object { $_.name -like '*windows-x64.zip' } | Select-Object -First 1
    $zip = Join-Path $env:TEMP "spicetify-$([guid]::NewGuid()).zip"
    Invoke-WebRequest $asset.browser_download_url -OutFile $zip -UseBasicParsing
    if ($asset.digest -match '^sha256:(.+)$' -and (Get-FileHash $zip -Algorithm SHA256).Hash -ne $Matches[1].ToUpper()) {
        Remove-Item $zip -Force
        Fail 'Spicetify indirmesi doğrulanamadı / Spicetify download failed verification.'
    }
    New-Item -ItemType Directory -Force $SpDir | Out-Null
    Expand-Archive $zip -DestinationPath $SpDir -Force
    Remove-Item $zip -Force
    $p = [Environment]::GetEnvironmentVariable('Path', 'User')
    if ($p -notlike "*$SpDir*") { [Environment]::SetEnvironmentVariable('Path', "$p;$SpDir", 'User') }
    [void](Spice config)   # varsayılan ayar dosyasını oluşturur
}
Say "Spicetify $(& $Sp --version)" 'Green'
$SpUser = (& $Sp path userdata).Trim()

# 3. zLyrics
Step 'zLyrics'
New-Item -ItemType Directory -Force "$SpUser\Extensions", "$SpUser\Themes\zlyrics" | Out-Null
Get-File 'zlyrics.js' "$SpUser\Extensions\zlyrics.js"
Get-File 'user.css' "$SpUser\Themes\zlyrics\user.css"
Get-File 'color.ini' "$SpUser\Themes\zlyrics\color.ini"
[void](Spice config extensions zlyrics.js current_theme zlyrics color_scheme zlyrics inject_css 1 replace_colors 1 check_spicetify_update 0)
Say 'Spotify yamalanıyor, yeniden başlayacak / patching Spotify, it will restart...'
# ilk kurulumda yedek al + uygula; yedek zaten varsa (yeniden kurulum) sadece uygula
if ((Spice backup apply --bypass-admin) -ne 0) {
    if ((Spice apply --bypass-admin) -ne 0) { Fail 'Spicetify uygulanamadı / could not apply. Spotify güncellendiyse / if Spotify updated: spicetify restore backup apply' }
}
Say 'OK' 'Green'

# 4. Köşeler (isteğe bağlı)
Step 'Pencere köşeleri / window corners (isteğe bağlı / optional)'
Say 'Spotify penceresini yuvarlatan küçük program; boştayken işlemci kullanmaz. Kaynak koddan derlenir.'
Say 'Small program that rounds the Spotify window; idle when nothing changes. Compiled from source.'
$ans = if ($env:ZLYRICS_CORNERS) { $env:ZLYRICS_CORNERS } else { Read-Host 'Kurulsun mu? / Install? (e/y = evet/yes, h/n = hayır/no)' }
if ($ans -match '^(e|y)') {
    $csc = Get-ChildItem "$env:WINDIR\Microsoft.NET\Framework64\v4*\csc.exe" -ErrorAction SilentlyContinue | Select-Object -Last 1
    if (-not $csc) {
        Say '.NET Framework derleyicisi yok, atlandı / compiler not found, skipped.' 'Yellow'
    } else {
        $cd = "$env:LOCALAPPDATA\zlyrics\corners"
        New-Item -ItemType Directory -Force $cd | Out-Null
        Get-Process zlyrics-koseler -ErrorAction SilentlyContinue | Stop-Process -Force
        Get-File 'ZLyricsCorners.cs' "$cd\ZLyricsCorners.cs"
        & $csc.FullName /nologo /optimize /target:winexe /out:"$cd\zlyrics-koseler.exe" "$cd\ZLyricsCorners.cs" | Out-Null
        $lnk = Join-Path ([Environment]::GetFolderPath('Startup')) 'zlyrics-spotify-koseler.lnk'
        $sc = (New-Object -ComObject WScript.Shell).CreateShortcut($lnk)
        $sc.TargetPath = "$cd\zlyrics-koseler.exe"; $sc.WorkingDirectory = $cd; $sc.Description = 'zLyrics: Spotify pencere köşeleri'; $sc.Save()
        Start-Process "$cd\zlyrics-koseler.exe"
        Say 'OK' 'Green'
    }
} else {
    Say 'Atlandı / skipped.'
}

Say "`n  Bitti! Spotify'da mikrofon (Şarkı sözleri) butonuna basın. Ayarlar: sol üstteki palet düğmesi."
Say "  Done! Press the lyrics (mic) button in Spotify. Settings: the palette button, top left.`n" 'White'
