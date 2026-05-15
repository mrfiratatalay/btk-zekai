@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Zekai - Backend Setup

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
set "BACKEND_DIR=%ROOT_DIR%\backend"
set "VENV_DIR=%BACKEND_DIR%\.venv"
set "PYTHON_EXE=%VENV_DIR%\Scripts\python.exe"

echo.
echo ============================================================
echo  Zekai - Backend Setup
echo ============================================================
echo.
echo [INFO] Backend klas: %BACKEND_DIR%
echo.

rem ── requirements.txt kontrolu ────────────────────────────────
if not exist "%BACKEND_DIR%\requirements.txt" (
  echo [HATA] backend\requirements.txt bulunamadi.
  goto :fail
)

rem ── Python kontrolu ──────────────────────────────────────────
where python >nul 2>nul
if errorlevel 1 (
  echo [HATA] Python PATH'te bulunamadi.
  echo [IPUCU] Python 3.11 veya 3.12 yukle, terminali yeniden ac.
  goto :fail
)

echo [INFO] Python: & python --version

rem ── Sanal ortam olustur ──────────────────────────────────────
if not exist "%VENV_DIR%" (
  echo [INFO] Sanal ortam olusturuluyor...
  python -m venv "%VENV_DIR%"
  if errorlevel 1 (
    echo [HATA] Sanal ortam olusturulamadi.
    goto :fail
  )
)

rem ── pip guncelle ─────────────────────────────────────────────
echo [INFO] pip guncelleniyor...
"%PYTHON_EXE%" -m pip install --upgrade pip
if errorlevel 1 goto :fail

rem ── Bagimliliklar yukle ──────────────────────────────────────
echo [INFO] Backend bagimliliklari yukleniyor...
"%PYTHON_EXE%" -m pip install -r "%BACKEND_DIR%\requirements.txt"
if errorlevel 1 (
  echo [HATA] Bagimlilik yuklemesi basarisiz.
  goto :fail
)

rem ── .env olustur ─────────────────────────────────────────────
if not exist "%BACKEND_DIR%\buyer_agent\.env" (
  if exist "%BACKEND_DIR%\buyer_agent\.env.example" (
    copy "%BACKEND_DIR%\buyer_agent\.env.example" "%BACKEND_DIR%\buyer_agent\.env" >nul
    echo.
    echo [UYARI] backend\buyer_agent\.env, .env.example'dan olusturuldu.
    echo [UYARI] Baslatmadan once GOOGLE_API_KEY'i ekle.
  )
)

echo.
echo [OK] Backend kurulumu tamamlandi.
goto :done

:fail
echo.
echo ============================================================
echo  Kurulum basarisiz. Yukardaki mesaji oku.
echo ============================================================
echo.
pause
exit /b 1

:done
echo.
pause
exit /b 0
