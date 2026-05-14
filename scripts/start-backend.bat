@echo off
setlocal EnableExtensions EnableDelayedExpansion
title BTK Zekai - ADK Backend

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
set "BACKEND_DIR=%ROOT_DIR%\backend"
set "VENV_DIR=%BACKEND_DIR%\.venv"
set "PYTHON_EXE=%VENV_DIR%\Scripts\python.exe"
set "ENV_FILE=%BACKEND_DIR%\buyer_agent\.env"
set "DEFAULT_PORT=8000"
set "PORT=%DEFAULT_PORT%"
set "DID_PUSHD=0"

echo.
echo ============================================================
echo  BTK Zekai - ADK Backend
echo ============================================================
echo.
echo [INFO] Backend dir: %BACKEND_DIR%
echo.

if not exist "%BACKEND_DIR%\main.py" (
  echo [ERROR] backend\main.py was not found.
  goto :fail
)

if not exist "%PYTHON_EXE%" (
  echo [WARN ] Backend virtual environment not found.
  call "%SCRIPT_DIR%setup-backend.bat"
  if errorlevel 1 goto :fail
)

if not exist "%ENV_FILE%" (
  echo [ERROR] backend\buyer_agent\.env was not found.
  echo [HINT ] Run scripts\setup-backend.bat, then add GOOGLE_API_KEY.
  goto :fail
)

findstr /B /C:"GOOGLE_API_KEY=" "%ENV_FILE%" >nul 2>nul
if errorlevel 1 (
  echo [ERROR] GOOGLE_API_KEY is missing in backend\buyer_agent\.env.
  goto :fail
)

findstr /C:"GOOGLE_API_KEY=your_google_ai_studio_key" "%ENV_FILE%" >nul 2>nul
if not errorlevel 1 (
  echo [ERROR] backend\buyer_agent\.env still contains the placeholder API key.
  echo [HINT ] Replace it with a real Google AI Studio API key.
  goto :fail
)

pushd "%BACKEND_DIR%" >nul
if errorlevel 1 goto :fail
set "DID_PUSHD=1"

echo [INFO] Checking backend port %DEFAULT_PORT%...
for /f "tokens=5" %%A in ('netstat -ano ^| findstr /R /C:":%DEFAULT_PORT% .*LISTENING"') do (
  set "PORT_PID=%%A"
)

if defined PORT_PID (
  echo [WARN ] Port %DEFAULT_PORT% is already in use by PID !PORT_PID!.
  echo [INFO] Stopping existing process on port %DEFAULT_PORT%...
  taskkill /PID !PORT_PID! /F >nul 2>nul
  if errorlevel 1 (
    echo [ERROR] Could not stop process !PORT_PID!.
    echo [HINT ] Close the process manually, then run this script again.
    goto :fail
  )
  timeout /t 2 /nobreak >nul
)

netstat -ano | findstr /R /C:":%DEFAULT_PORT% .*LISTENING" >nul 2>nul
if not errorlevel 1 (
  echo [ERROR] Port %DEFAULT_PORT% is still in use after cleanup.
  goto :fail
)

echo.
echo [INFO] Starting ADK backend...
echo [INFO] API: http://localhost:%PORT%
echo [INFO] Docs: http://localhost:%PORT%/docs
echo [INFO] Press Ctrl+C to stop the server.
echo.

set "PORT=%PORT%"
"%PYTHON_EXE%" main.py

echo.
echo [WARN ] Backend stopped.
goto :done

:fail
if "%DID_PUSHD%"=="1" popd >nul 2>nul
echo.
echo ============================================================
echo  Backend startup failed. Read the message above for the cause.
echo ============================================================
pause
exit /b 1

:done
popd >nul 2>nul
pause
exit /b 0
