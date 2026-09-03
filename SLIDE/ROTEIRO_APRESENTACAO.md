# Roteiro de Apresentacao — Boteco do Sivirino

## Objetivo
Apresentar o cardapio digital e o painel administrativo do Boteco do Sivirino, destacando a experiencia do cliente, a facilidade de gerenciamento e os recursos de divulgacao.

**Duracao sugerida:** 5 a 7 minutos  
**Endereco demonstrado:** http://26.116.233.104:5173

## Ordem dos slides

### Slide 1 — Abertura
**Arquivo:** `01-cardapio-publico.png`

**Fala sugerida:**
"Este projeto e uma plataforma de cardapio digital desenvolvida para o Boteco do Sivirino. A proposta e aproximar o cliente dos produtos do estabelecimento e facilitar a atualizacao das informacoes pela administracao."

### Slide 2 — Experiencia do cliente
**Arquivo:** `01-cardapio-publico.png`

**Fala sugerida:**
"Na tela inicial, o cliente encontra a identidade do boteco, o endereco, o telefone, as redes sociais e o acesso direto ao cardapio. Os pratos sao organizados por categorias e exibem nome, descricao, preco e destaques como Mais Pedido e Favorito da Casa."

### Slide 3 — Acesso administrativo
**Arquivo:** `08-login-admin.png`

**Fala sugerida:**
"A area administrativa e protegida por autenticacao. Somente usuarios autorizados conseguem acessar as funcoes de gerenciamento do cardapio."

### Slide 4 — Painel de gerenciamento
**Arquivo:** `02-painel-admin.png`

**Fala sugerida:**
"Depois do login, o administrador visualiza o painel central. A partir dele, pode cadastrar pratos, adicionar fotos, informar preco de venda e custo de producao, selecionar categorias e publicar o item no cardapio."

**Demonstracao opcional:**
- Mostrar o formulario Novo Prato.
- Apontar os campos de foto, nome, descricao, preco e categoria.
- Explicar que a publicacao atualiza o cardapio para os clientes.

### Slide 5 — Engenharia de cardapio
**Arquivo:** `03-engenharia-cardapio.png`

**Fala sugerida:**
"O sistema tambem apoia a tomada de decisao por meio da Engenharia de Cardapio. Os produtos podem ser analisados pela relacao entre vendas e margem, ajudando o estabelecimento a identificar itens de maior destaque e itens que precisam ser reavaliados."

### Slide 6 — Selos e categorias
**Arquivos:** `04-selos-flags.png` e `05-categorias.png`

**Fala sugerida:**
"Os selos ajudam a chamar atencao para produtos promocionais ou estrategicos, enquanto as categorias organizam a navegacao do cliente. Essa combinacao deixa o cardapio mais claro e facilita a escolha do pedido."

### Slide 7 — Happy Hour
**Arquivo:** `06-happy-hour.png`

**Fala sugerida:**
"A funcionalidade de Happy Hour permite configurar dias e horarios de promocao. Assim, a comunicacao da oferta pode aparecer no cardapio sem depender de alteracoes manuais em varias telas."

### Slide 8 — QR Code e encerramento
**Arquivo:** `07-qr-code.png`

**Fala sugerida:**
"Para completar a experiencia, o estabelecimento pode imprimir o QR Code e disponibiliza-lo nas mesas. O cliente aponta a camera do celular e acessa diretamente o cardapio. Dessa forma, a plataforma une divulgacao, atendimento e gestao em um unico sistema."

## Fechamento
"Em resumo, o projeto oferece um cardapio digital responsivo para o cliente e um painel administrativo para a equipe. A solucao permite publicar produtos, organizar categorias, destacar promocoes, acompanhar custos e distribuir o acesso por QR Code."

## Tecnologias utilizadas
- **Frontend:** React, Vite, React Router e Axios.
- **Backend:** Node.js, Express e JWT para autenticacao.
- **Banco de dados:** MySQL.
- **Imagens:** upload de fotos dos pratos.
- **Infraestrutura:** Docker e Nginx.

## Fluxo de demonstracao ao vivo
1. Abrir `http://26.116.233.104:5173`.
2. Mostrar a identidade visual e rolar ate as categorias e pratos.
3. Clicar em **Entrar**.
4. Acessar o painel administrativo.
5. Mostrar rapidamente as abas **Pratos**, **Engenharia**, **Selos / Flags**, **Categorias**, **Happy Hour** e **QR Code**.
6. Encerrar retornando ao cardapio publico.

## Observacao para a apresentacao
Durante a captura final realizada em 03/09/2026, o painel administrativo exibiu 134 pratos, 9 categorias e 5 configuracoes de Happy Hour. A primeira abertura apresentou os contadores zerados enquanto os dados eram carregados; por isso, use as capturas salvas nesta pasta, que foram atualizadas depois do carregamento completo.
