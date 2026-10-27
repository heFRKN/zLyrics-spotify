# zLyrics kaldırma / uninstall: eklentiyi, temayı ve köşe programını kaldırır. Spicetify'ın kendisine dokunmaz.
#   iwr -useb https://raw.githubusercontent.com/heFRKN/zLyrics-spotify/main/uninstall.ps1 | iex
#   Spotify'ı tamamen orijinaline döndürmek için ayrıca / to fully restore Spotify:  spicetify restore
& {
$Sp = "$env:LOCALAPPDATA\spicetify\spicetify.exe"

Get-Process zlyrics-koseler -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item (Join-Path ([Environment]::GetFolderPath('Startup')) 'zlyrics-spotify-koseler.lnk') -ErrorAction SilentlyContinue
Remove-Item "$env:LOCALAPPDATA\zlyrics" -Recurse -Force -ErrorAction SilentlyContinue

if (Test-Path $Sp) {
    $ErrorActionPreference = 'Continue'
    $SpUser = (& $Sp path userdata).Trim()
    & $Sp config extensions zlyrics.js- inject_css 0 replace_colors 0 *> $null   # tema devre dışı
    Remove-Item "$SpUser\Extensions\zlyrics.js" -ErrorAction SilentlyContinue
    Remove-Item "$SpUser\Themes\zlyrics" -Recurse -Force -ErrorAction SilentlyContinue
    & $Sp apply --bypass-admin -q *> $null
    if ($LASTEXITCODE -ne 0) { & $Sp restore --bypass-admin -q *> $null }   # uygulanamazsa Spotify'ı orijinaline döndür
}
Write-Host "`n  zLyrics kaldırıldı / removed. Spotify'ı tamamen orijinaline döndürmek için / to fully restore Spotify: spicetify restore`n" -ForegroundColor Green
}
