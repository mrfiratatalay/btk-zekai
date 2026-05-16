@echo off
setlocal EnableExtensions EnableDelayedExpansion
title ZekAI Platform - Port 3000

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
set "FRONTEND_DIR=%ROOT_DIR%\zekai"
set "FRONTEND_ENV=%FRONTEND_DIR%\.env.local"
set "PORT=3000"

echo.
echo ============================================================
echo   ZekAI Platform - Frontend Dev Server
echo   Port: %PORT%
echo ============================================================
echo.

rem ── Klasor kontrolu ──────────────────────────────────────────
if not exist "%FRONTEND_DIR%\package.json" (
  echo [HATA] zekai\package.json bulunamadi.
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
pushd "%FRONTEND_DIR%"
if errorlevel 1 (
  echo [HATA] zekai dizinine girilemedi.
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

rem ── .env.local ───────────────────────────────────────────────
if not exist "%FRONTEND_ENV%" (
  echo [INFO] .env.local olusturuluyor...
  > "%FRONTEND_ENV%" echo NEXT_PUBLIC_API_URL=http://localhost:5224
  echo [OK] .env.local olusturuldu.
)

rem ── Baslat ───────────────────────────────────────────────────
echo.
echo ============================================================
echo   ZekAI Platform baslatiliyor
echo   http://localhost:%PORT%
echo   API: http://localhost:5224
echo   Durdurmak icin Ctrl+C
echo ============================================================
echo.

set "NEXT_PUBLIC_API_URL=http://localhost:5224"
call npm run dev

echo.
echo [UYARI] Platform dev server durdu.
popd
pause
exit /b 0

:fail
echo.
echo [HATA] Baslatma basarisiz. Yukardaki mesajlari oku.
echo.
pause
exit /b 1
