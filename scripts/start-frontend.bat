@echo off
setlocal EnableExtensions EnableDelayedExpansion
title BTK Zekai - Frontend Dev Server

rem Always resolve paths from this script location so it works from double-click,
rem PowerShell, cmd, VS Code terminal, or any current working directory.
set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
set "FRONTEND_DIR=%ROOT_DIR%\frontend"
set "DEFAULT_PORT=3000"
set "PORT=%DEFAULT_PORT%"
set "DID_PUSHD=0"

echo.
echo ============================================================
echo  BTK Zekai - Frontend Dev Server
echo ============================================================
echo.
echo [INFO] Project root : %ROOT_DIR%
echo [INFO] Frontend dir : %FRONTEND_DIR%
echo.

if not exist "%FRONTEND_DIR%\package.json" (
  echo [ERROR] frontend\package.json was not found.
  echo [HINT ] Run this script from the repository scripts folder, or keep the
  echo        repository layout as: scripts\start-frontend.bat and frontend\package.json
  goto :fail
)

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js was not found in PATH.
  echo [HINT ] Install Node.js LTS, then close and reopen the terminal.
  goto :fail
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm was not found in PATH.
  echo [HINT ] npm normally ships with Node.js LTS.
  goto :fail
)

echo [INFO] Node version:
node -v
if errorlevel 1 goto :fail

echo [INFO] npm version:
call npm -v
if errorlevel 1 goto :fail

pushd "%FRONTEND_DIR%" >nul
if errorlevel 1 (
  echo [ERROR] Could not enter frontend directory.
  goto :fail
)
set "DID_PUSHD=1"

if not exist "node_modules" (
  echo.
  echo [INFO] node_modules not found. Installing dependencies...
  if exist "package-lock.json" (
    call npm ci
  ) else (
    call npm install
  )

  if errorlevel 1 (
    echo.
    echo [ERROR] Dependency installation failed.
    goto :fail
  )
)

echo.
echo [INFO] Checking preferred port %DEFAULT_PORT%...
for /l %%P in (%DEFAULT_PORT%,1,3010) do (
  netstat -ano | findstr /R /C:":%%P .*LISTENING" >nul 2>nul
  if errorlevel 1 (
    set "PORT=%%P"
    goto :port_found
  )
)

echo [ERROR] No free port found between %DEFAULT_PORT% and 3010.
goto :fail

:port_found
if not "%PORT%"=="%DEFAULT_PORT%" (
  echo [WARN ] Port %DEFAULT_PORT% is already in use. Using port %PORT% instead.
)

echo.
echo [INFO] Starting frontend dev server...
echo [INFO] URL: http://localhost:%PORT%
echo [INFO] Press Ctrl+C to stop the server.
echo.

set "PORT=%PORT%"
call npm run dev

echo.
echo [WARN ] The dev server stopped.
goto :done

:fail
if "%DID_PUSHD%"=="1" popd >nul 2>nul
echo.
echo ============================================================
echo  Startup failed. Read the message above for the cause.
echo ============================================================
echo.
pause
exit /b 1

:done
popd >nul 2>nul
echo.
pause
exit /b 0
