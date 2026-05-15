@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Zekai - ADK Backend

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
set "BACKEND_DIR=%ROOT_DIR%\backend"
set "VENV_DIR=%BACKEND_DIR%\.venv"
set "PYTHON_EXE=%VENV_DIR%\Scripts\python.exe"
set "ENV_FILE=%BACKEND_DIR%\buyer_agent\.env"
set "DEFAULT_PORT=8000"
set "PORT_PID="
set "DID_PUSHD=0"

echo.
echo ============================================================
echo  Zekai - ADK Backend  ^(Python / Google ADK^)
echo ============================================================
echo.
echo [INFO] Backend klas: %BACKEND_DIR%
echo.

rem ── main.py kontrolu ─────────────────────────────────────────
if not exist "%BACKEND_DIR%\main.py" (
  echo [HATA] backend\main.py bulunamadi.
  goto :fail
)

rem ── Sanal ortam ──────────────────────────────────────────────
if not exist "%PYTHON_EXE%" (
  echo [UYARI] Sanal ortam bulunamadi. Setup baslatiliyor...
  call "%SCRIPT_DIR%setup-backend.bat"
  if errorlevel 1 goto :fail
)

rem ── .env kontrolu ────────────────────────────────────────────
if not exist "%ENV_FILE%" (
  echo [HATA] backend\buyer_agent\.env bulunamadi.
  echo [IPUCU] scripts\setup-backend.bat calistir, sonra GOOGLE_API_KEY ekle.
  goto :fail
)

findstr /B /C:"GOOGLE_API_KEY=" "%ENV_FILE%" >nul 2>nul
if errorlevel 1 (
  echo [HATA] GOOGLE_API_KEY, backend\buyer_agent\.env dosyasinda eksik.
  goto :fail
)

findstr /C:"GOOGLE_API_KEY=your_google_ai_studio_key" "%ENV_FILE%" >nul 2>nul
if not errorlevel 1 (
  echo [HATA] .env dosyasindaki API key hala placeholder degeri iceriyor.
  echo [IPUCU] Gercek bir Google AI Studio API key'i ile degistir.
  goto :fail
)

rem ── Dizine gir ───────────────────────────────────────────────
pushd "%BACKEND_DIR%" >nul
if errorlevel 1 goto :fail
set "DID_PUSHD=1"

rem ── Portu temizle ────────────────────────────────────────────
echo [INFO] Port %DEFAULT_PORT% kontrol ediliyor...
for /f "tokens=5" %%A in ('netstat -ano ^| findstr /R /C:":%DEFAULT_PORT% .*LISTENING"') do (
  set "PORT_PID=%%A"
)

if defined PORT_PID (
  echo [UYARI] Port %DEFAULT_PORT%, PID !PORT_PID! tarafindan kullaniliyor.
  echo [INFO] Islemi durduruluyor...
  taskkill /PID !PORT_PID! /F >nul 2>nul
  if errorlevel 1 (
    echo [HATA] PID !PORT_PID! durdurulamadi. Manuel olarak kapat, tekrar calistir.
    goto :fail
  )
  timeout /t 2 /nobreak >nul
)

netstat -ano | findstr /R /C:":%DEFAULT_PORT% .*LISTENING" >nul 2>nul
if not errorlevel 1 (
  echo [HATA] Port %DEFAULT_PORT% hala kullaniliyor. Manuel temizle.
  goto :fail
)

echo.
echo [INFO] ADK Backend baslatiliyor...
echo [INFO] API  : http://localhost:%DEFAULT_PORT%
echo [INFO] Docs : http://localhost:%DEFAULT_PORT%/docs
echo [INFO] Durdurmak icin Ctrl+C
echo.

"%PYTHON_EXE%" main.py

echo.
echo [UYARI] Backend durdu.
goto :done

:fail
if "%DID_PUSHD%"=="1" popd >nul 2>nul
echo.
echo ============================================================
echo  Backend baslamasi basarisiz. Yukardaki mesaji oku.
echo ============================================================
echo.
pause
exit /b 1

:done
popd >nul 2>nul
echo.
pause
exit /b 0
