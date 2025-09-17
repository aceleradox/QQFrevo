@echo off
setlocal enabledelayedexpansion

:: QQFrevo - Script de Inicialização para Windows
:: Este script verifica e instala todas as dependências necessárias

cls
echo.
echo ============================================
echo        QQFrevo - Sistema de Busca
echo ============================================
echo.

:: Cores (Windows 10+)
:: Verde = 2, Amarelo = 6, Vermelho = 4, Padrão = 7

:: Verificar se Node.js está instalado
echo Verificando Node.js...
node -v >nul 2>&1
if %errorlevel% == 0 (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo [OK] Node.js instalado: !NODE_VERSION!
) else (
    echo [ERRO] Node.js nao esta instalado!
    echo.
    echo Deseja baixar o Node.js agora? (S/N)
    set /p response=
    if /i "!response!"=="S" (
        echo Abrindo pagina de download do Node.js...
        start https://nodejs.org/pt-br/download/
        echo.
        echo Apos instalar o Node.js, execute este script novamente.
        pause
        exit /b 1
    ) else (
        echo Instalacao cancelada. Node.js e necessario para executar o QQFrevo.
        pause
        exit /b 1
    )
)

:: Verificar se npm está instalado
echo Verificando npm...
npm -v >nul 2>&1
if %errorlevel% == 0 (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
    echo [OK] npm instalado: v!NPM_VERSION!
) else (
    echo [ERRO] npm nao esta instalado!
    echo Por favor, reinstale o Node.js.
    pause
    exit /b 1
)

:: Navegar para o diretório do servidor
echo.
echo Navegando para o diretorio do servidor...
cd "QQFrevo XPS server" 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Diretorio "QQFrevo XPS server" nao encontrado!
    echo Certifique-se de executar este script na pasta raiz do projeto.
    pause
    exit /b 1
)

:: Verificar se package.json existe
if not exist "package.json" (
    echo [ERRO] package.json nao encontrado!
    pause
    exit /b 1
)

:: Verificar se as dependências já estão instaladas
echo.
if exist "node_modules" (
    echo [INFO] Dependencias ja parecem estar instaladas.
    echo Deseja reinstalar? (S/N)
    set /p reinstall=
    if /i "!reinstall!"=="N" (
        echo [OK] Pulando instalacao de dependencias.
        goto :check_port
    )
)

:: Instalar dependências
echo.
echo Instalando dependencias do projeto...
echo Isso pode levar alguns minutos...
echo.
npm install
if %errorlevel% == 0 (
    echo.
    echo [OK] Dependencias instaladas com sucesso!
) else (
    echo [ERRO] Erro ao instalar dependencias!
    pause
    exit /b 1
)

:check_port
:: Verificar se a porta 3000 está em uso
echo.
echo Verificando porta 3000...
netstat -an | findstr :3000 | findstr LISTENING >nul 2>&1
if %errorlevel% == 0 (
    echo [AVISO] Porta 3000 ja esta em uso!
    echo.
    echo Deseja tentar encerrar o processo? (S/N)
    set /p killport=
    if /i "!killport!"=="S" (
        :: Tentar encontrar e matar o processo
        for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
            taskkill /F /PID %%a >nul 2>&1
            if !errorlevel! == 0 (
                echo [OK] Processo encerrado.
            ) else (
                echo [ERRO] Nao foi possivel encerrar o processo.
                echo Tente fechar manualmente o programa usando a porta 3000.
                pause
                exit /b 1
            )
        )
    ) else (
        echo [ERRO] Nao e possivel iniciar o servidor com a porta ocupada.
        pause
        exit /b 1
    )
) else (
    echo [OK] Porta 3000 esta disponivel.
)

:: Verificar banco de dados
echo.
echo Configurando banco de dados...
if not exist "favoritos.db" (
    echo [INFO] Banco de dados sera criado ao iniciar o servidor.
) else (
    echo [OK] Banco de dados encontrado.
)

:: Iniciar o servidor
echo.
echo ============================================
echo         Iniciando QQFrevo Server
echo ============================================
echo.
echo [OK] Servidor iniciando...
echo.
echo O QQFrevo esta rodando em: http://localhost:3000
echo.
echo Abrindo navegador automaticamente...
start http://localhost:3000
echo.
echo Pressione Ctrl+C para parar o servidor
echo ============================================
echo.

:: Iniciar o servidor Node.js
node qqfrevo.js

:: Se o servidor parar, pausar antes de fechar
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] O servidor foi encerrado com erro.
    pause
)