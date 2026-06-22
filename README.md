# trab.front-end

## Projeto

Aplicacao React de receitas culinarias chamada Bau do Chef.

O projeto funciona como um arquivo pessoal de receitas, tecnicas, privacidade, tags, login por usuario, registro de testes culinarios e persistencia em banco de dados local.

## Funcionalidades atuais

- Login e cadastro por nome de usuario, com dados separados por conta.
- Cadastro de receitas com imagem PNG, categoria, ingredientes, preparo, tags, privacidade, porcoes e notas.
- Listagem com busca, filtros, favoritos, exclusao e calculadora de porcoes.
- Receitas-base em portugues com imagens padronizadas para todas as contas.
- Rotas carregadas sob demanda e pagina de erro 404 para enderecos inexistentes.
- Persistencia em API REST local e banco JSON executados com Docker Compose.

## Estrutura principal

- `src/pages`: paginas de Home, Cadastro, Listagem, Login e erro 404.
- `src/components`: componentes reutilizaveis da interface.
- `src/contexts`: estado global de autenticacao e receitas.
- `src/routes`: rotas com carregamento sob demanda.
- `src/styles/global.css`: estilo global organizado por secoes.
- `server`: API REST local do Bau do Chef.
- `server/database/receitas.json`: banco de dados local em arquivo JSON.
- `docker`: Dockerfiles do front-end e da API.

## Variaveis de ambiente

O projeto usa `.env` para configuracoes do front-end com Vite. Copie o exemplo quando precisar recriar o ambiente:

```bash
copy .env.example .env
```

Variaveis disponiveis:

- `VITE_APP_NAME`: nome exibido no sistema.
- `VITE_STORAGE_PREFIX`: prefixo das chaves usadas no localStorage para sessao e copia temporaria.
- `VITE_API_BASE_URL`: endereco da API REST que grava as receitas no banco local.
- `VITE_DEFAULT_RECIPE_IMAGE`: imagem padrao para receitas sem URL.

Importante: variaveis `VITE_` ficam expostas no navegador. Elas nao devem guardar senhas, tokens privados ou credenciais reais.

## Como rodar localmente

Em um terminal, suba a API:

```bash
npm run server
```

Em outro terminal, suba o front-end:

```bash
npm install
npm run dev
```

Depois acesse: http://localhost:5173

Se alguma URL for digitada depois de http://localhost:5173/, o sistema agora exibe uma pagina 404 com mensagem explicando que a rota nao existe e um botao para voltar ao inicio.

A API fica em: http://localhost:3333

## Como rodar com Docker Compose

Primeiro, crie e deixe os containers ativos em segundo plano:

```bash
docker compose up -d
```

Entre no container do front-end:

```bash
docker compose exec app bash
```

Dentro do container, inicie o Vite liberando o acesso pela maquina:

```bash
npm run dev -- --host
```

Depois acesse: http://localhost:5173

O Vite esta fixado na porta `5173`. Execute `npm run dev -- --host` somente uma vez. Se aparecer a mensagem de porta ocupada, saia do container, execute `docker compose restart app`, entre novamente e inicie o Vite uma unica vez.

O Compose cria o projeto `bau-do-chef`, sobe a API no servico `backend` e mantem o servico `app` ativo para desenvolvimento. O banco continua em `server/database/receitas.json`.

Para sair do terminal do container, use `exit`. Para parar todos os servicos:

```bash
docker compose down
```

## Banco de dados

As receitas ficam em `server/database/receitas.json`.

Cada receita salva recebe o `usuarioId` da pessoa logada. Assim, cada cliente visualiza e altera somente as proprias receitas. No primeiro acesso de cada usuario, a API cria receitas-base em portugues para popular o bau. As imagens dessas receitas-base sao sincronizadas com o catalogo oficial, inclusive para contas criadas anteriormente.

Rotas principais da API:

- `GET /health`: verifica se a API esta ativa.
- `GET /receitas?usuario=ID&dono=NOME`: lista receitas do usuario.
- `POST /receitas`: cadastra receita no banco.
- `PATCH /receitas/:id`: atualiza favorito, privacidade, tags ou notas.
- `DELETE /receitas/:id?usuario=ID`: remove receita do usuario.

## Pendencias identificadas na revisao

- Implementar autenticacao real no backend; atualmente o `usuarioId` enviado pelo cliente permite consultar e alterar receitas de outras contas.
- Proteger receitas privadas com autorizacao no servidor, e nao apenas com filtros visuais.
- Adicionar controle de concorrencia ou migrar o banco JSON para um banco transacional, evitando perda de cadastros simultaneos.
- Tornar a escrita do banco atomica e impedir que erros de leitura substituam o arquivo existente por um banco vazio.
- Validar no backend a assinatura e o conteudo Base64 das imagens PNG, alem de limitar o corpo HTTP durante a leitura.
- Corrigir a calculadora para fracoes, quantidades no meio do texto e conversoes entre gramas, quilos, mililitros e litros.
- Retirar imagens Base64 do JSON principal ou criar armazenamento separado para evitar crescimento excessivo das listagens.
- Atualizar Vite para pelo menos `8.0.16` e React Router DOM para pelo menos `7.18.0`.
- Proteger os `JSON.parse` do localStorage contra dados invalidos.
- Criar testes automatizados para API, banco, autenticacao, upload e calculadora de porcoes.

## Registro de alteracoes

### 2026-06-22

- Fixada a execucao do Vite na porta `5173` com `strictPort`, impedindo troca silenciosa para `5174`.
- Documentado no fluxo Docker que o comando de desenvolvimento deve ser executado somente uma vez por container.
- Padronizadas as imagens das receitas-base para todas as contas, usando o mesmo catalogo correto da conta Marcos.
- Adicionada sincronizacao automatica das imagens antigas ao consultar receitas no backend.
- Preservadas as imagens PNG e demais dados das receitas cadastradas manualmente pelos usuarios.
- Criada pagina `NotFound.jsx` para caminhos inexistentes.
- Adicionada rota curinga `*` com mensagem de erro 404 e botao para voltar ao inicio.
- Garantida a exibicao do erro de rota para usuarios autenticados e nao autenticados.
- Alterado o campo do modo de cadastro para `Nome de usuario`.
- Adicionada validacao de 3 a 24 caracteres para nomes de usuario, aceitando letras, numeros, ponto, hifen e sublinhado.
- Mantida compatibilidade do login com os nomes de contas existentes.
- Adicionado botao `Cadastro` abaixo de `Destrancar` na tela de login.
- Criado modo de cadastro no proprio formulario, com acao para voltar ao login.
- Mantido o fluxo atual de identificacao por nome, sem alterar a autenticacao do backend.
- Realizada nova revisao completa do front-end, backend, persistencia, Docker e dependencias.
- Confirmado que receitas privadas podem ser acessadas sem autenticacao ao informar o `usuarioId` na API.
- Executado teste de concorrencia: 12 requisicoes retornaram sucesso, mas somente 1 receita permaneceu no banco; os dados de teste foram removidos ao final.
- Identificado risco de perda total do banco quando o JSON estiver corrompido ou for interrompido durante a escrita.
- Identificada validacao incompleta de PNG no backend e ausencia de limite durante a leitura do corpo HTTP.
- Confirmados erros da calculadora com fracoes e quantidades que nao aparecem no inicio do ingrediente.
- Medido o banco JSON com aproximadamente 372 KB apos uma receita com imagem Base64.
- Executado `npm audit`: encontradas 2 vulnerabilidades baixas no React Router e 1 alta no Vite.
- Validacoes concluidas com sucesso: `npm run build` e `docker compose config`.
- Confirmada a ausencia de testes automatizados no projeto.
- Nenhum codigo funcional foi alterado durante a revisao.

### 2026-06-21

- Renomeado o servico Docker do front-end para `app`.
- Configurado o container `app` para permanecer ativo e permitir entrada com `docker compose exec app bash`.
- Adicionado Bash na imagem de desenvolvimento.
- Alterado o script `dev` para `vite`, permitindo iniciar com `npm run dev -- --host`.
- Documentado o fluxo manual `docker compose up -d`, `docker compose exec app bash` e `npm run dev -- --host`.
- Substituido o campo de URL da imagem por upload de arquivo PNG no cadastro.
- Adicionadas validacoes de extensao, tipo, assinatura PNG e limite de 3 MB.
- Adicionada pre-visualizacao da imagem antes de salvar a receita.
- Imagens PNG passam a ser armazenadas em Base64 junto da receita no banco JSON.
- Adicionada validacao da imagem PNG tambem na API.
- Removido o emblema visual do cabecalho, login e carregamento de rotas.
- Aumentado o nome `Bau do Chef` no cabecalho.

### 2026-06-10

- Criada API REST local em `server/server.mjs` para armazenar receitas fora do localStorage.
- Criado banco de dados local em `server/database/receitas.json`.
- Criadas camadas organizadas em `server/config.mjs`, `server/data/receitasBase.mjs`, `server/lib/database.mjs` e `server/lib/http.mjs`.
- Alterado `RecipeContext.jsx` para carregar, cadastrar, favoritar e remover receitas via API.
- Mantida copia local temporaria apenas como fallback quando a API nao estiver disponivel.
- Removida a dependencia visual das receitas em ingles da TheMealDB.
- Adicionadas receitas-base em portugues para popular o banco por usuario.
- Atualizadas Home e Listagem para mostrar status de carregamento e erros do banco.
- Atualizado Cadastro para aguardar o salvamento no banco e exibir erro de envio.
- Adicionado script `npm run server` para iniciar a API local.
- Atualizado `.env` e `.env.example` com `VITE_API_BASE_URL`.
- Atualizado `docker-compose.yml` para subir os servicos `backend` e `frontend`.
- Criado `docker/Dockerfile.server` para a API.
- Documentadas as rotas da API e o funcionamento do banco no README.
- Reorganizado `src/styles/global.css` em secoes comentadas para tokens, base, layout, header, tema do bau, botoes, login, cards, formularios, feedback e responsividade.
- Removidas duplicacoes de regras visuais acumuladas no CSS global.
- Ajustado o loader de rotas para usar o componente `BauEmblem`.
- Criado componente `BauEmblem.jsx` para representar o bau com fecho visual.
- Atualizados Header e Login para usar o emblema do bau.
- Reforcada a Home com textos, placas e painel visual relacionados ao bau de receitas.
- Atualizado o CSS com textura discreta, fechos, rebites, molduras internas, placas metalicas e acabamento cobre/dourado.
- Ajustados cards, formularios e filtros para parecerem partes de um arquivo culinario guardado em um bau.
- Renomeados os arquivos `.js` restantes dentro de `src/` para `.jsx`.
- Atualizada a organizacao para manter componentes, contextos, dados, configuracoes e utilitarios com extensao `.jsx`, conforme solicitado.
- Mantidos imports sem extensao para preservar a resolucao automatica do Vite.

### 2026-06-07

- Criado arquivo `.env` para centralizar configuracoes do front-end.
- Criado `.env.example` para documentar as variaveis necessarias sem expor dados locais.
- Atualizado `src/config/app.jsx` para ler variaveis `VITE_` via `import.meta.env`.
- Atualizado armazenamento para usar `VITE_STORAGE_PREFIX` nas chaves do localStorage.
- Atualizado `.dockerignore` para impedir envio de `.env` ao build da imagem Docker.
- Criada pasta `src/routes/` com `AppRoutes.jsx`.
- Adicionado carregamento preguicoso das paginas com `React.lazy` e `Suspense`.
- Removidas rotas diretas de `App.jsx`, deixando o arquivo focado em autenticacao e layout.
- Reforcada a interface com detalhes visuais de bau, fecho, molduras internas e acabamento cobre/dourado.
- Reorganizada a pasta `src/` em `components/`, `contexts/`, `data/`, `pages/`, `utils/`, `config/` e `styles/`.
- Separado `main.jsx` para ser apenas o ponto de entrada da aplicacao.
- Criado `App.jsx` para centralizar rotas e controle de acesso.
- Separados contextos de autenticacao e receitas em arquivos proprios.
- Separadas paginas Home, Login, Cadastro e Listagem em arquivos independentes.
- Separados componentes Header, RecipeCard, Feature e Stat para reutilizacao.
- Movidos dados iniciais, categorias e tags para a pasta `data/`.
- Movidas funcoes de armazenamento e calculo de receitas para `utils/`.
- Movido CSS global para `src/styles/global.css`.
- Adicionada tela de login antes de acessar o sistema.
- Criado controle de sessao no localStorage com o nome da pessoa logada.
- Exibido o nome do usuario logado no topo da aplicacao.
- Adicionado botao `Sair` para encerrar a sessao e permitir login em outra conta.
- Alterado o armazenamento de receitas para separar os dados por usuario no localStorage.
- Mantida migracao simples das receitas antigas para a primeira conta que acessar o sistema.
- Atualizados textos da Home, Cadastro e Listagem para indicar o bau do usuario logado.
- Adicionados estilos responsivos para a tela de login e area do usuario no topo.
- Criada pasta `docker/` com `Dockerfile.dev` para rodar o front-end em container Node.
- Criado `docker-compose.yml` com app `bau-do-chef`, servico `frontend`, volume da pasta local e porta `5173` exposta.
- Criado `.dockerignore` para evitar enviar `node_modules`, `dist` e arquivos desnecessarios ao build Docker.
- Ajustados scripts `dev` e `preview` para usar host `0.0.0.0`, permitindo acesso pelo Docker Compose.
- Atualizada documentacao do README com instrucoes para rodar via Docker Compose.
- Ajustado `Dockerfile.dev` para evitar duplicacao do parametro `--host` no comando do Vite.

### 2026-06-06

- Renomeado o projeto de Chef Digital para Bau do Chef.
- Atualizada a proposta de marca para um arquivo culinario pessoal, tecnico e organizado.
- Alterada a identidade visual para azul marinho, vinho, verde esmeralda e detalhes em cobre/dourado.
- Substituido o destaque visual da marca por um icone de bau minimalista.
- Adicionados campos de tags, privacidade, porcoes base e notas de degustacao/testes no cadastro de receitas.
- Adicionado filtro por tags e por privacidade na listagem.
- Adicionada exibicao de receitas privadas/publicas com indicador visual de cadeado.
- Adicionada calculadora de porcoes nos detalhes dos cards, recalculando ingredientes numericos conforme o rendimento desejado.
- Atualizados textos da Home, Cadastro e Listagem para refletir o conceito de curadoria e arquivo tecnico.
- Atualizado o titulo HTML da aplicacao para Bau do Chef.
- Adicionado projeto React com Vite.
- Criadas rotas principais: Home, Cadastro e Listagem.
- Implementado Context API para compartilhar receitas entre paginas.
- Criado formulario de cadastro com validacao de campos obrigatorios.
- Criada listagem dinamica com cards, busca por nome, filtro por categoria e filtro de favoritas.
- Adicionada integracao com a API TheMealDB para exibir receitas externas.
- Adicionado suporte a favoritos, exclusao de receitas cadastradas e persistencia no localStorage.
- Criado CSS responsivo com layout em grid e visual tematico de culinaria.
- Projeto copiado para a pasta C:\Users\marco\Documents\Faculdade\trab.front-end.
- Dependencias instaladas e build validada com npm.cmd run build.
