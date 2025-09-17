# 🚀 Como Iniciar o QQFrevo

## Inicialização Automática (Recomendado)

### 🖥️ Windows
1. Dê duplo clique no arquivo `iniciar-qqfrevo.bat`
2. O script irá:
   - Verificar se o Node.js está instalado
   - Instalar as dependências automaticamente
   - Iniciar o servidor
   - Abrir o navegador em http://localhost:3000

### 🐧 Linux/Mac
1. Abra o terminal na pasta do projeto
2. Execute: `./iniciar-qqfrevo.sh`
3. O script irá:
   - Verificar e instalar Node.js (se necessário)
   - Instalar as dependências automaticamente
   - Iniciar o servidor
   - Abrir o navegador em http://localhost:3000

## O que o Script Faz

✅ **Verificações Automáticas:**
- Detecta o sistema operacional
- Verifica se Node.js está instalado
- Verifica se npm está disponível
- Checa se a porta 3000 está livre
- Instala todas as dependências necessárias

✅ **Instalação Inteligente:**
- Se o Node.js não estiver instalado:
  - **Linux**: Instala via apt, dnf ou pacman
  - **Mac**: Instala via Homebrew
  - **Windows**: Abre a página de download

✅ **Gerenciamento de Porta:**
- Detecta se a porta 3000 está em uso
- Oferece opção para encerrar o processo conflitante
- Garante que o servidor possa iniciar corretamente

✅ **Inicialização Completa:**
- Navega automaticamente para a pasta correta
- Instala dependências (express, sqlite3, axios, cheerio, body-parser)
- Cria o banco de dados se não existir
- Inicia o servidor
- Abre o navegador automaticamente

## Requisitos Mínimos

- **Node.js**: v12.0.0 ou superior
- **npm**: v6.0.0 ou superior
- **Porta**: 3000 deve estar disponível
- **Navegador**: Qualquer navegador moderno

## Solução de Problemas

### Erro: "Node.js não está instalado"
- **Windows**: O script abrirá a página de download automaticamente
- **Linux/Mac**: O script tentará instalar automaticamente

### Erro: "Porta 3000 já está em uso"
- O script oferecerá a opção de encerrar o processo
- Ou você pode mudar a porta no arquivo `qqfrevo.js`

### Erro: "Dependências não instaladas"
- O script instalará automaticamente
- Se falhar, execute manualmente: `npm install`

### Erro: "Script não tem permissão" (Linux/Mac)
- Execute: `chmod +x iniciar-qqfrevo.sh`
- Depois tente novamente

## Comandos Manuais (Alternativa)

Se preferir iniciar manualmente:

```bash
# Navegar para a pasta do servidor
cd "QQFrevo XPS server"

# Instalar dependências
npm install

# Iniciar o servidor
node qqfrevo.js
```

## 📱 Acesso

Após iniciar, acesse:
- **Local**: http://localhost:3000
- **Rede**: http://[seu-ip]:3000

## 🛑 Para Parar o Servidor

Pressione `Ctrl + C` no terminal/prompt onde o servidor está rodando.

---

💡 **Dica**: Salve o link http://localhost:3000 nos favoritos do navegador para acesso rápido!