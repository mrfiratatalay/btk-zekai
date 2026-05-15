@echo off
setlocal EnableExtensions
title Zekai - Full Stack Launcher

set "SCRIPT_DIR=%~dp0"
set "BACKEND_SCRIPT=%SCRIPT_DIR%start-backend.bat"
set "FRONTEND_SCRIPT=%SCRIPT_DIR%start-frontend.bat"

echo.
echo ============================================================
echo  Zekai - Full Stack Launcher
echo ============================================================
echo.
echo [INFO] Backend  : http://localhost:8000
echo [INFO] Frontend : http://localhost:3000
echo [INFO] Her biri ayri terminal penceresinde acilacak.
echo.

if not exist "%BACKEND_SCRIPT%" (
  echo [HATA] scripts\start-backend.bat bulunamadi.
  goto :fail
)

if not exist "%FRONTEND_SCRIPT%" (
  echo [HATA] scripts\start-frontend.bat bulunamadi.
  goto :fail
)

start "Zekai - ADK Backend"  cmd /k ""%BACKEND_SCRIPT%""
timeout /t 3 /nobreak >nul
start "Zekai - Frontend"     cmd /k ""%FRONTEND_SCRIPT%""

echo [OK] Her iki server baslatma komutu gonderildi.
echo [INFO] Gelistirme surerken her iki terminal penceresini acik tut.
echo.
pause
exit /b 0

:fail
echo.
echo ============================================================
echo  Baslama basarisiz. Yukardaki mesaji oku.
echo ============================================================
echo.
pause
exit /b 1
