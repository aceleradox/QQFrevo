const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

// Rota para pesquisa
router.post('/buscar', async (req, res) => {
  console.log('🔍 [DEBUG] Recebida requisição de busca');
  console.log('🔍 [DEBUG] req.body:', req.body);
  
  const { cidade, tipo } = req.body;
  console.log('🔍 [DEBUG] Cidade:', cidade);
  console.log('🔍 [DEBUG] Tipo:', tipo);
  
  // Validação básica
  if (!cidade || !tipo) {
    console.log('❌ [DEBUG] Dados de busca incompletos');
    console.log('❌ [DEBUG] Cidade válida?', !!cidade);
    console.log('❌ [DEBUG] Tipo válido?', !!tipo);
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
            <p>Por favor, preencha todos os campos.</p>
            <a href="/" class="btn btn-primary">🔙 Voltar</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  const query = `instagram ${tipo} ${cidade}`;
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  try {
    const { data } = await axios.get(url, {
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" 
      }
    });

    const $ = cheerio.load(data);
    const links = new Set();

    $("a").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      
      const match = href.match(/uddg=([^&]+)/);
      if (match) {
        const instaLink = decodeURIComponent(match[1]);
        if (instaLink.includes("instagram.com")) links.add(instaLink);
      } else if (href.includes("instagram.com")) {
        links.add(href);
      }
    });

    // HTML completo com melhor estrutura
    let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resultados - ${tipo} em ${cidade}</title>
      <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
      <div class="container">
        <header class="header">
          <h1>🔎 QQFrevo</h1>
          <nav class="nav">
            <a href="/" class="nav-link">🏠 Início</a>
            <a href="/favoritos" class="nav-link">⭐ Favoritos</a>
          </nav>
        </header>
        
        <main class="main">
          <div class="search-info">
            <h2>Resultados para "<span class="highlight">${tipo}</span>" em "<span class="highlight">${cidade}</span>"</h2>
            <p class="results-count">${links.size} perfis encontrados</p>
          </div>
    `;

    if (links.size > 0) {
      html += `
        <div class="results-grid">
      `;
      
      links.forEach(link => {
        const username = link.split('instagram.com/')[1]?.split('/')[0] || 'perfil';
        html += `
          <div class="result-card">
            <div class="profile-info">
              <div class="profile-avatar">
                <img src="https://via.placeholder.com/60/00f0ff/121212?text=IG" alt="Instagram" class="avatar">
              </div>
              <div class="profile-details">
                <h3 class="username">@${username}</h3>
                <a href="${link}" target="_blank" class="profile-link">
                  <span class="link-text">${link}</span>
                  <span class="external-icon">🔗</span>
                </a>
              </div>
            </div>
            <form method="POST" action="/favoritar" class="favorite-form">
              <input type="hidden" name="link" value="${link}">
              <button type="submit" class="btn btn-favorite" title="Adicionar aos favoritos">
                <span class="star-icon">⭐</span>
                Favoritar
              </button>
            </form>
          </div>
        `;
      });

      html += `</div>`;
    } else {
      html += `
        <div class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>Nenhum perfil encontrado</h3>
          <p>Tente buscar com termos diferentes ou verifique a ortografia.</p>
          <a href="/" class="btn btn-primary">🔙 Nova Busca</a>
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
        // Adicionar animação aos cards
        document.addEventListener('DOMContentLoaded', function() {
          const cards = document.querySelectorAll('.result-card');
          cards.forEach((card, index) => {
            card.style.animationDelay = (index * 0.1) + 's';
            card.classList.add('fade-in');
          });
        });
      </script>
    </body>
    </html>`;

    res.send(html);

  } catch (err) {
    console.error('Erro na busca:', err);
    res.status(500).send(`
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
            <h2>❌ Erro na Busca</h2>
            <p>Ocorreu um erro ao buscar os resultados. Tente novamente.</p>
            <p class="error-details">Detalhes: ${err.message}</p>
            <a href="/" class="btn btn-primary">🔙 Voltar</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }
});

module.exports = router;
