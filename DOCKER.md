# 🍺 Boteco do Sivirino — Executando com Docker

Este projeto foi totalmente dockerizado com **Docker Compose**, contendo 3 containers integrados:
1. **`database`**: MySQL 8.0 com inicialização automática (`init.sql` já cria as tabelas, o usuário admin e insere os 20 pratos).
2. **`backend`**: Node.js com Express e Multer para upload de imagens (porta `3001`).
3. **`frontend`**: React + Vite compilado e servido com Nginx leve (portas `80` e `5173`).

---

## 🚀 Como Rodar Tudo com 1 Comando

Certifique-se de que o **Docker Desktop** está aberto e rodando no seu Windows.

Na pasta raiz do projeto (`C:\Users\vini\Documents\AP1_CARDAPIO`), execute no terminal (PowerShell ou CMD):

```bash
docker compose up -d --build
```

---

## 🌐 Links de Acesso

- **Cardápio Público:**
  - `http://localhost` ou `http://localhost:5173`
  - No celular (mesmo Wi-Fi): `http://<SEU_IP_LOCAL>:5173`
- **Painel Administrativo:**
  - `http://localhost/admin` ou `http://localhost:5173/admin`
- **Credenciais do Admin Padrão:**
  - **Email:** `admin@boteco.com`
  - **Senha:** `admin123`

---

## 🛑 Comandos Úteis

- **Ver logs em tempo real:**
  ```bash
  docker compose logs -f
  ```
- **Parar todos os containers:**
  ```bash
  docker compose down
  ```
- **Parar e limpar os dados do banco (recriar do zero):**
  ```bash
  docker compose down -v
  ```
