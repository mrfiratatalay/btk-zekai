@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Zekai - Backend Setup

set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%.." >nul
set "ROOT_DIR=%CD%"
popd >nul

set "BACKEND_DIR=%ROOT_DIR%\ZekAI.Backend"
set "API_PROJECT=%BACKEND_DIR%\src\ZekAI.Api"
set "INFRA_PROJECT=%BACKEND_DIR%\src\ZekAI.Infrastructure"
set "LOG_DIR=%ROOT_DIR%\scripts\logs"

rem ── Tarih/saat al (locale-safe) ─────────────────────────────
for /f %%d in ('powershell -noprofile -command "Get-Date -Format yyyyMMdd-HHmmss"') do set "TIMESTAMP=%%d"
set "LOG_FILE=%LOG_DIR%\setup-backend-%TIMESTAMP%.log"

rem ── Log klasoru olustur ─────────────────────────────────────
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo.
echo ============================================================
echo   Zekai - Backend Setup  (.NET / PostgreSQL)
echo ============================================================
echo.
echo [INFO] Backend klas : %BACKEND_DIR%
echo [INFO] Log dosyasi  : %LOG_FILE%
echo.

call :log "============================================================"
call :log "  Zekai Backend Setup baslatildi"
call :log "============================================================"
call :log "Backend klas: %BACKEND_DIR%"

rem ── .NET SDK kontrolu ────────────────────────────────────────
where dotnet >nul 2>nul
if errorlevel 1 (
  echo [HATA] .NET SDK PATH'te bulunamadi.
  echo [IPUCU] https://dotnet.microsoft.com/download adresinden .NET 10 SDK yukle.
  call :log "[HATA] .NET SDK bulunamadi."
  goto :fail
)

for /f "tokens=*" %%v in ('dotnet --version') do set "DOTNET_VER=%%v"
echo [INFO] dotnet: %DOTNET_VER%
call :log ".NET SDK: %DOTNET_VER%"

rem ── Proje kontrolu ───────────────────────────────────────────
if not exist "%API_PROJECT%\ZekAI.Api.csproj" (
  echo [HATA] ZekAI.Api.csproj bulunamadi: %API_PROJECT%
  call :log "[HATA] ZekAI.Api.csproj bulunamadi."
  goto :fail
)

rem ── dotnet-ef arac kontrolu ──────────────────────────────────
dotnet tool list -g | findstr /I "dotnet-ef" >nul 2>nul
if errorlevel 1 (
  echo [INFO] dotnet-ef arac yukleniyor...
  call :log "[INFO] dotnet-ef yukleniyor..."
  dotnet tool install --global dotnet-ef
  if errorlevel 1 (
    echo [HATA] dotnet-ef yuklenemedi.
    call :log "[HATA] dotnet-ef yuklenemedi."
    goto :fail
  )
  call :log "[OK] dotnet-ef yuklendi."
)

rem ── NuGet paketleri ──────────────────────────────────────────
echo.
echo [INFO] NuGet paketleri yukleniyor...
call :log "[INFO] NuGet restore baslatiliyor..."
pushd "%BACKEND_DIR%"
dotnet restore
if errorlevel 1 (
  echo [HATA] dotnet restore basarisiz.
  call :log "[HATA] dotnet restore basarisiz."
  popd
  goto :fail
)
popd
call :log "[OK] NuGet restore tamamlandi."

rem ── PostgreSQL uyarisi ───────────────────────────────────────
echo.
echo [UYARI] PostgreSQL calisir olmali!
echo [UYARI] Connection string: Host=localhost;Database=zekai_db;Username=postgres
echo [UYARI] Farkli bir kullanici/sifre kullaniyorsan:
echo [UYARI]   %API_PROJECT%\appsettings.json dosyasini duzenle.
echo.

rem ── EF Core migration uygula ─────────────────────────────────
echo [INFO] Veritabani migration uygulanıyor...
call :log "[INFO] EF migration uygulanıyor..."
pushd "%BACKEND_DIR%"
dotnet ef database update --project src\ZekAI.Infrastructure --startup-project src\ZekAI.Api
if errorlevel 1 (
  echo [HATA] Migration uygulanamadi.
  echo [IPUCU] PostgreSQL calistigindan ve connection string dogru oldugunden emin ol.
  call :log "[HATA] EF migration basarisiz."
  popd
  goto :fail
)
popd
call :log "[OK] EF migration tamamlandi."

rem ── ZekAI Platform .env.local ────────────────────────────────
set "ENV_FILE=%ROOT_DIR%\zekai\.env.local"
if not exist "%ENV_FILE%" (
  echo [INFO] zekai\.env.local olusturuluyor...
  > "%ENV_FILE%" echo NEXT_PUBLIC_API_URL=http://localhost:5224
  echo [OK] .env.local olusturuldu.
  call :log "[OK] zekai\.env.local olusturuldu."
) else (
  findstr /C:"NEXT_PUBLIC_API_URL" "%ENV_FILE%" >nul 2>nul
  if errorlevel 1 (
    echo NEXT_PUBLIC_API_URL=http://localhost:5224 >> "%ENV_FILE%"
    echo [OK] NEXT_PUBLIC_API_URL .env.local'a eklendi.
    call :log "[OK] NEXT_PUBLIC_API_URL zekai\.env.local'a eklendi."
  ) else (
    echo [INFO] .env.local zaten mevcut, atlaniyor.
  )
)

echo.
echo ============================================================
echo   Kurulum tamamlandi!
echo ============================================================
echo.
echo   Sonraki adim: scripts\start-all.bat
echo.
call :log "[DONE] Backend kurulumu tamamlandi."
goto :done

:fail
echo.
echo ============================================================
echo   Kurulum basarisiz. Yukardaki mesaji oku.
echo ============================================================
echo.
call :log "[FAIL] Backend kurulumu basarisiz."
pause
exit /b 1

:done
echo.
pause
exit /b 0

rem ── Log fonksiyonu ──────────────────────────────────────────
:log
set "MSG=%~1"
echo [%TIMESTAMP%] %MSG% >> "%LOG_FILE%" 2>nul
goto :eof
