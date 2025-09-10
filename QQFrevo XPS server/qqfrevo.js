// instalar: npm install express body-parser axios cheerio sqlite3

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cheerio = require("cheerio");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

// Configurar body-parser e servir arquivos estáticos
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/views', express.static(path.join(__dirname, 'views')));

// Banco de dados SQLite
const db = new sqlite3.Database("favoritos.db");
db.run("CREATE TABLE IF NOT EXISTS favoritos (id INTEGER PRIMARY KEY AUTOINCREMENT, link TEXT)");

// Rota principal (formulário HTML)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Rota para servir a logo
app.get("/logo", (req, res) => {
  const logoPath = path.join(__dirname, "views", "logo.png");
  res.sendFile(logoPath);
});

// Rota para servir a música de fundo
app.get("/fundo", (req, res) => {
  const musicPath = path.join(__dirname, "views", "fundo.mp3");
  res.sendFile(musicPath);
});

// Rota para pesquisa
app.post("/buscar", async (req, res) => {
  const { cidade, tipo } = req.body;
  const query = `instagram ${tipo} ${cidade}`;
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
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

    // HTML completo com design moderno
    let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resultados - ${tipo} em ${cidade}</title>
      <link rel="icon" type="image/png" href="/logo">
      <link rel="shortcut icon" type="image/png" href="/logo">
      <link rel="apple-touch-icon" href="/logo">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/css/materialdesignicons.min.css">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #000000;
          min-height: 100vh;
          color: #ffffff;
        }
        .header {
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(10px);
          padding: 1.5rem;
          box-shadow: 0 4px 30px rgba(255, 215, 0, 0.2);
          border-bottom: 2px solid rgba(0, 255, 0, 0.3);
          margin-bottom: 2rem;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        h2 { 
          background: linear-gradient(45deg, #00f0ff, #00c0ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        .results-info {
          color: #8892b0;
          margin-bottom: 2rem;
        }
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        .result-card {
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid rgba(0, 255, 0, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s;
          animation: slideUp 0.5s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .result-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(0, 240, 255, 0.2);
          border-color: #00FF00;
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .link-text {
          flex: 1;
          word-break: break-all;
        }
        .link-text a {
          color: #00FF00;
          text-decoration: none;
          font-size: 0.95rem;
          transition: all 0.3s;
        }
        .link-text a:hover {
          text-shadow: 0 0 10px rgba(0, 240, 255, 0.8);
        }
        .card-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        .btn {
          flex: 1;
          padding: 0.8rem;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          text-decoration: none;
        }
        .btn-primary {
          background: linear-gradient(135deg, #FFD700, #00FF00);
          color: #0a0a0a;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(0, 240, 255, 0.4);
        }
        .btn-secondary {
          background: rgba(255, 215, 0, 0.1);
          color: #00FF00;
          border: 1px solid rgba(0, 255, 0, 0.3);
        }
        .btn-secondary:hover {
          background: rgba(255, 215, 0, 0.2);
        }
        .no-results {
          text-align: center;
          padding: 3rem;
          background: rgba(0, 0, 0, 0.9);
          border-radius: 12px;
          border: 1px solid rgba(0, 255, 0, 0.3);
        }
        .no-results p {
          color: #8892b0;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }
        .back-link {
          display: inline-block;
          margin-top: 2rem;
          padding: 1rem 2rem;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(0, 255, 0, 0.3);
          border-radius: 8px;
          color: #00FF00;
          text-decoration: none;
          transition: all 0.3s;
        }
        .back-link:hover {
          background: rgba(255, 215, 0, 0.2);
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <!-- Player de Música Persistente -->
      <div style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; background: rgba(0, 0, 0, 0.95); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 12px; padding: 15px; backdrop-filter: blur(10px);">
        <div style="display: flex; align-items: center; gap: 15px;">
          <button id="playPauseBtn" style="background: linear-gradient(135deg, #FFD700, #00FF00); border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s;">
            <i class="mdi mdi-play" style="font-size: 20px; color: #0a0a0a;"></i>
          </button>
          <div style="display: flex; align-items: center; gap: 10px;">
            <i class="mdi mdi-volume-high" style="color: #FFD700;"></i>
            <input type="range" id="volumeSlider" min="0" max="100" value="30" style="width: 100px; accent-color: #00FF00;">
          </div>
          <span id="volumeValue" style="color: #00FF00; font-size: 12px; min-width: 35px;">30%</span>
        </div>
      </div>
      
      <audio id="backgroundMusic" loop>
        <source src="/fundo" type="audio/mpeg">
      </audio>
      
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const audio = document.getElementById('backgroundMusic');
          const playPauseBtn = document.getElementById('playPauseBtn');
          const volumeSlider = document.getElementById('volumeSlider');
          const volumeValue = document.getElementById('volumeValue');
          const btnIcon = playPauseBtn.querySelector('i');
          
          // Recuperar estado salvo
          const savedState = localStorage.getItem('musicPlayerState');
          const state = savedState ? JSON.parse(savedState) : {
            playing: true,
            volume: 30,
            currentTime: 0
          };
          
          // Aplicar estado salvo
          audio.volume = state.volume / 100;
          volumeSlider.value = state.volume;
          volumeValue.textContent = state.volume + '%';
          audio.currentTime = state.currentTime || 0;
          
          // Atualizar ícone do botão
          function updateButtonIcon() {
            if (audio.paused) {
              btnIcon.className = 'mdi mdi-play';
            } else {
              btnIcon.className = 'mdi mdi-pause';
            }
          }
          
          // Salvar estado
          function saveState() {
            const state = {
              playing: !audio.paused,
              volume: Math.round(audio.volume * 100),
              currentTime: audio.currentTime
            };
            localStorage.setItem('musicPlayerState', JSON.stringify(state));
          }
          
          // Play/Pause
          playPauseBtn.addEventListener('click', function() {
            if (audio.paused) {
              audio.play().catch(() => {});
            } else {
              audio.pause();
            }
            updateButtonIcon();
            saveState();
          });
          
          // Controle de volume
          volumeSlider.addEventListener('input', function() {
            audio.volume = this.value / 100;
            volumeValue.textContent = this.value + '%';
            saveState();
          });
          
          // Salvar posição periodicamente
          setInterval(saveState, 1000);
          
          // Iniciar reprodução se estava tocando
          if (state.playing) {
            audio.play().catch(() => {
              // Se autoplay falhar, aguardar interação
              document.addEventListener('click', function() {
                if (state.playing && audio.paused) {
                  audio.play().catch(() => {});
                }
              }, { once: true });
            });
          }
          
          // Atualizar ícone inicial
          updateButtonIcon();
          
          // Atualizar ícone quando o estado mudar
          audio.addEventListener('play', updateButtonIcon);
          audio.addEventListener('pause', updateButtonIcon);
        });
      </script>
      <div class="header">
        <div class="container">
          <h2><i class="mdi mdi-magnify"></i> Resultados da Busca</h2>
          <p class="results-info">Buscando por "${tipo}" em "${cidade}"</p>
        </div>
      </div>
      <div class="container">
    `;

    if (links.size > 0) {
      html += `<div class="results-grid">`;
      
      let index = 0;
      links.forEach(link => {
        // Verificar se é um reel
        const isReel = link.includes('/reel/') || link.includes('/reels/');
        const isStory = link.includes('/stories/');
        const isPost = link.includes('/p/');
        
        let displayText = '';
        let displayIcon = 'mdi-instagram';
        let actionText = 'Visitar';
        
        if (isReel) {
          // Para reels, mostrar como conteúdo relacionado
          displayText = `Reel sobre "${tipo}" em ${cidade}`;
          displayIcon = 'mdi-video';
          actionText = 'Assistir Reel';
        } else if (isStory) {
          displayText = `Story sobre "${tipo}"`;
          displayIcon = 'mdi-clock-outline';
          actionText = 'Ver Story';
        } else if (isPost) {
          displayText = `Post sobre "${tipo}" em ${cidade}`;
          displayIcon = 'mdi-image';
          actionText = 'Ver Post';
        } else {
          // É um perfil
          const username = link.match(/instagram\.com\/([^/]+)/)?.[1] || 'perfil';
          displayText = `@${username}`;
          displayIcon = 'mdi-account';
          actionText = 'Visitar Perfil';
        }
        
        html += `
          <div class="result-card" style="animation-delay: ${index * 0.1}s">
            <div class="card-header">
              <div class="link-text">
                <a href="${link}" target="_blank"><i class="mdi ${displayIcon}"></i> ${displayText}</a>
              </div>
            </div>
            <div class="card-actions">
              <a href="${link}" target="_blank" class="btn btn-primary">${actionText}</a>
              <form method="POST" action="/favoritar" style="flex: 1;">
                <input type="hidden" name="link" value="${link}">
                <button type="submit" class="btn btn-secondary" style="width: 100%;"><i class="mdi mdi-star-outline"></i> Favoritar</button>
              </form>
            </div>
          </div>
        `;
        index++;
      });

      html += `</div>`;
    } else {
      html += `
        <div class="no-results">
          <p><i class="mdi mdi-alert-circle-outline"></i> Nenhum perfil do Instagram encontrado para esta busca.</p>
          <p>Tente usar termos diferentes ou outra cidade.</p>
        </div>
      `;
    }

    html += `
        <div style="text-align: center;">
          <a href="/" class="back-link"><i class="mdi mdi-arrow-left"></i> Nova Busca</a>
          <a href="/favoritos" class="back-link" style="margin-left: 1rem;"><i class="mdi mdi-star"></i> Ver Favoritos</a>
        </div>
      </div>
    </body></html>`;

    res.send(html);

  } catch (err) {
    res.send("Erro: " + err.message);
  }
});

// Rota para favoritar link
app.post("/favoritar", (req, res) => {
  const { link } = req.body;
  db.run("INSERT INTO favoritos (link) VALUES (?)", [link], (err) => {
    if (err) {
      return res.send("Erro ao salvar nos favoritos.");
    }
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Favorito Adicionado</title>
        <link rel="icon" type="image/png" href="/logo">
        <link rel="shortcut icon" type="image/png" href="/logo">
        <link rel="apple-touch-icon" href="/logo">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/css/materialdesignicons.min.css">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #000000;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
          }
          .success-card {
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #00ff00;
            border-radius: 12px;
            padding: 3rem;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 255, 0, 0.2);
            animation: success 0.5s ease-out;
          }
          @keyframes success {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .success-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          h2 {
            color: #00ff00;
            margin-bottom: 1rem;
          }
          .links {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
          }
          a {
            padding: 0.8rem 1.5rem;
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid rgba(0, 255, 0, 0.3);
            border-radius: 8px;
            color: #00FF00;
            text-decoration: none;
            transition: all 0.3s;
          }
          a:hover {
            background: rgba(255, 215, 0, 0.2);
            transform: translateY(-2px);
          }
        </style>
      </head>
      <body>
        <!-- Player de Música Persistente -->
        <div style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; background: rgba(0, 0, 0, 0.95); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 12px; padding: 15px; backdrop-filter: blur(10px);">
          <div style="display: flex; align-items: center; gap: 15px;">
            <button id="playPauseBtn" style="background: linear-gradient(135deg, #FFD700, #00FF00); border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s;">
              <i class="mdi mdi-play" style="font-size: 20px; color: #0a0a0a;"></i>
            </button>
            <div style="display: flex; align-items: center; gap: 10px;">
              <i class="mdi mdi-volume-high" style="color: #FFD700;"></i>
              <input type="range" id="volumeSlider" min="0" max="100" value="30" style="width: 100px; accent-color: #00FF00;">
            </div>
            <span id="volumeValue" style="color: #00FF00; font-size: 12px; min-width: 35px;">30%</span>
          </div>
        </div>
        
        <audio id="backgroundMusic" loop>
          <source src="/fundo" type="audio/mpeg">
        </audio>
        
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const audio = document.getElementById('backgroundMusic');
            const playPauseBtn = document.getElementById('playPauseBtn');
            const volumeSlider = document.getElementById('volumeSlider');
            const volumeValue = document.getElementById('volumeValue');
            const btnIcon = playPauseBtn.querySelector('i');
            
            // Recuperar estado salvo
            const savedState = localStorage.getItem('musicPlayerState');
            const state = savedState ? JSON.parse(savedState) : {
              playing: true,
              volume: 30,
              currentTime: 0
            };
            
            // Aplicar estado salvo
            audio.volume = state.volume / 100;
            volumeSlider.value = state.volume;
            volumeValue.textContent = state.volume + '%';
            audio.currentTime = state.currentTime || 0;
            
            // Atualizar ícone do botão
            function updateButtonIcon() {
              if (audio.paused) {
                btnIcon.className = 'mdi mdi-play';
              } else {
                btnIcon.className = 'mdi mdi-pause';
              }
            }
            
            // Salvar estado
            function saveState() {
              const state = {
                playing: !audio.paused,
                volume: Math.round(audio.volume * 100),
                currentTime: audio.currentTime
              };
              localStorage.setItem('musicPlayerState', JSON.stringify(state));
            }
            
            // Play/Pause
            playPauseBtn.addEventListener('click', function() {
              if (audio.paused) {
                audio.play().catch(() => {});
              } else {
                audio.pause();
              }
              updateButtonIcon();
              saveState();
            });
            
            // Controle de volume
            volumeSlider.addEventListener('input', function() {
              audio.volume = this.value / 100;
              volumeValue.textContent = this.value + '%';
              saveState();
            });
            
            // Salvar posição periodicamente
            setInterval(saveState, 1000);
            
            // Iniciar reprodução se estava tocando
            if (state.playing) {
              audio.play().catch(() => {
                // Se autoplay falhar, aguardar interação
                document.addEventListener('click', function() {
                  if (state.playing && audio.paused) {
                    audio.play().catch(() => {});
                  }
                }, { once: true });
              });
            }
            
            // Atualizar ícone inicial
            updateButtonIcon();
            
            // Atualizar ícone quando o estado mudar
            audio.addEventListener('play', updateButtonIcon);
            audio.addEventListener('pause', updateButtonIcon);
          });
        </script>
        <div class="success-card">
          <div class="success-icon"><i class="mdi mdi-check-circle" style="font-size: 3rem; color: #00ff00;"></i></div>
          <h2>Adicionado aos Favoritos!</h2>
          <p>O link foi salvo com sucesso.</p>
          <div class="links">
            <a href="/favoritos"><i class="mdi mdi-star"></i> Ver Favoritos</a>
            <a href="/"><i class="mdi mdi-home"></i> Página Inicial</a>
          </div>
        </div>
      </body>
      </html>
    `);
  });
});

// Rota para listar favoritos
app.get("/favoritos", (req, res) => {
  db.all("SELECT * FROM favoritos ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      return res.send("Erro ao carregar favoritos.");
    }
    let html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Favoritos - QQFrevo</title>
        <link rel="icon" type="image/png" href="/logo">
        <link rel="shortcut icon" type="image/png" href="/logo">
        <link rel="apple-touch-icon" href="/logo">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/css/materialdesignicons.min.css">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #000000;
            min-height: 100vh;
            color: #ffffff;
          }
          .header {
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(10px);
            padding: 1.5rem;
            box-shadow: 0 4px 30px rgba(255, 215, 0, 0.2);
            border-bottom: 2px solid rgba(0, 255, 0, 0.3);
            margin-bottom: 2rem;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem 2rem;
          }
          h2 { 
            background: linear-gradient(45deg, #ffd700, #ffed4e);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 2rem;
            margin-bottom: 1rem;
          }
          .favorites-count {
            color: #8892b0;
            margin-bottom: 2rem;
          }
          .favorites-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
          }
          .favorite-card {
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid rgba(255, 215, 0, 0.2);
            border-radius: 12px;
            padding: 1.5rem;
            transition: all 0.3s;
            animation: slideUp 0.5s ease-out;
            position: relative;
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .favorite-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 40px rgba(255, 215, 0, 0.2);
            border-color: #ffd700;
          }
          .star-icon {
            position: absolute;
            top: 1rem;
            right: 1rem;
            font-size: 1.5rem;
          }
          .link-content {
            word-break: break-all;
            margin-bottom: 1rem;
          }
          .link-content a {
            color: #00FF00;
            text-decoration: none;
            transition: all 0.3s;
          }
          .link-content a:hover {
            text-shadow: 0 0 10px rgba(0, 240, 255, 0.8);
          }
          .card-actions {
            display: flex;
            gap: 1rem;
          }
          .btn {
            flex: 1;
            padding: 0.8rem;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            text-align: center;
            text-decoration: none;
          }
          .btn-primary {
            background: linear-gradient(135deg, #FFD700, #00FF00);
            color: #0a0a0a;
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(0, 240, 255, 0.4);
          }
          .btn-danger {
            background: rgba(255, 59, 48, 0.2);
            color: #ff3b30;
            border: 1px solid rgba(255, 59, 48, 0.3);
          }
          .btn-danger:hover {
            background: rgba(255, 59, 48, 0.3);
          }
          .no-favorites {
            text-align: center;
            padding: 3rem;
            background: rgba(0, 0, 0, 0.9);
            border-radius: 12px;
            border: 1px solid rgba(255, 215, 0, 0.2);
          }
          .no-favorites p {
            color: #8892b0;
            font-size: 1.1rem;
            margin-bottom: 1rem;
          }
          .back-link {
            display: inline-block;
            margin-top: 2rem;
            padding: 1rem 2rem;
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid rgba(0, 255, 0, 0.3);
            border-radius: 8px;
            color: #00FF00;
            text-decoration: none;
            transition: all 0.3s;
          }
          .back-link:hover {
            background: rgba(255, 215, 0, 0.2);
            transform: translateY(-2px);
          }
        </style>
      </head>
      <body>
        <!-- Player de Música Persistente -->
        <div style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; background: rgba(0, 0, 0, 0.95); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 12px; padding: 15px; backdrop-filter: blur(10px);">
          <div style="display: flex; align-items: center; gap: 15px;">
            <button id="playPauseBtn" style="background: linear-gradient(135deg, #FFD700, #00FF00); border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s;">
              <i class="mdi mdi-play" style="font-size: 20px; color: #0a0a0a;"></i>
            </button>
            <div style="display: flex; align-items: center; gap: 10px;">
              <i class="mdi mdi-volume-high" style="color: #FFD700;"></i>
              <input type="range" id="volumeSlider" min="0" max="100" value="30" style="width: 100px; accent-color: #00FF00;">
            </div>
            <span id="volumeValue" style="color: #00FF00; font-size: 12px; min-width: 35px;">30%</span>
          </div>
        </div>
        
        <audio id="backgroundMusic" loop>
          <source src="/fundo" type="audio/mpeg">
        </audio>
        
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const audio = document.getElementById('backgroundMusic');
            const playPauseBtn = document.getElementById('playPauseBtn');
            const volumeSlider = document.getElementById('volumeSlider');
            const volumeValue = document.getElementById('volumeValue');
            const btnIcon = playPauseBtn.querySelector('i');
            
            // Recuperar estado salvo
            const savedState = localStorage.getItem('musicPlayerState');
            const state = savedState ? JSON.parse(savedState) : {
              playing: true,
              volume: 30,
              currentTime: 0
            };
            
            // Aplicar estado salvo
            audio.volume = state.volume / 100;
            volumeSlider.value = state.volume;
            volumeValue.textContent = state.volume + '%';
            audio.currentTime = state.currentTime || 0;
            
            // Atualizar ícone do botão
            function updateButtonIcon() {
              if (audio.paused) {
                btnIcon.className = 'mdi mdi-play';
              } else {
                btnIcon.className = 'mdi mdi-pause';
              }
            }
            
            // Salvar estado
            function saveState() {
              const state = {
                playing: !audio.paused,
                volume: Math.round(audio.volume * 100),
                currentTime: audio.currentTime
              };
              localStorage.setItem('musicPlayerState', JSON.stringify(state));
            }
            
            // Play/Pause
            playPauseBtn.addEventListener('click', function() {
              if (audio.paused) {
                audio.play().catch(() => {});
              } else {
                audio.pause();
              }
              updateButtonIcon();
              saveState();
            });
            
            // Controle de volume
            volumeSlider.addEventListener('input', function() {
              audio.volume = this.value / 100;
              volumeValue.textContent = this.value + '%';
              saveState();
            });
            
            // Salvar posição periodicamente
            setInterval(saveState, 1000);
            
            // Iniciar reprodução se estava tocando
            if (state.playing) {
              audio.play().catch(() => {
                // Se autoplay falhar, aguardar interação
                document.addEventListener('click', function() {
                  if (state.playing && audio.paused) {
                    audio.play().catch(() => {});
                  }
                }, { once: true });
              });
            }
            
            // Atualizar ícone inicial
            updateButtonIcon();
            
            // Atualizar ícone quando o estado mudar
            audio.addEventListener('play', updateButtonIcon);
            audio.addEventListener('pause', updateButtonIcon);
          });
        </script>
        <div class="header">
          <div class="container">
            <h2><i class="mdi mdi-star"></i> Meus Favoritos</h2>
            <p class="favorites-count">Você tem ${rows.length} ${rows.length === 1 ? 'favorito' : 'favoritos'} salvos</p>
          </div>
        </div>
        <div class="container">
    `;
    
    if (rows.length > 0) {
      html += `<div class="favorites-grid">`;
      rows.forEach((row, index) => {
        // Verificar tipo de link
        const isReel = row.link.includes('/reel/') || row.link.includes('/reels/');
        const isStory = row.link.includes('/stories/');
        const isPost = row.link.includes('/p/');
        
        let displayText = '';
        let displayIcon = 'mdi-instagram';
        let actionText = 'Visitar';
        
        if (isReel) {
          displayText = 'Reel salvo';
          displayIcon = 'mdi-video';
          actionText = 'Assistir Reel';
        } else if (isStory) {
          displayText = 'Story salvo';
          displayIcon = 'mdi-clock-outline';
          actionText = 'Ver Story';
        } else if (isPost) {
          displayText = 'Post salvo';
          displayIcon = 'mdi-image';
          actionText = 'Ver Post';
        } else {
          const username = row.link.match(/instagram\.com\/([^/]+)/)?.[1] || 'perfil';
          displayText = `@${username}`;
          displayIcon = 'mdi-account';
          actionText = 'Visitar Perfil';
        }
        
        html += `
          <div class="favorite-card" style="animation-delay: ${index * 0.1}s">
            <span class="star-icon"><i class="mdi mdi-star" style="color: #FFD700; font-size: 1.5rem;"></i></span>
            <div class="link-content">
              <a href="${row.link}" target="_blank"><i class="mdi ${displayIcon}"></i> ${displayText}</a>
            </div>
            <div class="card-actions">
              <a href="${row.link}" target="_blank" class="btn btn-primary">${actionText}</a>
              <form method="POST" action="/remover-favorito" style="flex: 1;">
                <input type="hidden" name="id" value="${row.id}">
                <button type="submit" class="btn btn-danger" style="width: 100%;"><i class="mdi mdi-delete"></i> Remover</button>
              </form>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    } else {
      html += `
        <div class="no-favorites">
          <p><i class="mdi mdi-bookmark-off-outline"></i> Você ainda não tem favoritos salvos.</p>
          <p>Faça uma busca e favorite os perfis que você mais gosta!</p>
        </div>
      `;
    }
    
    html += `
        <div style="text-align: center;">
          <a href="/" class="back-link"><i class="mdi mdi-arrow-left"></i> Voltar ao Início</a>
          <a href="/sobre" class="back-link" style="margin-left: 1rem;"><i class="mdi mdi-information-outline"></i> Sobre</a>
        </div>
      </div>
    </body></html>`;
    res.send(html);
  });
});

// Rota para remover favorito
app.post("/remover-favorito", (req, res) => {
  const { id } = req.body;
  db.run("DELETE FROM favoritos WHERE id = ?", [id], (err) => {
    if (err) {
      return res.send("Erro ao remover favorito.");
    }
    res.redirect("/favoritos");
  });
});

// Rota Sobre
app.get("/sobre", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sobre - QQFrevo</title>
      <link rel="icon" type="image/png" href="/logo">
      <link rel="shortcut icon" type="image/png" href="/logo">
      <link rel="apple-touch-icon" href="/logo">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/css/materialdesignicons.min.css">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #000000;
          min-height: 100vh;
          color: #ffffff;
        }
        .header {
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(10px);
          padding: 1.5rem;
          box-shadow: 0 4px 30px rgba(255, 215, 0, 0.2);
          border-bottom: 2px solid rgba(0, 255, 0, 0.3);
          margin-bottom: 2rem;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 2rem 2rem;
        }
        h1 { 
          background: linear-gradient(45deg, #00f0ff, #00c0ff, #0080ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 3rem;
          margin-bottom: 2rem;
          text-align: center;
        }
        .about-card {
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid rgba(0, 255, 0, 0.3);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }
        h2 {
          color: #00FF00;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }
        p {
          color: #8892b0;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        ul {
          color: #8892b0;
          margin-left: 2rem;
          margin-bottom: 1rem;
        }
        li {
          margin-bottom: 0.5rem;
        }
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 2rem;
        }
        .feature {
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(0, 255, 0, 0.3);
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          transition: all 0.3s;
        }
        .feature:hover {
          background: rgba(255, 215, 0, 0.2);
          transform: translateY(-3px);
        }
        .feature-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .back-link {
          display: inline-block;
          margin-top: 2rem;
          padding: 1rem 2rem;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(0, 255, 0, 0.3);
          border-radius: 8px;
          color: #00FF00;
          text-decoration: none;
          transition: all 0.3s;
        }
        .back-link:hover {
          background: rgba(255, 215, 0, 0.2);
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <!-- Player de Música Persistente -->
      <div style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; background: rgba(0, 0, 0, 0.95); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 12px; padding: 15px; backdrop-filter: blur(10px);">
        <div style="display: flex; align-items: center; gap: 15px;">
          <button id="playPauseBtn" style="background: linear-gradient(135deg, #FFD700, #00FF00); border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s;">
            <i class="mdi mdi-play" style="font-size: 20px; color: #0a0a0a;"></i>
          </button>
          <div style="display: flex; align-items: center; gap: 10px;">
            <i class="mdi mdi-volume-high" style="color: #FFD700;"></i>
            <input type="range" id="volumeSlider" min="0" max="100" value="30" style="width: 100px; accent-color: #00FF00;">
          </div>
          <span id="volumeValue" style="color: #00FF00; font-size: 12px; min-width: 35px;">30%</span>
        </div>
      </div>
      
      <audio id="backgroundMusic" loop>
        <source src="/fundo" type="audio/mpeg">
      </audio>
      
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const audio = document.getElementById('backgroundMusic');
          const playPauseBtn = document.getElementById('playPauseBtn');
          const volumeSlider = document.getElementById('volumeSlider');
          const volumeValue = document.getElementById('volumeValue');
          const btnIcon = playPauseBtn.querySelector('i');
          
          // Recuperar estado salvo
          const savedState = localStorage.getItem('musicPlayerState');
          const state = savedState ? JSON.parse(savedState) : {
            playing: true,
            volume: 30,
            currentTime: 0
          };
          
          // Aplicar estado salvo
          audio.volume = state.volume / 100;
          volumeSlider.value = state.volume;
          volumeValue.textContent = state.volume + '%';
          audio.currentTime = state.currentTime || 0;
          
          // Atualizar ícone do botão
          function updateButtonIcon() {
            if (audio.paused) {
              btnIcon.className = 'mdi mdi-play';
            } else {
              btnIcon.className = 'mdi mdi-pause';
            }
          }
          
          // Salvar estado
          function saveState() {
            const state = {
              playing: !audio.paused,
              volume: Math.round(audio.volume * 100),
              currentTime: audio.currentTime
            };
            localStorage.setItem('musicPlayerState', JSON.stringify(state));
          }
          
          // Play/Pause
          playPauseBtn.addEventListener('click', function() {
            if (audio.paused) {
              audio.play().catch(() => {});
            } else {
              audio.pause();
            }
            updateButtonIcon();
            saveState();
          });
          
          // Controle de volume
          volumeSlider.addEventListener('input', function() {
            audio.volume = this.value / 100;
            volumeValue.textContent = this.value + '%';
            saveState();
          });
          
          // Salvar posição periodicamente
          setInterval(saveState, 1000);
          
          // Iniciar reprodução se estava tocando
          if (state.playing) {
            audio.play().catch(() => {
              // Se autoplay falhar, aguardar interação
              document.addEventListener('click', function() {
                if (state.playing && audio.paused) {
                  audio.play().catch(() => {});
                }
              }, { once: true });
            });
          }
          
          // Atualizar ícone inicial
          updateButtonIcon();
          
          // Atualizar ícone quando o estado mudar
          audio.addEventListener('play', updateButtonIcon);
          audio.addEventListener('pause', updateButtonIcon);
        });
      </script>
      <div class="header">
        <h1><img src="/logo" alt="QQFrevo" style="height: 100px; width: auto; filter: drop-shadow(0 0 20px rgba(0, 255, 0, 0.5));"></h1>
      </div>
      <div class="container">
        <div class="about-card">
          <h2><i class="mdi mdi-information"></i> Sobre o QQFrevo</h2>
          <p>
            O QQFrevo é uma ferramenta poderosa para descobrir eventos e perfis do Instagram 
            relacionados a festas, shows e eventos culturais em qualquer cidade do Brasil.
          </p>
          <p>
            Desenvolvido para facilitar a busca por entretenimento local, o sistema permite 
            encontrar rapidamente organizadores de eventos, páginas de festas e perfis 
            relacionados ao cenário cultural da sua região.
          </p>
        </div>

        <div class="about-card">
          <h2><i class="mdi mdi-star-four-points"></i> Recursos Principais</h2>
          <div class="features">
            <div class="feature">
              <div class="feature-icon"><i class="mdi mdi-map-marker" style="font-size: 2rem; color: #FFD700;"></i></div>
              <strong>Busca por CEP</strong>
              <p>Integração com ViaCEP</p>
            </div>
            <div class="feature">
              <div class="feature-icon"><i class="mdi mdi-target" style="font-size: 2rem; color: #00FF00;"></i></div>
              <strong>Autocompletar</strong>
              <p>Cidades brasileiras</p>
            </div>
            <div class="feature">
              <div class="feature-icon"><i class="mdi mdi-star" style="font-size: 2rem; color: #FFD700;"></i></div>
              <strong>Favoritos</strong>
              <p>Salve seus perfis</p>
            </div>
            <div class="feature">
              <div class="feature-icon"><i class="mdi mdi-palette" style="font-size: 2rem; color: #00FF00;"></i></div>
              <strong>Dark Mode</strong>
              <p>Interface moderna</p>
            </div>
          </div>
        </div>

        <div class="about-card">
          <h2><i class="mdi mdi-music-note"></i> Tipos de Eventos</h2>
          <p>Encontre diversos tipos de eventos:</p>
          <ul>
            <li>Bailes Funk e Festas</li>
            <li>Shows e Apresentações</li>
            <li>Pagode e Samba</li>
            <li>Forró e Sertanejo</li>
            <li>Som Automotivo</li>
            <li>Eventos Culturais</li>
            <li>E muito mais!</li>
          </ul>
        </div>

        <div class="about-card">
          <h2><i class="mdi mdi-lock"></i> Privacidade</h2>
          <p>
            O QQFrevo não armazena dados pessoais. Apenas os links favoritados são 
            salvos localmente no servidor para sua conveniência.
          </p>
        </div>

        <div style="text-align: center;">
          <a href="/" class="back-link"><i class="mdi mdi-arrow-left"></i> Voltar ao Início</a>
          <a href="/sobre" class="back-link" style="margin-left: 1rem;"><i class="mdi mdi-information-outline"></i> Sobre</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 o QQfrevo XPS server esta rodando nessa URL: http://localhost:${PORT}`);
});
