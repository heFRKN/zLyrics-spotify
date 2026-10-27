@echo off
cd /d "%~dp0"
python -c "import ytmusicapi" 2>nul || python -m pip install -r requirements.txt
python server.py
