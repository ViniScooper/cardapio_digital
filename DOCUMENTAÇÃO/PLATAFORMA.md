# 🍺 PLATAFORMA BOTECO DO SIVIRINO — GUIA COMPLETO & ARQUITETURA DETALHADA

> **Slogan:** *Comida Arretada & Cerveja Gelada*  
> **Endereço:** Rua Larga da Feitosa, 138 – Encruzilhada, Recife  
> **WhatsApp:** (81) 98271-4421 | **Instagram:** `@BOTECODO_SIVIRINO`  
> **Disponível no iFood**

---

## 📑 ÍNDICE GERAL

1. [Visão Geral da Plataforma](#1-visão-geral-da-plataforma)
2. [Arquitetura & Tecnologias](#2-arquitetura--tecnologias)
3. [Estrutura de Pastas do Projeto](#3-estrutura-de-pastas-do-projeto)
4. [Banco de Dados & Modelagem](#4-banco-de-dados--modelagem)
5. [Variáveis de Ambiente (.env)](#5-variáveis-de-ambiente-env)
6. [Catálogo Completo de Rotas da API REST](#6-catálogo-completo-de-rotas-da-api-rest)
7. [Fluxo de Autenticação & Segurança (JWT)](#7-fluxo-de-autenticação--segurança-jwt)
8. [Como Funciona o Cardápio Dinâmico & Happy Hour](#8-como-funciona-o-cardápio-dinâmico--happy-hour)
9. [Painel Administrativo (/admin)](#9-painel-administrativo-admin)
10. [Acesso Mobile, Rede Local & QR Code](#10-acesso-mobile-rede-local--qr-code)
11. [Executando com Docker Compose](#11-executando-com-docker-compose)
12. [Credenciais Padrão do Sistema](#12-credenciais-padrão-do-sistema)

---

## 1. VISÃO GERAL DA PLATAFORMA

O **Boteco do Sivirino** é uma solução completa de cardápio digital web e gestão em tempo real desenvolvida para restaurantes e botecos modernos.

### Principais Funcionalidades:
- **Cardápio Interativo Mobile-First:** Navegação rápida por categorias dinâmicas, busca visual de pratos, fotos em alta resolução e identificador de promoções.
- **Sistema de Happy Hour Automatizado:** Controle dinâmico de dias da semana e horários de promoção diretamente pelo painel administrativo, com banner em destaque no cardápio.
- **Painel Administrativo Protegido:** CRUD completo de pratos com upload de fotos (Multer), gerenciamento de categorias com emojis e controle de preços.
- **QR Code Inteligente para Mesas:** Geração dinâmica de QR Code pronto para impressão, adaptado para a rede Wi-Fi do estabelecimento (acesso simultâneo de múltiplos clientes).
- **Ambiente Containerizado (Docker):** Deploy com um único comando orquestrando Banco de Dados (MySQL 8.0), Backend (Node.js/Express) e Frontend (React compilado servido via Nginx).

---

## 2. ARQUITETURA & TECNOLOGIAS

```
[ CLIENTES / SMARTPHONES ]       [ GERENTE / ADMIN ]
            │                             │
            ▼                             ▼
    [ FRONTEND (Vite / React 18 / Nginx :5173 / :80) ]
            │
            ▼ (HTTP / JSON / Multipart FormData)
    [ BACKEND (Node.js / Express :3001) ]
      ├── Autenticação JWT (8h) + Bcrypt
      ├── Uploads de Imagens (Multer -> /uploads)
      └── Pool de Conexões MySQL
            │
            ▼
    [ BANCO DE DADOS (MySQL 8.0 :3306) ]
      ├── Tabelas: usuario, categoria, prato, configuracao
      └── Volume Persistente: db_data
```

### Stack Tecnológico:
- **Frontend:** React 18, Vite, React Router DOM v6, Axios, QRCode.react, CSS3 com Media Queries nativas (sem frameworks pesados).
- **Backend:** Node.js 20, Express, Cors, Multer (armazenamento em disco), JsonWebToken, BcryptJS, MySQL2 (com Connection Pool), Dotenv.
- **Banco de Dados:** MySQL 8.0 Community Server.
- **Infraestrutura:** Docker & Docker Compose com Nginx Alpine para serving de alta performance.

---

## 3. ESTRUTURA DE PASTAS DO PROJETO

```
AP1_CARDAPIO/
├── docker-compose.yml          # Orquestrador dos 3 containers (db, backend, frontend)
├── DOCKER.md                   # Guia rápido de comandos Docker
├── PLATAFORMA.md               # Este documento detalhado
│
├── backend/
│   ├── Dockerfile              # Imagem Node.js Alpine
│   ├── .dockerignore           # Ignora node_modules no container
│   ├── .env                    # Variáveis de ambiente reais (segredos)
│   ├── .env.example            # Template de variáveis de ambiente
│   ├── init.sql                # Script automático de banco (Docker)
│   ├── package.json            # Dependências e scripts do backend
│   ├── server.js               # Ponto de entrada do Express e QR Code terminal
│   ├── seed-cardapio-real.js   # Script que cadastra os 134 itens oficiais do cliente
│   ├── seed-config.js          # Cria tabela de Happy Hour
│   ├── uploads/                # Diretório onde ficam salvas as fotos dos pratos
│   └── src/
│       ├── app.js              # Configuração do Express, CORS e rotas
│       ├── config/
│       │   ├── database.js     # Pool de conexão MySQL (10 conexões)
│       │   └── upload.js       # Configuração do Multer (disco, 5MB, jpeg/png/webp)
│       ├── controllers/
│       │   ├── authController.js       # Login e registro de admins
│       │   ├── pratoController.js      # CRUD de pratos
│       │   ├── categoriaController.js  # CRUD de categorias
│       │   └── configController.js     # Configuração de Happy Hour
│       ├── middleware/
│       │   └── authMiddleware.js       # Validação de token JWT e papel 'admin'
│       └── routes/
│           ├── authRoutes.js           # /auth/*
│           ├── pratoRoutes.js          # /pratos/*
│           ├── categoriaRoutes.js      # /categorias/*
│           └── configRoutes.js         # /config/*
│
└── frontend/
    ├── Dockerfile              # Multi-stage build (Node build -> Nginx Alpine)
    ├── .dockerignore           # Ignora node_modules e dist
    ├── nginx.conf              # Configuração Nginx com suporte a SPA e proxies
    ├── package.json            # Dependências React
    ├── vite.config.js          # Configuração Vite com host: true para LAN
    ├── index.html              # Template HTML com ícones e fontes
    └── src/
        ├── main.jsx            # Ponto de entrada do React
        ├── App.jsx             # Roteamento (React Router v6) e rotas protegidas
        ├── index.css           # Design system (Cores, fontes, media queries mobile)
        ├── components/
        │   └── Navbar.jsx      # Barra de navegação com menu hamburguer mobile
        ├── pages/
        │   ├── Home.jsx        # Cardápio completo para os clientes
        │   ├── Login.jsx       # Tela de login responsiva do administrador
        │   └── Admin.jsx       # Painel de controle (Pratos, Categorias, Happy Hour, QR)
        └── services/
            └── api.js          # Instância do Axios com IP dinâmico e JWT Interceptor
```

---

## 4. BANCO DE DADOS & MODELAGEM

O banco de dados se chama `restaurante` e possui 4 tabelas relacionais e configuráveis:

### 1. Tabela `usuario`
Armazena os operadores do sistema. As senhas são protegidas com salt e hash **Bcrypt** de 10 rounds.
```sql
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Tabela `categoria`
Permite criar seções dinâmicas no cardápio acompanhadas de um emoji representativo.
```sql
CREATE TABLE categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    icone VARCHAR(10) NOT NULL DEFAULT '🍴',
    ordem INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Tabela `prato`
Contém todos os itens do cardápio, vinculados à categoria correspondente e com flag para o Happy Hour.
```sql
CREATE TABLE prato (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(50) DEFAULT 'Cardápio',
    happy_hour TINYINT(1) DEFAULT 0,
    imagem VARCHAR(255) DEFAULT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Tabela `configuracao`
Controla os parâmetros globais de exibição do Happy Hour.
```sql
CREATE TABLE configuracao (
    id INT PRIMARY KEY DEFAULT 1,
    hh_ativo TINYINT(1) DEFAULT 1,
    hh_dias VARCHAR(255) DEFAULT 'Segunda, Terça e Quarta',
    hh_inicio VARCHAR(10) DEFAULT '19:00',
    hh_fim VARCHAR(10) DEFAULT '22:00',
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 5. VARIÁVEIS DE AMBIENTE (.env)

O backend possui suporte nativo ao arquivo `backend/.env`. Se não fornecido, adota fallbacks seguros para desenvolvimento local.

```env
# Configurações do Servidor
PORT=3001
JWT_SECRET=restaurante_jwt_secret_2024

# Banco de Dados MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=viniZIKA3103
DB_NAME=restaurante
```

---

## 6. CATÁLOGO COMPLETO DE ROTAS DA API REST

Todas as respostas são serializadas no formato `application/json`. As rotas de criação e edição suportam upload binário multipart.

### 🔐 A. Autenticação (`/auth`)

#### 1. Realizar Login
- **Endpoint:** `POST /auth/login`
- **Acesso:** Público
- **Descrição:** Valida credenciais e retorna o token JWT e dados do usuário.
- **Corpo da Requisição (Body):**
  ```json
  {
    "email": "admin@boteco.com",
    "senha": "admin123"
  }
  ```
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "mensagem": "Login realizado com sucesso!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "nome": "Administrador",
      "email": "admin@boteco.com",
      "role": "admin"
    }
  }
  ```

#### 2. Registrar Novo Usuário
- **Endpoint:** `POST /auth/registrar`
- **Acesso:** Privado (`Bearer Token` com papel `admin`)
- **Descrição:** Cadastra um novo operador/admin.
- **Corpo da Requisição (Body):**
  ```json
  {
    "nome": "Atendente João",
    "email": "joao@boteco.com",
    "senha": "senhaSegura123",
    "role": "admin"
  }
  ```
- **Resposta de Sucesso (201 Created):**
  ```json
  {
    "mensagem": "Usuário cadastrado como admin!",
    "id": 2
  }
  ```

---

### 🍽️ B. Pratos do Cardápio (`/pratos`)

#### 1. Listar Pratos
- **Endpoint:** `GET /pratos`
- **Acesso:** Público
- **Descrição:** Retorna todos os pratos ordenados por categoria e data de inserção.
- **Resposta de Sucesso (200 OK):**
  ```json
  [
    {
      "id": 1,
      "nome": "1/2 Maminha Argentina Completa",
      "descricao": "Feijão macassar, arroz, batata frita, farofa e vinagrete",
      "preco": "81.00",
      "categoria": "1/2 Refeição Completa",
      "happy_hour": 0,
      "imagem": null,
      "criado_em": "2026-09-03T10:34:40.000Z"
    }
  ]
  ```

#### 2. Cadastrar Novo Prato
- **Endpoint:** `POST /pratos`
- **Acesso:** Privado (`Bearer Token` com papel `admin`)
- **Headers:** `Authorization: Bearer <TOKEN>` e `Content-Type: multipart/form-data`
- **Campos do Formulário (FormData):**
  - `nome` (texto, obrigatório): Nome do prato.
  - `preco` (numérico, obrigatório): Preço unitário.
  - `descricao` (texto, opcional): Acompanhamentos e detalhes.
  - `categoria` (texto, opcional): Categoria vinculada.
  - `happy_hour` (string `"true"` ou `"false"`): Define se participa da promoção.
  - `imagem` (arquivo binário, opcional): Foto em JPG, PNG ou WebP (máx. 5MB).
- **Resposta de Sucesso (201 Created):**
  ```json
  {
    "mensagem": "Prato cadastrado!",
    "id": 135
  }
  ```

#### 3. Editar Prato Existente
- **Endpoint:** `PUT /pratos/:id`
- **Acesso:** Privado (`Bearer Token` com papel `admin`)
- **Headers:** `Authorization: Bearer <TOKEN>` e `Content-Type: multipart/form-data`
- **Descrição:** Atualiza qualquer campo do prato e permite substituir a foto (se um novo arquivo for enviado, a foto anterior é substituída; caso contrário, a imagem atual é preservada).
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "mensagem": "Prato atualizado!"
  }
  ```

#### 4. Deletar Prato
- **Endpoint:** `DELETE /pratos/:id`
- **Acesso:** Privado (`Bearer Token` com papel `admin`)
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "mensagem": "Prato removido!"
  }
  ```

---

### 🏷️ C. Categorias Dinâmicas (`/categorias`)

#### 1. Listar Categorias
- **Endpoint:** `GET /categorias`
- **Acesso:** Público
- **Descrição:** Retorna a listagem ordenada de categorias com seus respectivos ícones/emojis.
- **Resposta (200 OK):**
  ```json
  [
    { "id": 1, "nome": "1/2 Refeição Completa", "icone": "🍲", "ordem": 1 },
    { "id": 5, "nome": "Petiscos", "icone": "🍟", "ordem": 5 },
    { "id": 6, "nome": "Pizzas Grandes", "icone": "🍕", "ordem": 6 }
  ]
  ```

#### 2. Criar Nova Categoria
- **Endpoint:** `POST /categorias`
- **Acesso:** Privado (`Bearer Token` com papel `admin`)
- **Corpo da Requisição (Body):**
  ```json
  {
    "nome": "Caldinhos Especiais",
    "icone": "🍲"
  }
  ```
- **Resposta (201 Created):**
  ```json
  {
    "mensagem": "Categoria criada com sucesso!",
    "id": 10
  }
  ```

#### 3. Deletar Categoria
- **Endpoint:** `DELETE /categorias/:id`
- **Acesso:** Privado (`Bearer Token` com papel `admin`)
- **Regra de Proteção:** Se houver pratos cadastrados nessa categoria, a exclusão é rejeitada com código `400 Bad Request` para garantir a integridade do cardápio.

---

### ⚡ D. Configuração do Happy Hour (`/config`)

#### 1. Obter Configurações
- **Endpoint:** `GET /config`
- **Acesso:** Público
- **Descrição:** Retorna o status de ativação, os dias e os horários em vigor do Happy Hour.
- **Resposta (200 OK):**
  ```json
  {
    "id": 1,
    "hh_ativo": 1,
    "hh_dias": "Segunda, Terça e Quarta",
    "hh_inicio": "19:00",
    "hh_fim": "22:00"
  }
  ```

#### 2. Salvar Configurações de Happy Hour
- **Endpoint:** `PUT /config/happy-hour`
- **Acesso:** Privado (`Bearer Token` com papel `admin`)
- **Corpo da Requisição (Body):**
  ```json
  {
    "hh_ativo": true,
    "hh_dias": "Quarta a Sexta",
    "hh_inicio": "18:00",
    "hh_fim": "21:30"
  }
  ```
- **Resposta (200 OK):**
  ```json
  {
    "mensagem": "Configurações de Happy Hour atualizadas com sucesso!",
    "config": {
      "hh_ativo": 1,
      "hh_dias": "Quarta a Sexta",
      "hh_inicio": "18:00",
      "hh_fim": "21:30"
    }
  }
  ```

---

## 7. FLUXO DE AUTENTICAÇÃO & SEGURANÇA (JWT)

1. O administrador acessa a tela de `/login` e envia suas credenciais.
2. O servidor pesquisa o email na tabela `usuario`, executa `bcrypt.compare(senha, hash)` e, em caso de sucesso, assina um token JWT com validade de **8 horas**.
3. O token e os dados públicos do usuário são armazenados no `localStorage` do navegador.
4. No frontend, a instância do Axios em `src/services/api.js` intercepta qualquer chamada subsequente e injeta automaticamente o cabeçalho:
   ```
   Authorization: Bearer <SEU_TOKEN_JWT>
   ```
5. No backend, o middleware `verificarToken` valida a integridade e expiração do token; em seguida, o middleware `apenasAdmin` confirma se a role do usuário é `"admin"`.
6. No frontend, rotas protegidas utilizam o wrapper `<RotaAdmin>` em `App.jsx`, redirecionando qualquer tentativa de acesso não autorizada para o `/login`.

---

## 8. COMO FUNCIONA O CARDÁPIO DINÂMICO & HAPPY HOUR

- **Carregamento Automático:** Ao abrir a página inicial (`Home.jsx`), uma chamada paralela via `Promise.all` consulta `/pratos`, `/categorias` e `/config`.
- **Organização Inteligente:** Pratos com a flag `happy_hour: 1` são separados automaticamente dos pratos convencionais e alocados na seção com tema escuro e dourado.
- **Categorias Automáticas:** O frontend itera sobre a lista de categorias do banco. Se uma categoria não possuir pratos vinculados no momento, sua seção fica oculta sem poluir o layout.
- **Banner do Happy Hour:** Quando ativado pelo administrador, o cardápio renderiza o badge dinâmico:
  ```text
  ⚡ Promoções Especiais
  Happy Hour
  📅 [Dias Configurados]  •  ⏰ Das [Hora Início] às [Hora Fim]
  ```
- Caso o administrador desative o Happy Hour na tela administrativa, tanto o botão no cabeçalho quanto a seção inteira somem do cardápio público imediatamente.

---

## 9. PAINEL ADMINISTRATIVO (/admin)

O painel administrativo possui layout **mobile-first** adaptável e conta com 4 abas de gerenciamento:

1. **🍽️ Pratos:**
   - Formulário para adicionar ou editar pratos (preço, nome, descrição, categoria e toggle de Happy Hour).
   - Zona de drag & drop / clique para upload de fotos.
   - Lista completa com pré-visualização, filtro rápido "Só Happy Hour", botão de edição rápida (✏️ que preenche o formulário e rola suavemente para o topo) e exclusão com confirmação (🗑️).
2. **🏷️ Categorias:**
   - Adição de novas categorias com nome e seletor com mais de 25 emojis sugeridos.
   - Pré-visualização instantânea de como o título da seção aparecerá no cardápio.
   - Bloqueio inteligente de exclusão para categorias que tenham pratos associados.
3. **⚡ Happy Hour:**
   - Chave de ativação/pausa.
   - Campo de texto para dias da semana com atalhos de preenchimento rápido.
   - Seletores de horário nativos (`time`).
   - Pré-visualização ao vivo do banner antes de salvar.
4. **📱 QR Code:**
   - Renderização em SVG do QR Code apontando para o cardápio público.
   - Botão para **🖨️ Imprimir QR Code** diretamente do navegador.

---

## 10. ACESSO MOBILE, REDE LOCAL & QR CODE

Para permitir que os clientes acessem o cardápio apontando a câmera do celular no restaurante:

1. **IP Dinâmico no Frontend (`api.js`):**  
   O frontend detecta o hostname atual via `window.location.hostname`. Quando um cliente abre `http://192.168.0.11:5173`, as requisições para a API e o carregamento das fotos de uploads são feitas automaticamente para `http://192.168.0.11:3001` (evitando o erro clássico de apontar para `localhost` no celular).
2. **Vite Exposto na Rede (`vite.config.js`):**  
   Configurado com `server: { host: true, port: 5173 }`, liberando o binding em `0.0.0.0`.
3. **CORS Aberto para LAN (`app.js`):**  
   Permite chamadas provenientes de qualquer IP local conectado no mesmo roteador.
4. **QR Code no Terminal:**  
   Ao iniciar o backend com `npm run dev` ou `node server.js`, o servidor detecta a interface de rede ativa e imprime o QR Code em ASCII diretamente no console.

---

## 11. EXECUTANDO COM DOCKER COMPOSE

Toda a infraestrutura pode ser executada em containers isolados via Docker:

### 1. Subir a aplicação:
```bash
docker compose up -d --build
```

### 2. O que este comando faz automaticamente:
- Sobe o container `boteco_db` (MySQL 8.0) e executa `backend/init.sql`, criando as tabelas, o admin padrão e todos os pratos.
- Aguarda a saúde do banco (`healthcheck`) e inicializa o container `boteco_backend` na porta `3001`.
- Compila a aplicação React com Vite e entrega os artefatos para o container `boteco_frontend` servido por um servidor Nginx leve nas portas `80` e `5173`.

### 3. Comandos Úteis do Docker:
```bash
# Ver logs em tempo real:
docker compose logs -f

# Parar os containers:
docker compose down

# Parar e resetar o banco de dados do zero:
docker compose down -v
```

---

## 12. CREDENCIAIS PADRÃO DO SISTEMA

| Serviço | Usuário / Identificador | Senha | URL / Porta |
|---|---|---|---|
| **Painel Admin** | `admin@boteco.com` | `admin123` | `http://localhost:5173/login` |
| **Banco MySQL** | `root` | `viniZIKA3103` | Porta `3306` (Database: `restaurante`) |
| **Cardápio Público** | *Acesso Livre* | *Sem senha* | `http://localhost:5173` ou `http://localhost` |
| **API REST** | *Acesso Livre / JWT* | *Token Bearer* | `http://localhost:3001` |
