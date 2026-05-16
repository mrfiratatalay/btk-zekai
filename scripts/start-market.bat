@echo off
setlocal EnableExtensions EnableDelayedExpansion
title ZekAI Market - Port 3002

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
set "MARKET_DIR=%ROOT_DIR%\mock-shop"
set "PORT=3002"

echo.
echo ============================================================
echo   ZekAI Market - Frontend Dev Server
echo   Port: %PORT%
echo ============================================================
echo.

rem ── Klasor kontrolu ──────────────────────────────────────────
if not exist "%MARKET_DIR%\package.json" (
  echo [HATA] mock-shop\package.json bulunamadi.
  goto :fail
)

rem ── Node.js kontrolu ─────────────────────────────────────────
where node >nul 2>nul
if errorlevel 1 (
  echo [HATA] Node.js bulunamadi. Yukle ve terminali yeniden ac.
  goto :fail
)
echo [OK] Node: & node -v

rem ── Port %PORT% dolu mu? Doluysa kill et ─────────────────────
echo.
echo [INFO] Port %PORT% kontrol ediliyor...
set "PORT_PID="
for /f "tokens=5" %%A in ('netstat -ano 2^>nul ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
  if not defined PORT_PID set "PORT_PID=%%A"
)
if defined PORT_PID (
  echo [UYARI] Port %PORT% PID !PORT_PID! tarafindan kullaniliyor.
  echo [INFO]  Islem sonlandiriliyor...
  taskkill /PID !PORT_PID! /F >nul 2>nul
  timeout /t 2 /nobreak >nul
  echo [OK]   Port %PORT% serbest birakildi.
)

rem ── Dizine gir ───────────────────────────────────────────────
pushd "%MARKET_DIR%"
if errorlevel 1 (
  echo [HATA] mock-shop dizinine girilemedi.
  goto :fail
)

rem ── node_modules kontrolu ────────────────────────────────────
if not exist "node_modules" (
  echo.
  echo [INFO] node_modules bulunamadi. Yukleniyor...
  call npm install
  if errorlevel 1 (
    echo [HATA] npm install basarisiz.
    popd
    goto :fail
  )
)

rem ── Baslat ───────────────────────────────────────────────────
echo.
echo ============================================================
echo   ZekAI Market baslatiliyor
echo   http://localhost:%PORT%
echo   Durdurmak icin Ctrl+C
echo ============================================================
echo.

call npm run dev

echo.
echo [UYARI] Market dev server durdu.
popd
pause
exit /b 0

:fail
echo.
echo [HATA] Baslatma basarisiz. Yukardaki mesajlari oku.
echo.
pause
exit /b 1
