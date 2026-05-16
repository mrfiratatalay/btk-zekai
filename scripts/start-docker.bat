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

where docker >nul 2>nul
if errorlevel 1 (
  echo [HATA] Docker komutu bulunamadi.
  echo [HATA] Docker Desktop kurulu ve PATH'e ekli olmalidir.
  pause
  exit /b 1
)

docker compose version >nul 2>nul
if errorlevel 1 (
  echo [HATA] Docker Compose calismiyor.
  echo [HATA] Docker Desktop'i acin ve tekrar deneyin.
  pause
  exit /b 1
)

if not exist "%ROOT_DIR%\docker-compose.yml" (
  echo [HATA] docker-compose.yml bulunamadi: %ROOT_DIR%
  pause
  exit /b 1
)

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
