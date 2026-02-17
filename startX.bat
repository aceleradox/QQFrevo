@echo off
title QQfrevo Launcher
cd /d "%~dp0"

echo ===============================
echo Verificando Node.js...
echo ===============================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js nao encontrado.
    echo Baixando Node.js...

    set NODE_URL=https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi
    set NODE_INSTALLER=nodejs_installer.msi

    powershell -Command "Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%NODE_INSTALLER%'"

    echo Instalando Node.js...
    msiexec /i "%NODE_INSTALLER%" /qn /norestart

    echo Node.js instalado.
    del "%NODE_INSTALLER%"
) else (
    echo Node.js ja esta instalado.
)

echo ===============================
echo Iniciando aplicacao...
echo ===============================

start "" npx electron qqfrevo-gtk.js

exit
