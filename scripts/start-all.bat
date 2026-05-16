@echo off
setlocal EnableExtensions
title Zekai - Full Stack Launcher

set "SCRIPT_DIR=%~dp0"
set "BACKEND_SCRIPT=%SCRIPT_DIR%start-backend.bat"
set "FRONTEND_SCRIPT=%SCRIPT_DIR%start-frontend.bat"
set "MARKET_SCRIPT=%SCRIPT_DIR%start-market.bat"

echo.
echo ============================================================
echo   Zekai - Full Stack Launcher
echo ============================================================
echo.
echo   .NET Backend   : http://localhost:5224
echo   ZekAI Platform : http://localhost:3000
echo   ZekAI Market   : http://localhost:3002
echo.
echo   Her biri ayri terminal penceresinde acilacak.
echo.

if not exist "%BACKEND_SCRIPT%" (
  echo [HATA] start-backend.bat bulunamadi.
  goto :fail
)
if not exist "%FRONTEND_SCRIPT%" (
  echo [HATA] start-frontend.bat bulunamadi.
  goto :fail
)
if not exist "%MARKET_SCRIPT%" (
  echo [HATA] start-market.bat bulunamadi.
  goto :fail
)

echo [1/3] .NET Backend baslatiliyor...
start "Zekai - .NET Backend"   cmd /k ""%BACKEND_SCRIPT%""
timeout /t 5 /nobreak >nul

echo [2/3] ZekAI Platform baslatiliyor...
start "Zekai - Platform"       cmd /k ""%FRONTEND_SCRIPT%""
timeout /t 3 /nobreak >nul

echo [3/3] ZekAI Market baslatiliyor...
start "Zekai - Market"         cmd /k ""%MARKET_SCRIPT%""

echo.
echo ============================================================
echo   Tum servisler baslatildi!
echo ============================================================
echo.
echo   .NET Backend   -> http://localhost:5224
echo   ZekAI Platform -> http://localhost:3000
echo   ZekAI Market   -> http://localhost:3002
echo.
pause
exit /b 0

:fail
echo.
echo [HATA] Baslatma basarisiz.
echo.
pause
exit /b 1
