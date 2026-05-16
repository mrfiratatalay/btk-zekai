@echo off
setlocal EnableExtensions
title BTK Zekai - Docker Compose

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."

pushd "%ROOT_DIR%"
if errorlevel 1 (
  echo [HATA] Repo kok dizinine girilemedi.
  pause
  exit /b 1
)

echo.
echo ============================================================
echo   BTK Zekai - Full Docker Compose
echo ============================================================
echo.
echo   Akilli Market      : http://localhost:3000
echo   Zekai Platform     : http://localhost:3001
echo   commerce-api       : http://localhost:5001/swagger
echo   zekai-api          : http://localhost:5002/swagger
echo   ai-service         : http://localhost:8000
echo.
echo   Komut: docker compose up --build
echo.

docker compose up --build
set "EXIT_CODE=%ERRORLEVEL%"

popd
pause
exit /b %EXIT_CODE%
