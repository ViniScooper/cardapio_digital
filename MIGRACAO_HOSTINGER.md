# 🚀 Guia de Migração para Hostinger — Boteco do Sivirino (Cardápio Digital)

Este guia documenta o passo a passo completo para migrar todo o ecossistema do **Cardápio Digital** (Frontend React, Backend Node.js/Express, Banco de Dados MySQL, Uploads e Domínio com HTTPS) para a **Hostinger**.

---

## 📌 1. Cenários de Hospedagem na Hostinger

Antes de começar, identifique o plano contratado pelo cliente na Hostinger:

- **Opção A: VPS Hostinger (Linux Ubuntu / Docker) — ⭐️ ALTAMENTE RECOMENDADA**
  - Permite rodar exatamente a mesma estrutura atual com docker-compose, Nginx reverso e SSL grátis via Let's Encrypt / Certbot.
  - Custo acessível (planos KVM 1 ou KVM 2 a partir de R$ 25 - 40/mês).
  - O banco de dados, API e frontend ficam no mesmo servidor com desempenho máximo e sem limite de conexões.

- **Opção B: Hospedagem Compartilhada / Cloud (hPanel com Node.js)**
  - Suporta Node.js via gerenciador de aplicações do hPanel e MySQL gerenciado.
  - O frontend React estático (dist/) fica no diretório public_html.
  - Requer configuração manual dos serviços no painel.

---

## 🛠️ Cenário A: Migração para VPS Hostinger (Com Docker)

Este é o método mais rápido, robusto e idêntico ao ambiente atual.

### Passo 1: Backup dos Dados Atuais

Na máquina atual (Oracle VM):
`ash
# 1. Gerar dump do banco de dados MySQL
docker exec boteco_db mysqldump -u root -pviniZIKA3103 restaurante > backup_restaurante.sql

# 2. Compactar pasta de imagens enviadas (uploads)
tar -czvf uploads_backup.tar.gz /home/ubuntu/cardapio_digital/backend/uploads/
`

Baixe os dois arquivos (ackup_restaurante.sql e uploads_backup.tar.gz) para o seu computador via SFTP (FileZilla / MobaXterm).

---

### Passo 2: Preparação da VPS Hostinger

1. No painel da Hostinger, crie a VPS escolhendo o sistema operacional **Ubuntu 22.04 ou 24.04 LTS**.
2. Conecte-se à VPS via SSH:
   `ash
   ssh root@IP_DA_HOSTINGER
   `
3. Atualize os pacotes e instale o Docker e Docker Compose:
   `ash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y git curl ufw
   
   # Instalação oficial do Docker
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker 
   `

---

### Passo 3: Clonar o Projeto e Restaurar Dados

`ash
# Clone o repositório oficial
cd /home
git clone https://github.com/ViniScooper/cardapio_digital.git
cd /home/cardapio_digital

# Crie a pasta de uploads caso não exista
mkdir -p backend/uploads
`

Envie via SFTP o ackup_restaurante.sql e o uploads_backup.tar.gz para a VPS em /home/cardapio_digital/.

Extraia as imagens de upload:
`ash
tar -xzvf uploads_backup.tar.gz -C backend/uploads --strip-components=1
`

---

### Passo 4: Subir os Containers e Importar o Banco

1. Inicie o banco de dados primeiro:
   `ash
   docker compose up -d database
   `
2. Restaure o dump do MySQL:
   `ash
   docker exec -i boteco_db mysql -u root -pviniZIKA3103 restaurante < backup_restaurante.sql
   `
3. Suba todos os containers (Backend e Frontend):
   `ash
   docker compose up -d --build
   `

---

### Passo 5: Configurar Domínio Próprio e SSL Grátis (Nginx + Certbot)

Para não precisar de túneis temporários (Cloudflare Tunnel) e ter HTTPS vitalício no domínio do cliente (ex: cardapio.botecodosivirino.com.br):

1. No registro do domínio (Registro.br ou DNS da Hostinger), crie dois apontamentos tipo **A**:
   - cardapio.seudominio.com.br ➔ IP_DA_VPS_HOSTINGER
   - pi.seudominio.com.br ➔ IP_DA_VPS_HOSTINGER

2. Instale o Nginx na máquina para fazer o proxy reverso:
   `ash
   sudo apt install -y nginx certbot python3-certbot-nginx
   `

3. Crie a configuração do proxy para a API (/etc/nginx/sites-available/api.conf):
   `
ginx
   server {
       server_name api.seudominio.com.br;

       location / {
           proxy_pass http://localhost:3002; # Porta exposta do backend
           proxy_http_version 1.1;
           proxy_set_header Upgrade ;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host System.Management.Automation.Internal.Host.InternalHost;
           proxy_cache_bypass ;
           client_max_body_size 20M;
       }
   }
   `

4. Ative e gere o certificado SSL gratuito automático:
   `ash
   sudo ln -s /etc/nginx/sites-available/api.conf /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   
   # Gera certificado HTTPS oficial com renovação automática
   sudo certbot --nginx -d api.seudominio.com.br
   `

5. **Pronto!** A URL definitiva do backend será https://api.seudominio.com.br.

---

## 🌐 Cenário B: Migração para Hospedagem Compartilhada (hPanel)

Caso o cliente tenha contratado uma hospedagem compartilhada ("Web Hosting Business" ou "Cloud Startup"):

### 1. Banco de Dados MySQL:
1. No painel da Hostinger (hPanel), vá em **Bancos de Dados ➔ Gerenciamento de MySQL**.
2. Crie uma nova base de dados:
   - Nome do banco: u123456789_restaurante
   - Usuário: u123456789_root
   - Senha segura: *(anote a senha gerada)*
3. Abra o **phpMyAdmin** na Hostinger e clique em **Importar**.
4. Selecione o arquivo ackup_restaurante.sql gerado anteriormente.

### 2. Backend Node.js:
1. No menu do hPanel, procure por **Aplicações Web ➔ Node.js**.
2. Clique em **Criar Aplicação**:
   - Versão do Node: 18.x ou 20.x
   - Diretório da aplicação: pi (ou pasta raiz da api)
   - Arquivo de inicialização: server.js (ou index.js)
3. Envie os arquivos da pasta ackend/ via Gerenciador de Arquivos ou Git.
4. Crie o arquivo .env dentro de pi/:
   `env
   PORT=3000
   DB_HOST=localhost
   DB_USER=u123456789_root
   DB_PASSWORD=sua_senha_criada
   DB_NAME=u123456789_restaurante
   DB_PORT=3306
   JWT_SECRET=seu_jwt_secreto
   `
5. No painel do Node.js, clique em **Executar NPM Install** e depois em **Iniciar**.

### 3. Frontend React:
1. No seu computador local, altere o arquivo rontend/src/config/environment.js para apontar para o domínio da Hostinger:
   `javascript
   producao: "https://seudominio.com.br/api",
   `
2. Gere os arquivos finais de produção:
   `ash
   cd frontend
   npm run build
   `
3. Acesse o **Gerenciador de Arquivos** no hPanel e entre na pasta public_html/.
4. Faça upload de todo o conteúdo de dentro de rontend/dist/ para a public_html/.
5. Crie um arquivo .htaccess na raiz de public_html para permitir que o React Router funcione sem dar erro 404 ao atualizar a página:
   `pache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   `

---

## 🔒 Checklist de Validação Pós-Migração

- [ ] **API respondendo:** Acessar https://api.seudominio.com.br/ ou https://seudominio.com.br/api e ver {"mensagem":"API do Boteco do Sivirino funcionando! 🍺"}.
- [ ] **Imagens dos pratos:** Conferir se as fotos carregam em /uploads/....
- [ ] **Painel Admin:** Fazer login com o usuário e senha cadastrados.
- [ ] **Pedido WhatsApp:** Adicionar itens ao carrinho e testar o envio com cálculo de delivery.
- [ ] **HTTPS ativo:** Certificado com cadeado verde em todas as rotas.

---
*Documento gerado para manutenção e suporte ao Boteco do Sivirino.*
