@echo off
echo Starting QRClima Admin...
start http://localhost:3001
cd /d "%~dp0"
npm run dev
pause
