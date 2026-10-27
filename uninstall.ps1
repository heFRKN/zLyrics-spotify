# zLyrics kaldırma: eklentiyi, temayı ve köşe programını kaldırır. Spicetify'ın kendisine dokunmaz.
#   Spotify'ı tamamen orijinaline döndürmek için ayrıca:  spicetify restore
$Sp = "$env:LOCALAPPDATA\spicetify\spicetify.exe"

Get-Process zlyrics-koseler -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item (Join-Path ([Environment]::GetFolderPath('Startup')) 'zlyrics-spotify-koseler.lnk') -ErrorAction SilentlyContinue
Remove-Item "$env:LOCALAPPDATA\zlyrics" -Recurse -Force -ErrorAction SilentlyContinue

if (Test-Path $Sp) {
    $SpUser = (& $Sp path userdata).Trim()
    $ErrorActionPreference = 'Continue'
    & $Sp config extensions zlyrics.js- inject_css 0 replace_colors 0 *> $null   # tema devre dışı
    Remove-Item "$SpUser\Extensions\zlyrics.js" -ErrorAction SilentlyContinue
    Remove-Item "$SpUser\Themes\zlyrics" -Recurse -Force -ErrorAction SilentlyContinue
    & $Sp apply --bypass-admin *> $null
}
Write-Host 'zLyrics kaldırıldı. Spotify''ı tamamen orijinaline döndürmek için: spicetify restore' -ForegroundColor Green
