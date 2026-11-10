@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-preview.ps1"
if errorlevel 1 (
  echo CatXuan could not open. Please keep this window for the error details.
  pause
  exit /b 1
)
