@echo off
setlocal EnableExtensions
title ZekAI - Backend (Docker)

set "ROOT_DIR=%~dp0.."

echo.
echo ============================================================
echo   ZekAI - Backend Servisleri (Docker)
echo ============================================================
echo.
echo   postgres       : localhost:5432
echo   redis          : localhost:6379
echo   commerce-api   : http://localhost:5001/swagger
echo   zekai-api      : http://localhost:5002/swagger
echo   ai-service     : (devre disi - sonradan eklenecek)
echo.
echo   Frontend icin   : scripts\start-frontends.bat
echo.
echo   Komut: docker compose up --build
echo   Durdurmak icin CTRL+C
echo.

pushd "%ROOT_DIR%"
if errorlevel 1 (
  echo [HATA] Proje dizinine girilemedi: %ROOT_DIR%
  pause
  exit /b 1
)

docker compose up --build
set "EXIT_CODE=%ERRORLEVEL%"

popd
pause
exit /b %EXIT_CODE%
