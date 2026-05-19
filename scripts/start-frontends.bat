@echo off
setlocal EnableExtensions
title ZekAI - Frontendler (Yerel)

set "MARKET_DIR=%~dp0..\apps\akilli-market-web"
set "PLATFORM_DIR=%~dp0..\apps\zekai-platform-web"
set "LOG_DIR=%~dp0logs"
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

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%" >nul 2>nul

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
call :start_frontend "%MARKET_DIR%" "akilli-market-web" "%MARKET_PORT%"
if errorlevel 1 exit /b 1

timeout /t 2 /nobreak >nul

echo [2/2] ZekAI Platform baslatiliyor (port %PLATFORM_PORT%)...
call :start_frontend "%PLATFORM_DIR%" "zekai-platform-web" "%PLATFORM_PORT%"
if errorlevel 1 exit /b 1

echo.
echo Frontendler arka planda baslatildi. Yeni terminal penceresi acilmayacak.
echo.
echo Loglar:
echo   scripts\logs\akilli-market-web.out.log
echo   scripts\logs\akilli-market-web.err.log
echo   scripts\logs\zekai-platform-web.out.log
echo   scripts\logs\zekai-platform-web.err.log
echo.
echo Durdurmak icin:
echo   scripts\stop-frontends.bat
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

:start_frontend
set "APP_DIR=%~1"
set "APP_NAME=%~2"
set "APP_PORT=%~3"
set "OUT_LOG=%LOG_DIR%\%APP_NAME%.out.log"
set "ERR_LOG=%LOG_DIR%\%APP_NAME%.err.log"
set "PID_FILE=%LOG_DIR%\%APP_NAME%.pid"

powershell -NoProfile -ExecutionPolicy Bypass -Command "if ((Test-NetConnection -ComputerName 127.0.0.1 -Port %APP_PORT% -InformationLevel Quiet)) { exit 0 } else { exit 1 }" >nul 2>nul
if "%ERRORLEVEL%"=="0" (
  echo [OK] %APP_NAME% zaten calisiyor: http://localhost:%APP_PORT%
  exit /b 0
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$p = Start-Process -FilePath 'npm.cmd' -ArgumentList @('run','dev','--','--port','%APP_PORT%') -WorkingDirectory '%APP_DIR%' -WindowStyle Hidden -RedirectStandardOutput '%OUT_LOG%' -RedirectStandardError '%ERR_LOG%' -PassThru; Set-Content -Path '%PID_FILE%' -Value $p.Id"
if errorlevel 1 (
  echo [HATA] %APP_NAME% baslatilamadi. Loglari kontrol edin:
  echo   %OUT_LOG%
  echo   %ERR_LOG%
  pause
  exit /b 1
)

timeout /t 3 /nobreak >nul
powershell -NoProfile -ExecutionPolicy Bypass -Command "if ((Test-NetConnection -ComputerName 127.0.0.1 -Port %APP_PORT% -InformationLevel Quiet)) { exit 0 } else { exit 1 }" >nul 2>nul
if "%ERRORLEVEL%"=="0" (
  echo [OK] %APP_NAME% hazir: http://localhost:%APP_PORT%
  exit /b 0
)

echo [UYARI] %APP_NAME% baslatildi ama port henuz cevap vermiyor. Biraz bekleyin veya loglara bakin:
echo   %OUT_LOG%
echo   %ERR_LOG%
exit /b 0
