@echo off
set "SHORTCUT=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\Student Social Survey Public.lnk"

if exist "%SHORTCUT%" (
  del "%SHORTCUT%"
  echo Auto public startup disabled.
) else (
  echo Auto public startup was not enabled.
)

pause
