# 🌐 GUIA DE CONFIGURAÇÃO DE AMBIENTES E DEPLOY
### Como alternar entre Local, Vercel, Hostinger e Oracle Cloud

---

## 📌 1. Onde fica o arquivo de configuração?

Criamos um arquivo centralizado no frontend projetado especificamente para você **trocar de ambiente alterando apenas 1 linha**:

👉 **[`frontend/src/config/environment.js`](file:///C:/Users/vini/Documents/AP1_CARDAPIO/frontend/src/config/environment.js)**

---

## ⚙️ 2. Como alternar entre ambientes

Abra o arquivo [`environment.js`](file:///C:/Users/vini/Documents/AP1_CARDAPIO/frontend/src/config/environment.js). Nele você encontrará o bloco de ambientes:

```javascript
const AMBIENTES = {
    // 1. Desenvolvimento local ou na mesma rede Wi-Fi pelo celular
    local: typeof window !== "undefined" ? `http://${window.location.hostname}:3001` : "http://localhost:3001",

    // 2. Sua VM Oracle Cloud (coloque o IP ou subdomínio da sua VM)
    oracle_vm: "http://129.148.25.100:3001",

    // 3. Túnel gratuito Cloudflare / Ngrok (para testes externos sem pagar domínio)
    tunel_teste: "https://api-boteco.trycloudflare.com",

    // 4. Hostinger (caso use VPS ou subdomínio na Hostinger)
    hostinger: "https://api.botecodosivirino.com.br"
};

// 🎯 ALTERE APENAS ESTA LINHA:
const AMBIENTE_ATIVO = "local"; 
```

### Para onde você quer apontar?
- **Para testar no PC / Celular via Wi-Fi:** Deixe `AMBIENTE_ATIVO = "local";`
- **Para apontar para a VM da Oracle:** Mude para `AMBIENTE_ATIVO = "oracle_vm";`
- **Para apontar para a Hostinger:** Mude para `AMBIENTE_ATIVO = "hostinger";`
- **Para testes rápidos com link temporário:** Mude para `AMBIENTE_ATIVO = "tunel_teste";`

---

## 🚀 3. Como subir na Vercel (Recomendado)

A Vercel aceita **variáveis de ambiente direto pelo painel web**, o que significa que você **nem precisa alterar código** para fazer deploy!

1. Conecte seu GitHub na [Vercel](https://vercel.com).
2. Selecione o repositório do projeto.
3. Configure:
   - **Root Directory:** selecione a pasta `frontend`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Na seção **Environment Variables**, adicione:
   - **Nome:** `VITE_API_URL`
   - **Valor:** a URL da sua API (ex: `https://api.seusite.com` ou a URL da Oracle Cloud).
5. Clique em **Deploy**.

> 💡 **Nota:** O arquivo [`frontend/vercel.json`](file:///C:/Users/vini/Documents/AP1_CARDAPIO/frontend/vercel.json) já foi criado para garantir que rotas como `/admin` e `/login` não deem erro 404 ao atualizar a página.

---

## 🏢 4. Como subir na Hostinger

Se você estiver usando **Hospedagem Compartilhada (cPanel / hPanel)** ou **VPS** na Hostinger:

### Opção A: Frontend na Hostinger (Hospedagem Web Normal)
1. No arquivo [`environment.js`](file:///C:/Users/vini/Documents/AP1_CARDAPIO/frontend/src/config/environment.js), aponte para `oracle_vm` ou coloque a URL da API na Hostinger.
2. Rode no terminal do frontend:
   ```bash
   npm run build
   ```
3. Pegue todos os arquivos dentro da pasta `frontend/dist/` e suba para a pasta `public_html/` da Hostinger.
4. Crie um arquivo `.htaccess` dentro da `public_html/` com o conteúdo:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

### Opção B: Backend Node.js na VPS da Hostinger ou VM Oracle
1. Na VM/VPS, clone a pasta `backend/`.
2. Configure o arquivo `backend/.env` com a senha do banco MySQL da VPS.
3. Inicie a API com PM2:
   ```bash
   npm install --production
   pm2 start server.js --name "boteco-backend"
   pm2 save
   ```

---

## 🔒 5. CORS Liberado Automaticamente

O arquivo [`backend/src/app.js`](file:///C:/Users/vini/Documents/AP1_CARDAPIO/backend/src/app.js) já foi configurado para aceitar automaticamente qualquer requisição vinda de:
- `localhost` e computadores na mesma rede Wi-Fi.
- Qualquer domínio gerado pela Vercel (`*.vercel.app`).
- Domínios personalizados na Hostinger.
