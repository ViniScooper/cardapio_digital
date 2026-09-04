# 🔐 GUIA DE PRODUÇÃO: AUTENTICAÇÃO E GESTÃO DE USUÁRIOS VIA API

---

## 📌 1. Usuário Padrão de Produção

Assim que o banco de dados é iniciado na VM, o seguinte usuário administrador é provisionado:

- **Painel Web:** [https://cardapiodigital-opal.vercel.app/login](https://cardapiodigital-opal.vercel.app/login)
- **E-mail:** `admin@boteco.com`
- **Senha:** `admin123`
- **Perfil / Role:** `admin`

---

## 🌐 2. Endpoints da API em Produção

**URL Base:** `https://peers-discussed-gadgets-metres.trycloudflare.com`

---

### 🔹 1. Fazer Login (`POST /auth/login`)
Gera o token JWT necessário para chamar as rotas protegidas.

- **Requisição:**
```bash
curl -X POST https://peers-discussed-gadgets-metres.trycloudflare.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@boteco.com",
    "senha": "admin123"
  }'
```

- **Resposta de Sucesso (200 OK):**
```json
{
  "mensagem": "Login realizado com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibm9tZSI6IkFkbWluaXN0cmFkb3IiLCJlbWFpbCI6ImFkbWluQGJvdGVjby5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MjU0MTk1MjUsImV4cCI6MTcyNTQ0ODMyNX0...",
  "usuario": {
    "id": 1,
    "nome": "Administrador",
    "email": "admin@boteco.com",
    "role": "admin"
  }
}
```

---

### 🔹 2. Cadastrar Novo Usuário ou Gerente (`POST /auth/registrar`)
> 🔒 **Protegido:** Apenas administradores logados (enviando o Bearer Token no header) podem cadastrar novos acessos.

- **Requisição:**
```bash
curl -X POST https://peers-discussed-gadgets-metres.trycloudflare.com/auth/registrar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "nome": "Gerente Carlos",
    "email": "carlos@boteco.com",
    "senha": "SenhaForte2026!",
    "role": "admin"
  }'
```

- **Parâmetros:**
  - `nome` (obrigatório, string)
  - `email` (obrigatório, string única)
  - `senha` (obrigatório, criptografada automaticamente com `bcrypt` no banco)
  - `role` (opcional: `"admin"` ou `"user"`)

- **Resposta de Sucesso (201 Created):**
```json
{
  "mensagem": "Usuário cadastrado como admin!",
  "id": 2
}
```

---

### 🔹 3. Listar Usuários com Acesso (`GET /auth/usuarios`)
> 🔒 **Protegido:** Apenas administradores podem auditar quem tem conta no sistema.

- **Requisição:**
```bash
curl -X GET https://peers-discussed-gadgets-metres.trycloudflare.com/auth/usuarios \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

- **Resposta (200 OK):**
```json
[
  {
    "id": 1,
    "nome": "Administrador",
    "email": "admin@boteco.com",
    "role": "admin",
    "criado_em": "2026-09-04T01:09:20.000Z"
  },
  {
    "id": 2,
    "nome": "Gerente Carlos",
    "email": "carlos@boteco.com",
    "role": "admin",
    "criado_em": "2026-09-04T02:10:15.000Z"
  }
]
```

---

### 🔹 4. Alterar a Própria Senha (`PUT /auth/alterar-senha`)
> 🔒 **Protegido:** Qualquer usuário logado pode mudar sua própria senha informando a senha antiga.

- **Requisição:**
```bash
curl -X PUT https://peers-discussed-gadgets-metres.trycloudflare.com/auth/alterar-senha \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "senhaAtual": "admin123",
    "novaSenha": "NovaSenhaSuperSegura2026!"
  }'
```

- **Resposta (200 OK):**
```json
{
  "mensagem": "Senha alterada com sucesso!"
}
```

---

## 💻 3. Coleção Pronta para o Postman / Insomnia

Para testar no **Postman** ou **Insomnia**, basta:
1. Criar uma pasta chamada `Boteco do Sivirino - Auth`.
2. Criar uma variável de ambiente:
   - `BASE_URL`: `https://peers-discussed-gadgets-metres.trycloudflare.com`
   - `TOKEN`: Cole o valor retornado no `/auth/login`.
3. Adicionar o Header em todas as requisições:
   - `Authorization`: `Bearer {{TOKEN}}`
