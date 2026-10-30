# INTERATIVIDADE — Portal de jogos retrô originais

Portal público: https://interatividade.compassrosesystems.com.br/

## Arquitetura de produtos
- **As Alianças**: UM jogo narrativo principal, planejado com 8 mundos (Jardim, Noé, Abraão, Patriarcas, Moisés, Davi, Cristo, Igreja) e 40 fases. Todos os mundos pertencem ao mesmo jogo, não são jogos independentes. Página exclusiva de apresentação `games/as-aliancas/index.html` (sem gameplay ainda).
- **Minijogos**: títulos independentes de sessões curtas (datilologia, memória, lógica, personagens bíblicos e puzzles originais). Cada título tem sua própria página em `games/<slug>/`, aberta pelo catálogo da home. Jogos planejados exibem **EM CRIAÇÃO**, sem botão funcional. A home apresenta, nunca hospeda a área de gameplay.
- **Portal das Estrelas**: jogo de exploração com página própria `games/portal-das-estrelas/index.html`, controles touch/teclado, pausa e manual. Não há tabuleiro incorporado na home.
- **Cronograma público**: `roadmap.json` traz marcos e status, `roadmap.js` os renderiza. Datas somente quando confirmadas; não publicar previsões ou percentual de progresso fictícios.

## Arquivos do portal
`index.html` home e estrutura sem links públicos para o GitHub; `styles.css` identidade retrô original e layout responsivo; `portal.js` catálogo, filtros e minijogo demonstrativo; `games.json` registro do catálogo de minijogos; `roadmap.json` etapas públicas; `roadmap.js` cronograma público; `.github/workflows/deploy.yml` deploy em Locaweb.

## Como adicionar novo minijogo
1. Desenvolver em `games/<slug>/index.html` e testar jogabilidade, regras, direitos, acessibilidade, mouse e touch.
2. Acrescentar objeto em `games.json`: `id,title,description,symbol,category,art,tag,status,url`. Categorias atuais: `datilologia`, `biblia` e `puzzle`.
3. Enquanto for ideia ou protótipo não publicado: `status: "planned"` sem URL. Quando a página `./games/<slug>/` existir e estiver testada: `status: "live"`, URL relativa segura e verificada. A home renderiza automaticamente ▶ JOGAR apenas em `live`.
4. O Portal das Estrelas está em `./games/portal-das-estrelas/`, com `game.js` independente. A home não carrega o motor do jogo.
5. Não reaproveitar sprites, arte, músicas, marca ou apresentação visual de Tetris, Nintendo e outros terceiros sem licença. Os jogos inspirados em puzzles devem usar mecânicas/identidade originais.
6. A precisão da datilologia e da Libras exige revisão especializada e assets próprios/licenciados. Quizzes católicos devem conferir referências do acervo Caminhos da Palavra e ter enunciados originais.

## Como atualizar o cronograma
1. Editar `roadmap.json`, alterando `status`, `state` (`done`, `current`, `planned`), `when` e `description`, além de `updatedAt` quando houver avanço comprovado.
2. Não marcar protótipo como concluído sem URL e testes. A publicação no YouTube Playables depende de integração do SDK e aprovação externa; nunca anunciar datas do YouTube sem confirmação.
3. O cronograma é público; não incluir credenciais, links privados ou detalhes internos de equipe.

## Publicação automatizada
GitHub Actions `.github/workflows/deploy.yml` publica `index.html`, `styles.css`, `portal.js`, `games.json`, `roadmap.js`, `roadmap.json` e `games/` quando existir.
Usa segredos `HOST`, `USER`, `PASS` sem compartilhar valores no código. Destino remoto: `public_html/interatividade/`. A confirmação do job FTP não substitui teste do domínio HTTPS.

## Acompanhamento documental
Pasta mãe: https://drive.google.com/drive/folders/17J9F6axkKL9OMGK-KCjw-e5cmIu_j4Kg
Minijogos (12 ideias e critérios): https://drive.google.com/drive/folders/1KmRnxVpSJOtmr7tnHefVKE_XivJKVWF4
Plano de produção de As Alianças: https://docs.google.com/document/d/1NF2NOfRZUkP8ElekNB-Y1dQOj0qVuL6UwUQPeyY2gTI/edit
Documentação oficial Playables: https://developers.google.com/youtube/gaming/playables

A versão web e a versão Playables de cada jogo devem ter adaptadores de salvamento apropriados, sem prometer sincronização entre eles.

## Páginas independentes e regra editorial da home
A decisão de arquitetura é: **home = apresentação, notícias, roadmap e catálogo; cada jogo = URL própria**. A home usa `portal.js` apenas para o catálogo. O motor do Portal das Estrelas foi isolado em `games/portal-das-estrelas/game.js`; As Alianças tem página descritiva e status de produção; os quatro jogos de datilologia já possuem páginas específicas. As páginas internas apontam de volta ao catálogo. Não reincorporar jogo na home em refatorações futuras.
