@echo off
setlocal EnableExtensions
title ZekAI - Frontendler (Yerel)

set "MARKET_DIR=%~dp0..\apps\akilli-market-web"
set "PLATFORM_DIR=%~dp0..\apps\zekai-platform-web"
set "MARKET_PORT=3000"
set "PLATFORM_PORT=3001"

echo.
echo ============================================================
echo   ZekAI - Frontendler (Yerel Calistirma)
echo ============================================================
echo.
echo   Akilli Market  : http://localhost:%MARKET_PORT%
echo   ZekAI Platform : http://localhost:%PLATFORM_PORT%
echo.
echo   DIKKAT: Docker backend'in calisir olmasi gerekiyor!
echo   Backend icin   : scripts\start-docker.bat
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [HATA] Node.js bulunamadi.
  echo [HATA] Lutfen Node.js LTS kurun ve bu dosyayi tekrar calistirin.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [HATA] npm bulunamadi.
  echo [HATA] Node.js kurulumunu kontrol edin.
  pause
  exit /b 1
)

if not exist "%MARKET_DIR%\package.json" (
  echo [HATA] Akilli Market klasoru bulunamadi: %MARKET_DIR%
  pause
  exit /b 1
)

if not exist "%PLATFORM_DIR%\package.json" (
  echo [HATA] ZekAI Platform klasoru bulunamadi: %PLATFORM_DIR%
  pause
  exit /b 1
)

call :ensure_env "%MARKET_DIR%" "akilli-market-web"
if errorlevel 1 exit /b 1

call :ensure_env "%PLATFORM_DIR%" "zekai-platform-web"
if errorlevel 1 exit /b 1

call :ensure_deps "%MARKET_DIR%" "akilli-market-web"
if errorlevel 1 exit /b 1

call :ensure_deps "%PLATFORM_DIR%" "zekai-platform-web"
if errorlevel 1 exit /b 1

echo.
echo [1/2] Akilli Market Web baslatiliyor (port %MARKET_PORT%)...
start "Akilli Market (%MARKET_PORT%)" cmd /k "cd /d ""%MARKET_DIR%"" && npm run dev"

timeout /t 2 /nobreak >nul

echo [2/2] ZekAI Platform baslatiliyor (port %PLATFORM_PORT%)...
start "ZekAI Platform (%PLATFORM_PORT%)" cmd /k "cd /d ""%PLATFORM_DIR%"" && npm run dev -- --port %PLATFORM_PORT%"

echo.
echo Her iki frontend yeni pencerelerde baslatildi.
echo Bu pencereyi kapatabilirsiniz; frontendler calismaya devam eder.
echo.
pause
exit /b 0

:ensure_env
set "APP_DIR=%~1"
set "APP_NAME=%~2"
if not exist "%APP_DIR%\.env.local" (
  if exist "%APP_DIR%\.env.example" (
    echo [SETUP] %APP_NAME% icin .env.local olusturuluyor...
    copy "%APP_DIR%\.env.example" "%APP_DIR%\.env.local" >nul
    echo [SETUP] .env.local olusturuldu.
  ) else (
    echo [UYARI] %APP_NAME% icin .env.local bulunamadi!
    echo [UYARI] Lutfen .env.example dosyasini kontrol edin.
  )
)
exit /b 0

:ensure_deps
set "APP_DIR=%~1"
set "APP_NAME=%~2"
if exist "%APP_DIR%\node_modules\.bin\next.cmd" (
  echo [OK] %APP_NAME% bagimliliklari hazir.
  exit /b 0
)

echo.
echo [SETUP] %APP_NAME% bagimliliklari kuruluyor...
pushd "%APP_DIR%"
if errorlevel 1 (
  echo [HATA] Klasore girilemedi: %APP_DIR%
  exit /b 1
)

npm install
set "INSTALL_EXIT=%ERRORLEVEL%"
popd
if not "%INSTALL_EXIT%"=="0" (
  echo [HATA] %APP_NAME% icin npm install basarisiz oldu.
  pause
  exit /b %INSTALL_EXIT%
)

if not exist "%APP_DIR%\node_modules\.bin\next.cmd" (
  echo [HATA] %APP_NAME% icinde Next.js kurulumu bulunamadi.
  echo [HATA] package.json ve npm install ciktisini kontrol edin.
  pause
  exit /b 1
)

echo [OK] %APP_NAME% bagimliliklari kuruldu.
exit /b 0
