@echo off
setlocal EnableExtensions
title BTK Zekai - Backend Setup

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
set "BACKEND_DIR=%ROOT_DIR%\backend"
set "VENV_DIR=%BACKEND_DIR%\.venv"
set "PYTHON_EXE=%VENV_DIR%\Scripts\python.exe"

echo.
echo ============================================================
echo  BTK Zekai - Backend Setup
echo ============================================================
echo.
echo [INFO] Backend dir: %BACKEND_DIR%
echo.

if not exist "%BACKEND_DIR%\requirements.txt" (
  echo [ERROR] backend\requirements.txt was not found.
  goto :fail
)

where python >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Python was not found in PATH.
  echo [HINT ] Install Python 3.11+ or 3.12, then reopen the terminal.
  goto :fail
)

if not exist "%VENV_DIR%" (
  echo [INFO] Creating backend virtual environment...
  python -m venv "%VENV_DIR%"
  if errorlevel 1 goto :fail
)

echo [INFO] Upgrading pip...
"%PYTHON_EXE%" -m pip install --upgrade pip
if errorlevel 1 goto :fail

echo [INFO] Installing backend dependencies...
"%PYTHON_EXE%" -m pip install -r "%BACKEND_DIR%\requirements.txt"
if errorlevel 1 goto :fail

if not exist "%BACKEND_DIR%\buyer_agent\.env" (
  if exist "%BACKEND_DIR%\buyer_agent\.env.example" (
    copy "%BACKEND_DIR%\buyer_agent\.env.example" "%BACKEND_DIR%\buyer_agent\.env" >nul
    echo.
    echo [WARN ] Created backend\buyer_agent\.env from .env.example.
    echo [WARN ] Add your GOOGLE_API_KEY before starting the backend.
  )
)

echo.
echo [OK] Backend setup completed.
goto :done

:fail
echo.
echo ============================================================
echo  Backend setup failed. Read the message above for the cause.
echo ============================================================
pause
exit /b 1

:done
pause
exit /b 0
