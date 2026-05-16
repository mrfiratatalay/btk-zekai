@echo off
setlocal EnableExtensions
set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
pushd "%ROOT_DIR%"
docker compose up --build commerce-api zekai-api postgres redis ai-service
set "EXIT_CODE=%ERRORLEVEL%"
popd
exit /b %EXIT_CODE%
