# ⚡ GUIA COMPLETO DAS ROTAS DA API REST

A API do Boteco do Sivirino opera na porta `3001`.
Base URL Local: `http://localhost:3001`
Base URL Rede Local: `http://<SEU_IP_LOCAL>:3001`

---

## 1. Autenticação (`/auth`)

### `POST /auth/login`
- **Acesso:** Público
- **Descrição:** Autentica o usuário com email e senha. Retorna o token JWT e dados do perfil.
- **Headers:** `Content-Type: application/json`
- **Corpo (JSON):**
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

### `POST /auth/registrar`
- **Acesso:** Privado (`Bearer Token` de Admin)
- **Descrição:** Cria uma nova conta administrativa ou de atendente.
- **Headers:**
  - `Authorization: Bearer <TOKEN_JWT>`
  - `Content-Type: application/json`
- **Corpo (JSON):**
  ```json
  {
    "nome": "João Silva",
    "email": "joao@boteco.com",
    "senha": "senhaSegura123",
    "role": "admin"
  }
  ```

---

## 2. Pratos do Cardápio (`/pratos`)

### `GET /pratos`
- **Acesso:** Público
- **Descrição:** Retorna a lista completa de pratos disponíveis ordenados por categoria.
- **Resposta de Sucesso (200 OK):**
  ```json
  [
    {
      "id": 1,
      "nome": "Cozido de Carne na Panela",
      "descricao": "Carne bovina cozida no molho especial da casa, arroz e feijão",
      "preco": "38.90",
      "categoria": "Almoço",
      "happy_hour": 0,
      "imagem": "/uploads/cozido.png",
      "criado_em": "2026-09-02T22:05:46.000Z"
    }
  ]
  ```

### `POST /pratos`
- **Acesso:** Privado (`Bearer Token` de Admin)
- **Descrição:** Cadastra um novo prato no cardápio, com suporte a foto via upload.
- **Headers:**
  - `Authorization: Bearer <TOKEN_JWT>`
  - `Content-Type: multipart/form-data`
- **Campos do Formulário (FormData):**
  - `nome` (String, obrigatório): Nome do prato.
  - `preco` (Number/String, obrigatório): Preço unitário em reais.
  - `descricao` (String, opcional): Ingredientes e detalhes.
  - `categoria` (String, opcional): Categoria vinculada (ex: `Almoço`, `Pizzas`).
  - `happy_hour` (String "true"|"false", opcional): Define se participa da promoção.
  - `imagem` (File binário, opcional): Arquivo de foto (JPG, PNG ou WebP).
- **Resposta de Sucesso (201 Created):**
  ```json
  {
    "mensagem": "Prato cadastrado!",
    "id": 21
  }
  ```

### `PUT /pratos/:id`
- **Acesso:** Privado (`Bearer Token` de Admin)
- **Descrição:** Edita os dados de um prato existente e substitui a foto se fornecida.
- **Headers:**
  - `Authorization: Bearer <TOKEN_JWT>`
  - `Content-Type: multipart/form-data`

### `DELETE /pratos/:id`
- **Acesso:** Privado (`Bearer Token` de Admin)
- **Descrição:** Remove um prato do cardápio.
- **Headers:** `Authorization: Bearer <TOKEN_JWT>`

---

## 3. Categorias Dinâmicas (`/categorias`)

### `GET /categorias`
- **Acesso:** Público
- **Descrição:** Lista as categorias cadastradas em ordem de prioridade.
- **Resposta (200 OK):**
  ```json
  [
    { "id": 1, "nome": "Almoço", "icone": "🍽️", "ordem": 1 },
    { "id": 2, "nome": "Petiscos", "icone": "🍟", "ordem": 2 },
    { "id": 3, "nome": "Pizzas", "icone": "🍕", "ordem": 3 }
  ]
  ```

### `POST /categorias`
- **Acesso:** Privado (`Bearer Token` de Admin)
- **Descrição:** Cadastra uma nova categoria. Ela criará automaticamente uma seção no cardápio assim que tiver pratos vinculados.
- **Corpo (JSON):**
  ```json
  {
    "nome": "Frutos do Mar",
    "icone": "🦐"
  }
  ```

### `DELETE /categorias/:id`
- **Acesso:** Privado (`Bearer Token` de Admin)
- **Descrição:** Remove uma categoria. *Protegida:* Se houver pratos cadastrados nela, o sistema bloqueia para evitar inconsistência.

---

## 4. Configuração do Happy Hour (`/config`)

### `GET /config`
- **Acesso:** Público
- **Descrição:** Retorna os dias, horários e status ativo do Happy Hour exibidos no banner.
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

### `PUT /config/happy-hour`
- **Acesso:** Privado (`Bearer Token` de Admin)
- **Descrição:** Atualiza as regras de exibição do Happy Hour.
- **Corpo (JSON):**
  ```json
  {
    "hh_ativo": true,
    "hh_dias": "Segunda, Terça e Quarta",
    "hh_inicio": "19:00",
    "hh_fim": "22:00"
  }
  ```
