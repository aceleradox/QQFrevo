#!/bin/bash

# QQFrevo - Script de Inicialização
# Este script verifica e instala todas as dependências necessárias

echo ""
echo "============================================"
echo "       QQFrevo - Sistema de Busca"
echo "============================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para exibir mensagens coloridas
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Detectar sistema operacional
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        OS="windows"
    else
        OS="unknown"
    fi
    echo "Sistema detectado: $OS"
    echo ""
}

# Verificar se Node.js está instalado
check_node() {
    echo "Verificando Node.js..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_success "Node.js instalado: $NODE_VERSION"
        return 0
    else
        print_error "Node.js não está instalado!"
        return 1
    fi
}

# Instalar Node.js
install_node() {
    print_warning "Tentando instalar Node.js..."
    
    if [[ "$OS" == "linux" ]]; then
        # Para Ubuntu/Debian
        if command -v apt-get &> /dev/null; then
            print_warning "Instalando Node.js via apt..."
            sudo apt-get update
            sudo apt-get install -y nodejs npm
        # Para Fedora/RedHat
        elif command -v dnf &> /dev/null; then
            print_warning "Instalando Node.js via dnf..."
            sudo dnf install -y nodejs npm
        # Para Arch
        elif command -v pacman &> /dev/null; then
            print_warning "Instalando Node.js via pacman..."
            sudo pacman -S nodejs npm
        else
            print_error "Não foi possível instalar automaticamente."
            echo "Por favor, instale Node.js manualmente em: https://nodejs.org"
            exit 1
        fi
    elif [[ "$OS" == "macos" ]]; then
        if command -v brew &> /dev/null; then
            print_warning "Instalando Node.js via Homebrew..."
            brew install node
        else
            print_error "Homebrew não encontrado. Instalando Homebrew primeiro..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            brew install node
        fi
    else
        print_error "Sistema operacional não suportado para instalação automática."
        echo "Por favor, instale Node.js manualmente em: https://nodejs.org"
        exit 1
    fi
    
    # Verificar se a instalação foi bem sucedida
    if check_node; then
        print_success "Node.js instalado com sucesso!"
    else
        print_error "Falha na instalação do Node.js"
        exit 1
    fi
}

# Verificar se npm está instalado
check_npm() {
    echo "Verificando npm..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm -v)
        print_success "npm instalado: v$NPM_VERSION"
        return 0
    else
        print_error "npm não está instalado!"
        return 1
    fi
}

# Instalar dependências do projeto
install_dependencies() {
    echo ""
    echo "Instalando dependências do projeto..."
    
    # Navegar para o diretório do servidor
    cd "QQFrevo XPS server" || exit 1
    
    # Verificar se package.json existe
    if [ ! -f "package.json" ]; then
        print_error "package.json não encontrado!"
        exit 1
    fi
    
    # Verificar se node_modules existe
    if [ -d "node_modules" ]; then
        print_success "Dependências já estão instaladas."
        return 0
    fi
    
    print_warning "Instalando dependências com npm..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Dependências instaladas com sucesso!"
    else
        print_error "Erro ao instalar dependências!"
        exit 1
    fi
}

# Verificar porta 3000
check_port() {
    echo ""
    echo "Verificando porta 3000..."
    
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Porta 3000 já está em uso!"
        echo "Deseja encerrar o processo usando a porta? (s/n)"
        read -r response
        if [[ "$response" == "s" || "$response" == "S" ]]; then
            if [[ "$OS" == "linux" ]] || [[ "$OS" == "macos" ]]; then
                kill -9 $(lsof -t -i:3000) 2>/dev/null
                print_success "Processo encerrado."
            fi
        else
            print_error "Não é possível iniciar o servidor com a porta ocupada."
            exit 1
        fi
    else
        print_success "Porta 3000 está disponível."
    fi
}

# Criar banco de dados se não existir
setup_database() {
    echo ""
    echo "Configurando banco de dados..."
    
    if [ ! -f "favoritos.db" ]; then
        print_warning "Banco de dados não existe. Será criado ao iniciar o servidor."
    else
        print_success "Banco de dados encontrado."
    fi
}

# Iniciar o servidor
start_server() {
    echo ""
    echo "============================================"
    echo "        Iniciando QQFrevo Server"
    echo "============================================"
    echo ""
    
    print_success "Servidor iniciando..."
    echo ""
    echo "🎉 QQFrevo está rodando em: http://localhost:3000"
    echo ""
    echo "Pressione Ctrl+C para parar o servidor"
    echo "============================================"
    echo ""
    
    # Tentar abrir o navegador automaticamente
    if [[ "$OS" == "linux" ]]; then
        if command -v xdg-open &> /dev/null; then
            sleep 2 && xdg-open "http://localhost:3000" &
        fi
    elif [[ "$OS" == "macos" ]]; then
        sleep 2 && open "http://localhost:3000" &
    fi
    
    # Iniciar o servidor
    node qqfrevo.js
}

# Função principal
main() {
    detect_os
    
    # Verificar Node.js
    if ! check_node; then
        install_node
    fi
    
    # Verificar npm
    if ! check_npm; then
        print_error "npm não encontrado. Reinstale o Node.js."
        exit 1
    fi
    
    # Instalar dependências
    install_dependencies
    
    # Verificar porta
    check_port
    
    # Configurar banco de dados
    setup_database
    
    # Iniciar servidor
    start_server
}

# Tratamento de erro
trap 'print_error "Script interrompido!"; exit 1' INT TERM

# Executar função principal
main