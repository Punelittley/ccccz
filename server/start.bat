@echo off
cd /d "%~dp0"
call npm install
call npm run build
call npm start
pause
