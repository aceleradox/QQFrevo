const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

// Banco de dados SQLite
console.log('🔍 [DEBUG] Inicializando conexão com banco na rota favorites...');
const db = new sqlite3.Database("favoritos.db", (err) => {
  if (err) {
    console.error('❌ [DEBUG] Erro ao conectar com banco na rota favorites:', err.message);
  } else {
    console.log('✅ [DEBUG] Conectado ao banco na rota favorites');
  }
});

// Rota para favoritar link
router.post('/favoritar', (req, res) => {
  console.log('🔍 [DEBUG] Recebida requisição para favoritar');
  console.log('🔍 [DEBUG] req.body:', req.body);
  console.log('🔍 [DEBUG] req.method:', req.method);
  console.log('🔍 [DEBUG] req.headers:', req.headers);
  
  const { link } = req.body;
  console.log('🔍 [DEBUG] Link extraído:', link);
  
  if (!link) {
    console.log('❌ [DEBUG] Link não fornecido ou vazio');
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Erro - QQFrevo</title>
        <link rel="stylesheet" href="/css/style.css">
      </head>
      <body>
        <div class="container">
          <div class="error-card">
            <h2>❌ Erro</h2>
            <p>Link inválido para favoritar.</p>
            <a href="/" class="btn btn-primary">🔙 Voltar</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  // Verificar se já existe nos favoritos
  console.log('🔍 [DEBUG] Verificando se link já existe nos favoritos...');
  db.get("SELECT id FROM favoritos WHERE link = ?", [link], (err, row) => {
    if (err) {
      console.error('❌ [DEBUG] Erro ao verificar favorito no banco:', err);
      console.error('❌ [DEBUG] Detalhes do erro:', err.message);
      console.error('❌ [DEBUG] Stack trace:', err.stack);
      return res.status(500).send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Erro - QQFrevo</title>
          <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
          <div class="container">
            <div class="error-card">
              <h2>❌ Erro</h2>
              <p>Erro ao verificar favoritos.</p>
              <a href="/" class="btn btn-primary">🔙 Voltar</a>
            </div>
          </div>
        </body>
        </html>
      `);
    }

    console.log('🔍 [DEBUG] Resultado da verificação:', row);
    
    if (row) {
      console.log('ℹ️ [DEBUG] Link já existe nos favoritos, ID:', row.id);
      return res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Já Favoritado - QQFrevo</title>
          <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
          <div class="container">
            <div class="success-card">
              <h2>ℹ️ Já Favoritado</h2>
              <p>Este perfil já está nos seus favoritos!</p>
              <div class="action-buttons">
                <a href="/favoritos" class="btn btn-primary">⭐ Ver Favoritos</a>
                <a href="/" class="btn btn-secondary">🔙 Voltar</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
    }

    // Adicionar aos favoritos
    console.log('✅ [DEBUG] Link não existe, adicionando aos favoritos...');
    console.log('🔍 [DEBUG] Query SQL: INSERT INTO favoritos (link, created_at) VALUES (?, datetime(\'now\'))');
    console.log('🔍 [DEBUG] Parâmetros:', [link]);
    
    db.run("INSERT INTO favoritos (link, created_at) VALUES (?, datetime('now'))", [link], function(err) {
      if (err) {
        console.error('❌ [DEBUG] Erro ao salvar favorito no banco:', err);
        console.error('❌ [DEBUG] Detalhes do erro:', err.message);
        console.error('❌ [DEBUG] Código do erro:', err.code);
        console.error('❌ [DEBUG] Stack trace:', err.stack);
        return res.status(500).send(`
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <title>Erro - QQFrevo</title>
            <link rel="stylesheet" href="/css/style.css">
          </head>
          <body>
            <div class="container">
              <div class="error-card">
                <h2>❌ Erro</h2>
                <p>Erro ao salvar nos favoritos.</p>
                <a href="/" class="btn btn-primary">🔙 Voltar</a>
              </div>
            </div>
          </body>
          </html>
        `);
      }

      console.log('✅ [DEBUG] Favorito salvo com sucesso!');
      console.log('🔍 [DEBUG] ID do favorito inserido:', this.lastID);
      console.log('🔍 [DEBUG] Número de linhas afetadas:', this.changes);
      
      res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Favoritado - QQFrevo</title>
          <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
          <div class="container">
            <div class="success-card">
              <h2>✅ Adicionado aos Favoritos!</h2>
              <p>O perfil foi salvo com sucesso nos seus favoritos.</p>
              <div class="action-buttons">
                <a href="/favoritos" class="btn btn-primary">⭐ Ver Favoritos</a>
                <a href="/" class="btn btn-secondary">🔙 Nova Busca</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
    });
  });
});

// Rota para listar favoritos
router.get('/favoritos', (req, res) => {
  db.all("SELECT * FROM favoritos ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      console.error('Erro ao carregar favoritos:', err);
      return res.status(500).send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Erro - QQFrevo</title>
          <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
          <div class="container">
            <div class="error-card">
              <h2>❌ Erro</h2>
              <p>Erro ao carregar favoritos.</p>
              <a href="/" class="btn btn-primary">🔙 Voltar</a>
            </div>
          </div>
        </body>
        </html>
      `);
    }

    let html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Favoritos - QQFrevo</title>
        <link rel="stylesheet" href="/css/style.css">
      </head>
      <body>
        <div class="container">
          <header class="header">
            <h1>🔎 QQFrevo</h1>
            <nav class="nav">
              <a href="/" class="nav-link">🏠 Início</a>
              <a href="/favoritos" class="nav-link active">⭐ Favoritos</a>
            </nav>
          </header>
          
          <main class="main">
            <div class="favorites-header">
              <h2>⭐ Meus Favoritos</h2>
              <p class="favorites-count">${rows.length} perfis salvos</p>
            </div>
    `;

    if (rows.length > 0) {
      html += `<div class="favorites-grid">`;
      
      rows.forEach((row, index) => {
        const username = row.link.split('instagram.com/')[1]?.split('/')[0] || 'perfil';
        html += `
          <div class="favorite-card" style="animation-delay: ${index * 0.1}s">
            <div class="profile-info">
              <div class="profile-avatar">
                <img src="https://via.placeholder.com/60/00f0ff/121212?text=IG" alt="Instagram" class="avatar">
              </div>
              <div class="profile-details">
                <h3 class="username">@${username}</h3>
                <a href="${row.link}" target="_blank" class="profile-link">
                  <span class="link-text">${row.link}</span>
                  <span class="external-icon">🔗</span>
                </a>
              </div>
            </div>
            <form method="POST" action="/remover-favorito" class="remove-form">
              <input type="hidden" name="id" value="${row.id}">
              <button type="submit" class="btn btn-remove" title="Remover dos favoritos">
                <span class="remove-icon">🗑️</span>
                Remover
              </button>
            </form>
          </div>
        `;
      });

      html += `</div>`;
    } else {
      html += `
        <div class="no-favorites">
          <div class="no-favorites-icon">⭐</div>
          <h3>Nenhum favorito ainda</h3>
          <p>Comece fazendo uma busca e adicionando perfis aos seus favoritos!</p>
          <a href="/" class="btn btn-primary">🔍 Fazer Busca</a>
        </div>
      `;
    }

    html += `
          </main>
          
          <footer class="footer">
            <p>&copy; 2024 QQFrevo - Encontre os melhores eventos!</p>
          </footer>
        </div>
        
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const cards = document.querySelectorAll('.favorite-card');
            cards.forEach(card => {
              card.classList.add('fade-in');
            });
          });
        </script>
      </body>
      </html>`;

    res.send(html);
  });
});

// Rota para remover favorito
router.post('/remover-favorito', (req, res) => {
  const { id } = req.body;
  
  if (!id) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Erro - QQFrevo</title>
        <link rel="stylesheet" href="/css/style.css">
      </head>
      <body>
        <div class="container">
          <div class="error-card">
            <h2>❌ Erro</h2>
            <p>ID inválido para remover favorito.</p>
            <a href="/favoritos" class="btn btn-primary">🔙 Voltar</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  db.run("DELETE FROM favoritos WHERE id = ?", [id], function(err) {
    if (err) {
      console.error('Erro ao remover favorito:', err);
      return res.status(500).send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Erro - QQFrevo</title>
          <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
          <div class="container">
            <div class="error-card">
              <h2>❌ Erro</h2>
              <p>Erro ao remover favorito.</p>
              <a href="/favoritos" class="btn btn-primary">🔙 Voltar</a>
            </div>
          </div>
        </body>
        </html>
      `);
    }

    if (this.changes === 0) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Não Encontrado - QQFrevo</title>
          <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
          <div class="container">
            <div class="error-card">
              <h2>❌ Não Encontrado</h2>
              <p>Favorito não encontrado.</p>
              <a href="/favoritos" class="btn btn-primary">🔙 Voltar</a>
            </div>
          </div>
        </body>
        </html>
      `);
    }

    // Redirecionar para favoritos após remoção
    res.redirect('/favoritos');
  });
});

module.exports = router;
