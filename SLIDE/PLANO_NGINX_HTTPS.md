# Plano de Nginx, HTTPS e Portas — Boteco do Sivirino

## Objetivo

Publicar frontend e API com um unico endereco, por exemplo:

```text
https://cardapio.exemplo.com
https://cardapio.exemplo.com/api
https://cardapio.exemplo.com/uploads
```

O Nginx sera o unico servico exposto para a maquina e encaminhara internamente as requisicoes para o frontend estatico e para o backend Express.

## Situacao atual

Hoje o projeto ja possui um Nginx dentro do container do frontend e regras para `/api/` e `/uploads/`. Porem, o arquivo `frontend/src/services/api.js` monta a API diretamente em `http://<hostname>:3001`.

Isso cria tres problemas:

- O navegador acessa uma segunda porta diretamente.
- HTTPS pode gerar bloqueio de mixed content ao chamar a API por HTTP.
- A porta `3001` precisa ficar publicada no host mesmo quando o Nginx ja faz proxy.

## Arquitetura desejada

```text
Internet / rede local
          |
          v
   Nginx: 443 HTTPS
          |
          +--> /             frontend:80
          +--> /api/*        backend:3001
          +--> /uploads/*    backend:3001

backend:3001 e database:3306 ficam apenas na rede interna Docker.
```

## Plano de execucao

### 1. Definir a estrategia de portas

Em producao, publicar somente as portas do Nginx:

- `443:443` para HTTPS.
- Opcionalmente `80:80` apenas para redirecionar HTTP para HTTPS.

Remover do host:

- `3001:3001` do backend.
- `3306:3306` do banco, salvo necessidade explicita de acessar o MySQL externamente.
- `5173:80` do frontend, se o acesso de producao for feito pelo Nginx na porta 80/443.

Importante: portas internas continuam funcionando. O backend continua ouvindo em `3001` e o MySQL em `3306`; eles apenas deixam de ser publicados na maquina.

### 2. Evitar conflito com portas ja ocupadas

Antes de subir a stack, verificar no Windows:

```powershell
Get-NetTCPConnection -LocalPort 80,443,3001,3306,5173 -ErrorAction SilentlyContinue |
  Select-Object LocalPort,State,OwningProcess

Get-Process -Id <PID>
```

Opcoes:

- Se a porta 80 ou 443 estiver livre, usar `80:80` e `443:443`.
- Se estiver ocupada por outro Nginx, IIS, Apache ou Docker, manter esse servico como proxy principal e encaminhar para o container, ou liberar a porta com planejamento.
- Para um ambiente temporario, usar `8080:80` e `8443:443`. Nesse caso, o endereco tera a porta explicita, por exemplo `https://IP:8443`; nao e a melhor opcao para um QR Code definitivo.
- Nao tentar publicar dois servicos diferentes na mesma porta do host. O Docker sempre falhara com erro de bind.

A recomendacao para producao e existir um unico dono das portas 80 e 443: o Nginx de entrada.

### 3. Criar uma URL de API configuravel

Alterar o frontend para usar o proxy no mesmo dominio:

```js
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api"
});
```

No build de producao:

```env
VITE_API_URL=/api
```

Para desenvolvimento local com Vite, usar um arquivo `.env.development` apontando para o backend local, se necessario:

```env
VITE_API_URL=http://localhost:3001
```

A regra principal e nao montar a URL da API com `http://hostname:3001` no codigo de producao.

### 4. Ajustar o proxy do Nginx

Manter o frontend como fallback SPA e encaminhar API e uploads para o nome do servico Docker:

```nginx
server {
    listen 80;
    server_name cardapio.exemplo.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name cardapio.exemplo.com;

    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://backend:3001/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

O `proxy_pass http://backend:3001` usa a rede interna criada pelo Compose; nao usa `localhost` e nao depende da porta publicada no Windows.

### 5. Configurar certificados

Escolher uma das opcoes:

- **Dominio publico:** usar Let's Encrypt, preferencialmente com Certbot ou um proxy como Caddy/Traefik para renovacao automatica.
- **Rede local ou IP:** usar certificado interno ou autofirmado apenas para testes. Celulares e navegadores exibirao alerta ate que a autoridade certificadora seja confiavel.
- **Servidor atras de outro proxy:** deixar o proxy externo cuidar do HTTPS e manter o Nginx interno em HTTP na rede Docker.

Para um QR Code usado por clientes, o ideal e dominio publico com certificado valido. HTTPS em IP privado costuma ser mais trabalhoso e pode gerar alertas no celular.

### 6. Revisar o Docker Compose de producao

Criar um override ou um arquivo separado, como `docker-compose.prod.yml`, para nao quebrar o desenvolvimento. A ideia e:

```yaml
services:
  database:
    expose:
      - "3306"
    # sem ports em producao

  backend:
    expose:
      - "3001"
    # sem ports em producao

  frontend:
    ports:
      - "80:80"
      - "443:443"
    # montar nginx.conf e certificados somente se o Nginx estiver neste container
```

Como o Compose cria uma rede compartilhada por padrao, `backend` sera resolvido pelo Nginx usando o nome do servico.

As senhas, `JWT_SECRET` e dados de banco devem sair do YAML versionado e ir para `.env` ou para um gerenciador de segredos.

### 7. Revisar CORS e cabecalhos

Quando frontend e API usam o mesmo dominio via `/api`, o CORS pode ser restringido ou desativado para esse fluxo. No backend:

- Permitir somente origens necessarias.
- Confiar nos cabecalhos de proxy apenas quando a infraestrutura estiver definida.
- Adicionar `helmet` e politica de seguranca de conteudo depois de validar os uploads e fontes externas.
- Configurar limite de tamanho para JSON e upload.

### 8. Testar antes da troca definitiva

Executar em uma porta alternativa ou ambiente de homologacao:

```powershell
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

docker compose ps

docker compose logs -f frontend backend
```

Checklist funcional:

- Abrir a home pelo dominio HTTPS.
- Confirmar que `/api` chega ao backend.
- Fazer login e abrir `/admin`.
- Conferir listagem de pratos e imagens em `/uploads`.
- Testar QR Code em um celular.
- Confirmar redirecionamento de HTTP para HTTPS.
- Confirmar que portas 3001 e 3306 nao estao expostas no host.
- Verificar renovacao ou validade do certificado.
- Testar a aplicacao depois de reiniciar os containers.

## Ordem recomendada de implementacao

1. Alterar `api.js` para aceitar `VITE_API_URL` e usar `/api` em producao.
2. Criar configuracao de producao do Compose sem publicar backend e banco.
3. Ajustar Nginx para HTTP, HTTPS, proxy e cabecalhos.
4. Configurar certificado e dominio.
5. Verificar portas ocupadas e escolher o unico servico responsavel por 80/443.
6. Subir em homologacao e executar o checklist.
7. Fazer a troca definitiva e atualizar o QR Code para o endereco HTTPS.
8. Atualizar a documentacao e o relatorio QA com o resultado.

## Decisao pratica para este projeto

Para evitar conflito de portas, a configuracao recomendada e:

- Nginx: publica `80` e `443`.
- Frontend: somente `expose: 80` dentro do Docker.
- Backend: somente `expose: 3001` dentro do Docker.
- Banco: somente `expose: 3306` dentro do Docker.
- Frontend React: chama `/api`.
- Nginx: encaminha `/api` para `backend:3001`.
- QR Code: aponta para `https://dominio-do-boteco`.

Se a porta 80/443 ja tiver um Nginx ou IIS instalado, nao criar um segundo dono dessas portas: usar o servico existente como proxy de entrada ou escolher uma porta temporaria para homologacao.
