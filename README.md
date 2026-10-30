# INTERATIVIDADE — Arcade de jogos educativos

Portal estático responsivo de jogos web e aventuras interativas. Código original, inspirado em sensações arcade retrô, sem assets protegidos de marcas de consoles.

## Acesso e propósito
- Projeto: GEB Tecnologia / desenvolvimento de Eduarda Bispo (pessoa física, a ser definido nos termos de licenciamento de cada jogo).
- Domínio técnico planejado: `https://interatividade.compassrosesystems.com.br/`
- Hospedagem planejada: diretório `public_html/interatividade`.
- Este repositório tem um **portal/mostruário**, não um jogo bíblico final nem um Playable submetido ao YouTube.
- No portal existe um **minijogo real de demonstração**: Portal das Estrelas (4 estrelas e conclusão). As três aventuras bíblicas são apenas anúncios de projetos, marcados **EM CRIAÇÃO**.

## Como adicionar N jogos
1. Desenvolva cada jogo como site estático independente em `games/<slug>/index.html`, com seus arquivos isolados.
2. Acrescente um objeto ao array `games.json` com: `id`, `title`, `description`, `symbol`, `category` (aventura/desafio), `art` (alliance/ark/eden/mystery), `tag`, `status` (planned/live) e `url`.
3. Só mude para `"status":"live"` se a página realmente funcionar em uma URL relativa `./games/<slug>/`, com HTTPS e testes em celular/PC. O portal libera automaticamente o botão ▶ JOGAR nesse caso.
4. Verifique áudio, foco, acessibilidade, direitos de imagens e compatibilidade mobile. O conteúdo de Libras e as referências bíblicas precisam de revisão editorial antes da publicação.

## Usabilidade e recursos existentes
- Teclado: setas ou WASD (movimento); P (pausa/continua); R (reiniciar); H ou ? (manual); M (áudio); Escape (fecha manual); Tab (navegação de botões).
- Mobile: toques nos botões da interface e direcional.
- Som opcional, sem som por padrão; nenhum bloqueio por cronômetro.
- Respeita `prefers-reduced-motion`.
- Não utiliza recursos externos obrigatórios nem instala dependências.

## Publicação via Locaweb
O workflow `.github/workflows/deploy.yml` usa os secrets do GitHub `HOST`, `USER`, `PASS`. Não coloque valores no repositório nem no Google Drive.
O script de deploy foi elaborado para FTP/FTPS com a pasta remota `public_html/interatividade/` indicada no painel; **o diretório inicial do usuário FTP e o protocolo real ainda precisam ser validados**. Uma execução bem-sucedida do Actions e uma visita HTTPS validada são os critérios para confirmar o domínio online.
O workflow publica apenas `index.html`, `styles.css`, `portal.js`, `games.json` e, depois, o diretório `games/` (evitando compartilhar documentos internos).

## Diferenciar portal e YouTube Playables
O site público serve para conhecer a coleção e jogar versões web. Cada jogo submetido ao YouTube terá um pacote próprio `index.html` e integrará o SDK oficial e a suíte de testes: https://developers.google.com/youtube/gaming/playables/reference/getting_started .
Portal online não significa inscrição aprovada nem lançamento dentro de Playables.

## Arquivo documental
Pasta Drive do projeto: https://drive.google.com/drive/folders/17J9F6axkKL9OMGK-KCjw-e5cmIu_j4Kg
Pesquisa de História da Salvação: acervo Caminhos da Palavra (não modificar as matrizes teológicas de origem).
