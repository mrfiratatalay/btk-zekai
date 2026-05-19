@echo off
setlocal EnableExtensions
title ZekAI - Frontendleri Durdur

set "LOG_DIR=%~dp0logs"

echo.
echo ============================================================
echo   ZekAI - Frontendleri Durdur
echo ============================================================
echo.

call :stop_one "akilli-market-web"
call :stop_one "zekai-platform-web"

echo.
echo [OK] Frontend durdurma islemi tamamlandi.
pause
exit /b 0

:stop_one
set "APP_NAME=%~1"
set "PID_FILE=%LOG_DIR%\%APP_NAME%.pid"

if not exist "%PID_FILE%" (
  echo [BILGI] %APP_NAME% icin PID kaydi yok.
  exit /b 0
)

set /p APP_PID=<"%PID_FILE%"
if "%APP_PID%"=="" (
  del "%PID_FILE%" >nul 2>nul
  echo [BILGI] %APP_NAME% PID kaydi bos.
  exit /b 0
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$p = Get-Process -Id %APP_PID% -ErrorAction SilentlyContinue; if ($p) { Stop-Process -Id %APP_PID% -Force; exit 0 } else { exit 2 }" >nul 2>nul
if "%ERRORLEVEL%"=="0" (
  echo [OK] %APP_NAME% durduruldu. PID: %APP_PID%
) else (
  echo [BILGI] %APP_NAME% zaten calismiyor olabilir. PID: %APP_PID%
)

del "%PID_FILE%" >nul 2>nul
exit /b 0
