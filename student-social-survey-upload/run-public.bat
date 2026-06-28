@echo off
cd /d "%~dp0"

if not exist node_modules (
  echo Installing dependencies...
  call npm.cmd install
)

echo Starting local survey server...
start "student-social-survey" cmd /c "npm.cmd start"

echo Waiting for server...
timeout /t 4 /nobreak >nul

echo.
echo Public tunnel is starting.
echo Keep this window open while others are filling the survey.
echo Copy the https URL shown below and send it to other people.
echo.

call npx.cmd --yes localtunnel --port 3000
