@echo off
cd /d "%~dp0"

if not exist node_modules (
  echo Installing dependencies...
  call npm.cmd install
)

:loop
echo Starting survey server...
call npm.cmd start
echo Server stopped. Restarting in 5 seconds...
timeout /t 5 /nobreak >nul
goto loop
