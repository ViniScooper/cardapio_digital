# 🍺 DOCUMENTAÇÃO GERAL DO SISTEMA — BOTECO DO SIVIRINO

Sistema Full-Stack de **Cardápio Digital Interativo** com painel administrativo, suporte a upload de fotos, seções dinâmicas, promoções de Happy Hour com horário configurável, geração de QR Code para mesas e empacotamento completo via Docker.

---

## 🏛️ 1. Arquitetura da Aplicação

O ecossistema é dividido em 3 camadas desacopladas:

1. **Frontend (`/frontend`)**:
   - **Tecnologias:** React 18, Vite, React Router DOM v6, Axios, QRCode.react.
   - **Design:** Mobile-First responsivo (Menu hamburguer em telas móveis, grade fluida, temas escuro e dourado inspirados em botecos modernos).
   - **Rotas Públicas:** `/` (Cardápio interativo), `/docs` (Documentação Web interativa).
   - **Rotas Privadas:** `/admin` (Painel com controle de pratos, categorias, happy hour e QR code).

2. **Backend (`/backend`)**:
   - **Tecnologias:** Node.js, Express, Multer, JWT (jsonwebtoken), BcryptJS, MySQL2.
   - **Serviço de Arquivos:** Servidor de estáticos na rota `/uploads` para entrega de fotos dos pratos.
   - **Segurança:** Middleware com validação de token JWT Bearer e restrição de perfis (`admin`).
   - **Porta:** `3001` (com suporte a escuta em `0.0.0.0` para rede local).

3. **Banco de Dados (`MySQL 8.0`)**:
   - **Database:** `restaurante`
   - **Tabelas:**
     - `usuario`: Gerenciamento de credenciais e permissões (hash de senha bcrypt).
     - `categoria`: Categorias dinâmicas com ícones/emojis e ordenação.
     - `prato`: Itens do menu, fotos, preços, vínculo com categoria e flag de Happy Hour.
     - `configuracao`: Dias da semana e horários de funcionamento do Happy Hour.

---

## 🔐 2. Credenciais Padrão do Sistema

- **Acesso ao Painel Admin:**
  - **URL:** `http://localhost:5173/login` ou `http://localhost/login`
  - **Email:** `admin@boteco.com`
  - **Senha:** `admin123`
- **Banco de Dados MySQL:**
  - **Host:** `localhost` (ou `database` via Docker)
  - **Porta:** `3306`
  - **Usuário:** `root`
  - **Senha:** `viniZIKA3103`
  - **Banco:** `restaurante`

---

## 🚀 3. Como Executar o Projeto

### Opção A — Executando com Docker Compose (Recomendado)
Certifique-se de que o Docker Desktop está aberto e rode na raiz do projeto:
```bash
docker compose up -d --build
```
*Os 3 serviços (MySQL, Backend e Frontend/Nginx) sobem automaticamente com os 20 pratos e o admin já cadastrados.*

### Opção B — Executando Manualmente (Modo Desenvolvimento)

1. **Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📱 4. Acesso pelo Celular via QR Code / Rede Local

1. Conecte o computador e o smartphone na **mesma rede Wi-Fi**.
2. Identifique o IP local da sua máquina (ex: `192.168.0.11`).
3. Acesse no celular:
   - **Cardápio:** `http://192.168.0.11:5173`
   - **Admin:** `http://192.168.0.11:5173/admin`
4. Na aba **📱 QR Code** do painel admin, você pode imprimir o código para fixar nas mesas do restaurante.
