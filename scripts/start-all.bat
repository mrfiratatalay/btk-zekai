@echo off
setlocal EnableExtensions
title BTK Zekai - Full Stack Launcher

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
set "BACKEND_SCRIPT=%SCRIPT_DIR%start-backend.bat"
set "FRONTEND_SCRIPT=%SCRIPT_DIR%start-frontend.bat"

echo.
echo ============================================================
echo  BTK Zekai - Full Stack Launcher
echo ============================================================
echo.
echo [INFO] This opens backend and frontend in separate terminal windows.
echo [INFO] Backend : http://localhost:8000
echo [INFO] Frontend: http://localhost:3000
echo.

if not exist "%BACKEND_SCRIPT%" (
  echo [ERROR] scripts\start-backend.bat was not found.
  goto :fail
)

if not exist "%FRONTEND_SCRIPT%" (
  echo [ERROR] scripts\start-frontend.bat was not found.
  goto :fail
)

start "BTK Zekai - ADK Backend" cmd /k ""%BACKEND_SCRIPT%""
timeout /t 3 /nobreak >nul
start "BTK Zekai - Frontend" cmd /k ""%FRONTEND_SCRIPT%""

echo [OK] Startup commands were launched.
echo [INFO] Keep both terminal windows open while developing.
echo.
pause
exit /b 0

:fail
echo.
echo ============================================================
echo  Full stack startup failed. Read the message above for the cause.
echo ============================================================
pause
exit /b 1
