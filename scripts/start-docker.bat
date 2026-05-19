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
echo   commerce-api   : http://localhost:5001/swagger
echo   zekai-api      : http://localhost:5002/swagger
echo   ai-service     : http://localhost:8000/health
echo.
echo   Frontend icin   : scripts\start-frontends.bat
echo.
echo   Mod: Dusuk kaynak kullanimi, sirali build, arka planda calisma
echo   Loglar icin: docker compose logs -f
echo   Durdurmak icin: docker compose down
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

set "COMPOSE_PARALLEL_LIMIT=1"
set "MISSING_IMAGE=0"

for %%I in (btk-zekai-commerce-api:latest btk-zekai-zekai-api:latest btk-zekai-ai-service:latest) do (
  docker image inspect %%I >nul 2>nul
  if errorlevel 1 set "MISSING_IMAGE=1"
)

if "%MISSING_IMAGE%"=="1" (
  echo [BUILD] Eksik image var. PC kasmasin diye servisler sirayla build ediliyor...
  docker compose build commerce-api
  if errorlevel 1 goto compose_failed
  docker compose build zekai-api
  if errorlevel 1 goto compose_failed
  docker compose build ai-service
  if errorlevel 1 goto compose_failed
) else (
  echo [OK] Image'lar hazir. Build yapmadan baslatiliyor...
)

echo [START] Servisler arka planda baslatiliyor...
docker compose up -d postgres
if errorlevel 1 goto compose_failed
docker compose up -d ai-service commerce-api zekai-api
if errorlevel 1 goto compose_failed

echo.
echo [OK] Backend servisleri calisiyor.
echo   commerce-api   : http://localhost:5001/swagger
echo   zekai-api      : http://localhost:5002/swagger
echo   ai-service     : http://localhost:8000/health
echo.
echo Loglar:
echo   docker compose logs -f
echo.
echo Durdurmak:
echo   docker compose down
echo.
set "EXIT_CODE=0"
goto done

:compose_failed
set "EXIT_CODE=%ERRORLEVEL%"

:done
popd
pause
exit /b %EXIT_CODE%
