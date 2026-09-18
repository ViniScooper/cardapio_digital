# 📋 Análise e Guia de Contratação & Implantação: VPS Hostinger (KVM 1)

## 1. Avaliação das Escolhas do Carrinho: Daria certo?

**SIM, DÁ 100% CERTO! É o melhor custo-benefício profissional para o Boteco do Sivirino.**

Abaixo estão as recomendações exatas para cada opção que apareceu na tela da Hostinger:

---

### 🔹 1. Plano: KVM 1 (R$ 32,99 / mês)
* **Veredito:** **Excelente escolha.**
* **Especificações:** 1 vCPU, 4 GB RAM, 50 GB NVMe, 4 TB de tráfego.
* **Para o seu projeto:** Como você roda Node.js + MySQL em Docker e o Frontend na Vercel (ou até mesmo dentro do Nginx da própria VPS), 4 GB de RAM é **mais do que suficiente** para aguentar milhares de acessos simultâneos sem lentidão. O banco MySQL consome em média 300MB–500MB de RAM e o backend Node.js cerca de 80MB–150MB.

---

### 🔹 2. Localização do Servidor: Brasil vs Estados Unidos
* **Na sua tela apareceu:** Estados Unidos - Boston 2 (169 ms).
* **Recomendação:** Se houver a opção **Brasil (São Paulo)** disponível no dropdown, **SELECIONE BRASIL**.
  * No Brasil, o ping fica entre **15ms e 35ms** (resposta instantânea para quem está em Recife/Pernambuco acessando o cardápio).
  * Se o plano KVM 1 só tiver EUA ou se o Brasil tiver custo extra, **Estados Unidos funciona perfeitamente também** (169 ms é imperceptível para abrir cardápio e fazer pedidos).

---

### 🔹 3. Sistema Operacional: Qual a melhor versão?
* **Sistema:** **Ubuntu** (Melhor escolha disparada: compatibilidade total com Docker, Certbot, Nginx e maior comunidade).
* **Versão:** Escolha **Ubuntu 24.04 LTS** (ou 22.04 LTS).
  * *Observação:* As versões com selo **LTS** (*Long Term Support*) têm 5 anos de suporte, estabilidade máxima e todas as bibliotecas oficiais prontas.

---

### 🔹 4. Domínio Grátis Incluso
* **Vantagem enorme:** Aproveite o domínio grátis (ex: otecodosivirino.com.br ou .com).
* **Como vamos usar:**
  * otecodosivirino.com.br ➔ Frontend do Cardápio.
  * pi.botecodosivirino.com.br ➔ Backend Node.js com HTTPS permanente (adeus túneis Cloudflare temporários!).

---

### 🔹 5. Backups Automáticos (R$ 16,99/mês opcional)
* **Recomendação:** **Opcional.** Se quiser economizar esses R$ 16,99 por mês, você pode criar um script cron simples de 1 linha no Linux que faz o dump do banco todo domingo e salva uma cópia. Mas se o cliente valoriza tranquilidade total de restauração com 1 clique no painel da Hostinger, pode marcar.

---

## 🚀 Passo a Passo de Execução após Ativar a VPS

### Etapa 1: Fazer o Backup na VM Atual (Oracle)
Execute na máquina onde o cardápio está rodando agora:

`ash
# 1. Salva todos os pratos, categorias, configurações e bairros atuais
docker exec boteco_db mysqldump -u root -pviniZIKA3103 restaurante > backup_sivirino.sql

# 2. Compacta as fotos cadastradas dos pratos
tar -czvf fotos_pratos.tar.gz /home/ubuntu/cardapio_digital/backend/uploads/
`

Baixe ackup_sivirino.sql e otos_pratos.tar.gz para seu computador usando o FileZilla ou MobaXterm.

---

### Etapa 2: Acessar a nova VPS Hostinger e Preparar o Ambiente
Assim que a Hostinger liberar o IP da máquina, abra o terminal e conecte:

`ash
ssh root@IP_DA_HOSTINGER
`

Cole este comando para atualizar e instalar o Docker:
`ash
apt update && apt upgrade -y
apt install -y git curl ufw nginx certbot python3-certbot-nginx

# Instala Docker Oficial
curl -fsSL https://get.docker.com | sh
`

---

### Etapa 3: Clonar o Projeto e Restaurar os Dados
`ash
cd /home
git clone https://github.com/ViniScooper/cardapio_digital.git
cd /home/cardapio_digital
mkdir -p backend/uploads
`

Envie os arquivos ackup_sivirino.sql e otos_pratos.tar.gz para /home/cardapio_digital/ e restaure as fotos:
`ash
tar -xzvf fotos_pratos.tar.gz -C backend/uploads --strip-components=1
`

---

### Etapa 4: Subir os Containers Docker e Importar o Banco
`ash
# 1. Sobe o banco de dados
docker compose up -d database

# 2. Aguarde 10 segundos para o MySQL inicializar e importe os dados:
docker exec -i boteco_db mysql -u root -pviniZIKA3103 restaurante < backup_sivirino.sql

# 3. Sobe o backend e frontend
docker compose up -d --build
`

---

### Etapa 5: Configurar Domínio + SSL Vitalício (Sem Cloudflare Tunnel)

1. No painel de DNS do domínio, aponte:
   * Tipo A | Nome pi | Valor IP_DA_HOSTINGER
2. Crie o arquivo de proxy reverso no Nginx:
   `ash
   nano /etc/nginx/sites-available/api.conf
   `
   Cole o conteúdo:
   `
ginx
   server {
       server_name api.seudominio.com.br;

       location / {
           proxy_pass http://localhost:3002;
           proxy_http_version 1.1;
           proxy_set_header Upgrade ;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host System.Management.Automation.Internal.Host.InternalHost;
           proxy_cache_bypass ;
           client_max_body_size 25M;
       }
   }
   `
3. Ative o site e gere o certificado SSL com 1 comando:
   `ash
   ln -s /etc/nginx/sites-available/api.conf /etc/nginx/sites-enabled/
   nginx -t && systemctl reload nginx
   
   # O Certbot configura o HTTPS automático e renova sozinho para sempre
   certbot --nginx -d api.seudominio.com.br
   `

4. No frontend (environment.js), você simplesmente define a URL de produção para:
   `javascript
   producao: "https://api.seudominio.com.br"
   `

Pronto! Fica uma arquitetura 100% profissional, rápida, sem risco de cair e sem links temporários.
