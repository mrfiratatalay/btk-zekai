@echo off
setlocal EnableExtensions
set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
pushd "%ROOT_DIR%"
docker compose up --build zekai-platform-web
set "EXIT_CODE=%ERRORLEVEL%"
popd
exit /b %EXIT_CODE%
