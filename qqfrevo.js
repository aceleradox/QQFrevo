// instalar: npm install express body-parser axios cheerio sqlite3

const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Importar as rotas
const indexRoutes = require("./routes/index");
const searchRoutes = require("./routes/search");
const favoritesRoutes = require("./routes/favorites");

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Servir arquivos estáticos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, "public")));

// Configurar banco de dados SQLite
console.log('🔍 [DEBUG] Inicializando banco de dados SQLite...');
const db = new sqlite3.Database("favoritos.db", (err) => {
  if (err) {
    console.error('❌ [DEBUG] Erro ao conectar com o banco de dados:', err.message);
  } else {
    console.log('✅ [DEBUG] Conectado ao banco de dados SQLite com sucesso');
  }
});

// Criar tabela se não existir (com campo adicional para data)
console.log('🔍 [DEBUG] Criando tabela favoritos se não existir...');
db.run(`CREATE TABLE IF NOT EXISTS favoritos (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  link TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) {
    console.error('❌ [DEBUG] Erro ao criar tabela:', err.message);
  } else {
    console.log('✅ [DEBUG] Tabela favoritos criada/verificada com sucesso');
  }
});

// Verificar estrutura da tabela
db.all("PRAGMA table_info(favoritos)", (err, rows) => {
  if (err) {
    console.error('❌ [DEBUG] Erro ao verificar estrutura da tabela:', err.message);
  } else {
    console.log('🔍 [DEBUG] Estrutura da tabela favoritos:', rows);
    
    // Verificar se a tabela tem a estrutura correta
    const temCampoCreatedAt = rows.some(row => row.name === 'created_at');
    const temConstraintUnique = rows.some(row => row.name === 'link');
    
    console.log('🔍 [DEBUG] Tabela tem campo created_at?', temCampoCreatedAt);
    console.log('🔍 [DEBUG] Tabela tem campo link?', temConstraintUnique);
    
    if (!temCampoCreatedAt) {
      console.log('⚠️ [DEBUG] Tabela sem campo created_at, adicionando...');
      db.run("ALTER TABLE favoritos ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP", (err) => {
        if (err) {
          console.error('❌ [DEBUG] Erro ao adicionar campo created_at:', err.message);
        } else {
          console.log('✅ [DEBUG] Campo created_at adicionado com sucesso');
        }
      });
    }
  }
  
  // Contar favoritos existentes
  db.get("SELECT COUNT(*) as total FROM favoritos", (err, row) => {
    if (err) {
      console.error('❌ [DEBUG] Erro ao contar favoritos:', err.message);
    } else {
      console.log('🔍 [DEBUG] Total de favoritos existentes:', row.total);
    }
  });
});

// Middleware para logs das requisições
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Usar as rotas
app.use("/", indexRoutes);
app.use("/", searchRoutes);
app.use("/", favoritesRoutes);

// Middleware para tratamento de erros 404
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>404 - Página não encontrada</title>
      <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
      <div class="container">
        <div class="error-card">
          <h2>🔍 404 - Página não encontrada</h2>
          <p>A página que você está procurando não existe.</p>
          <div class="action-buttons">
            <a href="/" class="btn btn-primary">🏠 Ir para Início</a>
            <a href="/favoritos" class="btn btn-secondary">⭐ Ver Favoritos</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Middleware para tratamento de erros gerais
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err);
  res.status(500).send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>500 - Erro interno</title>
      <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
      <div class="container">
        <div class="error-card">
          <h2>❌ Erro interno do servidor</h2>
          <p>Ocorreu um erro inesperado. Tente novamente mais tarde.</p>
          <div class="action-buttons">
            <a href="/" class="btn btn-primary">🏠 Ir para Início</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Fechando servidor graciosamente...');
  db.close((err) => {
    if (err) {
      console.error('Erro ao fechar banco de dados:', err);
    } else {
      console.log('✅ Banco de dados fechado.');
    }
    process.exit(0);
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 QQFrevo servidor rodando em: http://localhost:${PORT}`);
  console.log(`📁 Arquivos estáticos sendo servidos de: ${path.join(__dirname, "public")}`);
  console.log(`💾 Banco de dados: favoritos.db`);
  console.log(`⏰ Iniciado em: ${new Date().toLocaleString('pt-BR')}`);
});
