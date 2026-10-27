@echo off
rem Spotify güncellendikten sonra (tema kaybolursa) ya da kodu değiştirince çalıştır.
cd /d "%~dp0"
set SP=%LOCALAPPDATA%\spicetify\spicetify.exe
python build.py
"%SP%" backup apply --bypass-admin || "%SP%" apply --bypass-admin
