@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Zekai - Frontend Dev Server

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
set "FRONTEND_DIR=%ROOT_DIR%\zekai"
set "FRONTEND_ENV=%FRONTEND_DIR%\.env.local"
set "DEFAULT_PORT=3000"
set "PORT=%DEFAULT_PORT%"
set "DID_PUSHD=0"

echo.
echo ============================================================
echo  Zekai - Frontend Dev Server  ^(Next.js^)
echo ============================================================
echo.
echo [INFO] Proje koku   : %ROOT_DIR%
echo [INFO] Frontend klas: %FRONTEND_DIR%
echo.

rem ── Klasor kontrolu ──────────────────────────────────────────
if not exist "%FRONTEND_DIR%\package.json" (
  echo [HATA] zekai\package.json bulunamadi.
  echo [IPUCU] Bu script scripts\ klasorunden calistirilmali.
  echo        Beklenen: scripts\start-frontend.bat  +  zekai\package.json
  goto :fail
)

rem ── Node.js ──────────────────────────────────────────────────
where node >nul 2>nul
if errorlevel 1 (
  echo [HATA] Node.js PATH'te bulunamadi.
  echo [IPUCU] Node.js LTS yukle, terminali yeniden ac.
  goto :fail
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [HATA] npm PATH'te bulunamadi. Node.js ile birlikte gelir.
  goto :fail
)

echo [INFO] Node: & node -v
echo [INFO] npm : & call npm -v

rem ── Dizine gir ───────────────────────────────────────────────
pushd "%FRONTEND_DIR%" >nul
if errorlevel 1 (
  echo [HATA] Frontend dizinine girilemedi.
  goto :fail
)
set "DID_PUSHD=1"

rem ── Bagimliliklar ────────────────────────────────────────────
if not exist "node_modules" (
  echo.
  echo [INFO] node_modules bulunamadi. Bagimliliklar yukleniyor...
  if exist "package-lock.json" (
    call npm ci
  ) else (
    call npm install
  )
  if errorlevel 1 (
    echo.
    echo [HATA] Bagimlilik yuklemesi basarisiz.
    goto :fail
  )
)

rem ── .env.local ───────────────────────────────────────────────
if not exist "%FRONTEND_ENV%" (
  echo [INFO] .env.local olusturuluyor...
  > "%FRONTEND_ENV%" echo NEXT_PUBLIC_ADK_API_URL=http://localhost:8000
)

rem ── Port bul ─────────────────────────────────────────────────
echo.
echo [INFO] Port %DEFAULT_PORT% kontrol ediliyor...
for /l %%P in (%DEFAULT_PORT%,1,3010) do (
  netstat -ano | findstr /R /C:":%%P .*LISTENING" >nul 2>nul
  if errorlevel 1 (
    set "PORT=%%P"
    goto :port_found
  )
)

echo [HATA] %DEFAULT_PORT%-3010 arasinda bos port bulunamadi.
goto :fail

:port_found
if not "%PORT%"=="%DEFAULT_PORT%" (
  echo [UYARI] Port %DEFAULT_PORT% kullaniliyor, %PORT% portuna gecildi.
)

echo.
echo [INFO] Frontend dev server baslatiliyor...
echo [INFO] Adres  : http://localhost:%PORT%
echo [INFO] API    : http://localhost:8000
echo [INFO] Durdurmak icin Ctrl+C
echo.

set "PORT=%PORT%"
set "NEXT_PUBLIC_ADK_API_URL=http://localhost:8000"
call npm run dev

echo.
echo [UYARI] Dev server durdu.
goto :done

:fail
if "%DID_PUSHD%"=="1" popd >nul 2>nul
echo.
echo ============================================================
echo  Baslama basarisiz. Yukardaki mesaji oku.
echo ============================================================
echo.
pause
exit /b 1

:done
popd >nul 2>nul
echo.
pause
exit /b 0
