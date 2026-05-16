@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Zekai - .NET Backend - Port 5224

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
set "BACKEND_DIR=%ROOT_DIR%\ZekAI.Backend"
set "PORT=5224"

echo.
echo ============================================================
echo   Zekai - .NET Backend
echo   Port: %PORT%
echo   Swagger: http://localhost:%PORT%/swagger
echo ============================================================
echo.

rem ── .NET SDK kontrolu ────────────────────────────────────────
where dotnet >nul 2>nul
if errorlevel 1 (
  echo [HATA] .NET SDK bulunamadi.
  echo [IPUCU] https://dotnet.microsoft.com/download
  goto :fail
)
echo [OK] dotnet: & dotnet --version

rem ── Proje kontrolu ───────────────────────────────────────────
if not exist "%BACKEND_DIR%\src\ZekAI.Api\ZekAI.Api.csproj" (
  echo [HATA] ZekAI.Api.csproj bulunamadi.
  goto :fail
)

rem ── Port %PORT% dolu mu? Doluysa kill et ─────────────────────
echo.
echo [INFO] Port %PORT% kontrol ediliyor...
set "PORT_PID="
for /f "tokens=5" %%A in ('netstat -ano 2^>nul ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
  if not defined PORT_PID set "PORT_PID=%%A"
)
if defined PORT_PID (
  echo [UYARI] Port %PORT% PID !PORT_PID! tarafindan kullaniliyor.
  echo [INFO]  Islem sonlandiriliyor...
  taskkill /PID !PORT_PID! /F >nul 2>nul
  timeout /t 2 /nobreak >nul
  echo [OK]   Port %PORT% serbest birakildi.
)

rem ── Dizine gir ───────────────────────────────────────────────
pushd "%BACKEND_DIR%"
if errorlevel 1 (
  echo [HATA] Backend dizinine girilemedi.
  goto :fail
)

rem ── Baslat ───────────────────────────────────────────────────
echo.
echo ============================================================
echo   .NET Backend baslatiliyor
echo   http://localhost:%PORT%
echo   Swagger: http://localhost:%PORT%/swagger
echo   Durdurmak icin Ctrl+C
echo ============================================================
echo.

dotnet run --project src\ZekAI.Api --launch-profile http

echo.
echo [UYARI] Backend durdu.
popd
pause
exit /b 0

:fail
echo.
echo [HATA] Baslatma basarisiz. Yukardaki mesajlari oku.
echo.
pause
exit /b 1
