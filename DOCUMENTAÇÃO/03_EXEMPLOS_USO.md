# 💻 EXEMPLOS DE USO DA API (cURL, FETCH & POSTMAN)

Aqui você encontra exemplos prontos para copiar e colar para testar as rotas da API em qualquer ferramenta.

---

## 1. Exemplos com cURL (Linha de Comando)

### Passo 1: Autenticar e Obter o Token
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@boteco.com",
    "senha": "admin123"
  }'
```
*Copie o campo `token` da resposta para usar nas requisições autenticadas abaixo.*

---

### Passo 2: Listar Pratos (Público)
```bash
curl -X GET http://localhost:3001/pratos
```

---

### Passo 3: Cadastrar Prato com Imagem (Multipart)
```bash
curl -X POST http://localhost:3001/pratos \
  -H "Authorization: Bearer <SEU_TOKEN_AQUI>" \
  -F "nome=Escondidinho de Carne Seca" \
  -F "descricao=Purê cremoso de macaxeira com carne de sol gratinada" \
  -F "preco=39.90" \
  -F "categoria=Almoço" \
  -F "happy_hour=false" \
  -F "imagem=@/caminho/para/imagem.jpg"
```

---

### Passo 4: Criar uma Nova Categoria
```bash
curl -X POST http://localhost:3001/categorias \
  -H "Authorization: Bearer <SEU_TOKEN_AQUI>" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Caldinhos",
    "icone": "🍲"
  }'
```

---

### Passo 5: Atualizar Dias e Horários do Happy Hour
```bash
curl -X PUT http://localhost:3001/config/happy-hour \
  -H "Authorization: Bearer <SEU_TOKEN_AQUI>" \
  -H "Content-Type: application/json" \
  -d '{
    "hh_ativo": true,
    "hh_dias": "Quarta a Sexta",
    "hh_inicio": "18:00",
    "hh_fim": "21:30"
  }'
```

---

## 2. Exemplos em JavaScript (Fetch API / Node.js)

### Cadastrar Prato com Imagem via JavaScript
```javascript
async function cadastrarPrato(token, arquivoImagem) {
  const formData = new FormData();
  formData.append("nome", "Frango a Passarinho");
  formData.append("descricao", "Crocante com alho torrado e cheiro verde");
  formData.append("preco", "28.50");
  formData.append("categoria", "Petiscos");
  formData.append("happy_hour", "true");

  if (arquivoImagem) {
    formData.append("imagem", arquivoImagem);
  }

  const resposta = await fetch("http://localhost:3001/pratos", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });

  const dados = await resposta.json();
  console.log("Resultado:", dados);
}
```

---

## 3. Testando via Postman / Insomnia

1. **Variável de Ambiente:** Crie `baseUrl` com o valor `http://localhost:3001`.
2. **Autenticação:** Para as rotas de `POST`, `PUT` e `DELETE`, na aba **Auth**, selecione **Bearer Token** e cole o token JWT gerado na rota `/auth/login`.
3. **Upload de Imagem:** Para `/pratos`, na aba **Body**, selecione `form-data`, coloque a chave `imagem` e mude o tipo dela de *Text* para *File*.
