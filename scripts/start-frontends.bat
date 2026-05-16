@echo off
setlocal EnableExtensions
title ZekAI - Frontendler (Yerel)

set "MARKET_DIR=%~dp0..\apps\akilli-market-web"
set "PLATFORM_DIR=%~dp0..\apps\zekai-platform-web"

echo.
echo ============================================================
echo   ZekAI - Frontendler (Yerel Calistirma)
echo ============================================================
echo.
echo   Akilli Market  : http://localhost:3000
echo   ZekAI Platform : http://localhost:3001
echo.
echo   DIKKAT: Docker backend'in calisir olmasi gerekiyor!
echo   Backend icin   : scripts\start-docker.bat
echo.

:: ── .env.local kontrolu - Akilli Market ──
if not exist "%MARKET_DIR%\.env.local" (
  if exist "%MARKET_DIR%\.env.example" (
    echo [SETUP] akilli-market-web icin .env.local olusturuluyor...
    copy "%MARKET_DIR%\.env.example" "%MARKET_DIR%\.env.local" >nul
    echo [SETUP] .env.local olusturuldu.
  ) else (
    echo [UYARI] akilli-market-web icin .env.local bulunamadi!
    echo [UYARI] Lutfen .env.example dosyasini kontrol edin.
  )
)

:: ── .env.local kontrolu - ZekAI Platform ──
if not exist "%PLATFORM_DIR%\.env.local" (
  if exist "%PLATFORM_DIR%\.env.example" (
    echo [SETUP] zekai-platform-web icin .env.local olusturuluyor...
    copy "%PLATFORM_DIR%\.env.example" "%PLATFORM_DIR%\.env.local" >nul
    echo [SETUP] .env.local olusturuldu.
  ) else (
    echo [UYARI] zekai-platform-web icin .env.local bulunamadi!
    echo [UYARI] Lutfen .env.example dosyasini kontrol edin.
  )
)

echo.
echo [1/2] Akilli Market Web baslatiliyor (port 3000)...
start "Akilli Market (3000)" cmd /k "cd /d "%MARKET_DIR%" && npm run dev"

timeout /t 2 /nobreak >nul

echo [2/2] ZekAI Platform baslatiliyor (port 3001)...
start "ZekAI Platform (3001)" cmd /k "cd /d "%PLATFORM_DIR%" && npm run dev -- --port 3001"

echo.
echo Her iki frontend yeni pencerelerde baslatildi.
echo Bu pencereyi kapatabilirsiniz; frontendler calismaya devam eder.
echo.
pause
