# versao atualizada do QQfrevo
## agora existe uma versao Gui para rodar os app QQfrevo.
https://github.com/aceleradox/QQFrevo/raw/refs/heads/main/QQfrevo%20Gui%20Addon.rar
# precisaria ter o  electron.
so digite no cmd: npm install electron
## QQfrevo NV15A E UMA VERSAO ATUALIZADA DO QQFREVO QUE PESQUISA NUITO ALEM DO INSTAGRAM. AGORA TAMBEM PESQUISA EM OUTRAS PLATAFORMA
## https://github.com/aceleradox/QQFrevo-n15a 
# essa versao e baseada no QQfrevo autonomy
## Versao modificavel do qqfrevo.
# qqfrevo PA Ace Neon(Versao Modificavel):
https://github.com/aceleradox/QQFrevo/raw/refs/heads/main/QQfrevo%20Progressive%20Autonomy%20ACE-NEON.zip

# Descrição:
QQFrevo é uma coleção de aplicativos Node.js para pesquisa de perfis e eventos de música no Instagram, como frevo, baile funk, desande, eletrofunk e outros. Cada versão vem em ZIP e inclui todos os arquivos e pastas necessários para rodar de forma independente: qqfrevo.js, mods, public, banco de dados SQLite e arquivo de configuração config.json. Existem várias versões, como Progressive Autonomy, QQFrevo XPS e outras, mas todas seguem a mesma estrutura e lógica de funcionamento.

Pré-requisitos:

Instalar o Node.js: visite https://nodejs.org
, baixe a versão recomendada para seu sistema operacional e siga as instruções de instalação. O Node.js já inclui o npm (Node Package Manager).

Conexão com internet, pois as buscas no Instagram de perfis de eventos de frevos, desande automotivo e eletrofunk automotivo

Passo 1: Extrair os arquivos

Baixe o ZIP da versão desejada.

Extraia o conteúdo para uma pasta de sua preferência. Exemplo: C:\Apps\QQFrevo-Progressive-Autonomy

Dentro da pasta você encontrará:
qqfrevo.js
mods/
public/
config.json
favoritos.db (ou será criado ao rodar)
package.json (se houver)

Passo 2: Instalar dependências
Abra um terminal ou prompt de comando na pasta do app extraído e execute:
npm install
Isso instalará todas as dependências necessárias, geralmente express, axios, cheerio e sqlite3.

Passo 3: Configurar mods

Abra o arquivo config.json em um editor de texto.

Localize o campo "activeMods", que é uma lista de mods ativos.

Adicione ou remova mods conforme desejar. Cada mod deve ter sua própria pasta dentro de mods/.
Exemplo:
{
"activeMods": ["autonomy", "search-bar"]
}

Passo 4: Rodar o aplicativo
No terminal ou prompt de comando, execute:
node qqfrevo.js
O terminal mostrará algo como:
🚀 qqfrevo Progressive Autonomy rodando em http://localhost:3000

Abra o navegador e acesse http://localhost:3000
 para usar o aplicativo.

Funcionalidades principais:

Busca de perfis do Instagram por cidade, tipo de evento ou hashtag.

Favoritos: salvar perfis e acessá-los rapidamente.

Mods: adicionar recursos extras como visualização de posts, reels, quadros modernos, animações de tema, etc.

Correção automática de links inválidos (Corrector-Lab).

Interface dark neon customizável.

Estrutura de pastas:
mods/ → Contém os mods individuais, ex: autonomy, embed-post, bookmark
public/ → Contém CSS, JS e imagens públicas
qqfrevo.js → Arquivo principal do Node.js
config.json → Lista de mods ativos
favoritos.db → Banco de dados SQLite

Dicas e Observações:

Sempre execute o app na pasta raiz do ZIP extraído.

Não altere nomes de arquivos ou pastas principais (qqfrevo.js, mods/, public/).

Para adicionar novos mods: crie uma pasta dentro de mods/ e adicione os arquivos CSS e JS. Em seguida, adicione o nome do mod em config.json.

Atualize o Node.js se necessário baixando a versão mais recente em https://nodejs.org
.

Extras:

Compartilhamento de links de perfis.

Visualização dos posts e stories iniciais (dependendo do mod).

Suporte a animações de tema (anim.css ou anim.js).

Filtro de resultados por relevância ou recentes.
