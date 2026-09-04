# Relatorio de QA — Boteco do Sivirino

**Data:** 03/09/2026  
**Ambiente:** implantacao publicada em `http://26.116.233.104:5173`  
**Escopo:** cardapio publico, autenticacao, painel administrativo, responsividade e build do frontend.

**Limite da rodada:** nao foram executadas operacoes destrutivas ou cadastro de dados no ambiente publicado, para preservar os registros reais do estabelecimento.

## Resumo executivo

A aplicacao esta funcional para o fluxo principal. Foram confirmados o carregamento de 134 pratos no cardapio, o bloqueio da rota administrativa sem sessao, o login de administrador, o logout e a navegacao pelas seis areas do painel. O build de producao do frontend tambem foi concluido com sucesso.

Nao foi encontrado bloqueio critico durante esta rodada. Existem melhorias recomendadas de carregamento, seguranca, configuracao de ambiente e cobertura automatizada.

## Casos testados

| ID | Cenario | Resultado | Evidencia |
|---|---|---|---|
| QA-01 | Abrir o cardapio publico | PASSOU | Pagina abriu com titulo, marca, categorias e 134 itens |
| QA-02 | Carregar dados do cardapio | PASSOU | 134 elementos de prato foram identificados apos o carregamento |
| QA-03 | Acessar `/admin` sem sessao | PASSOU | Redirecionamento automatico para `/login` |
| QA-04 | Login com credencial invalida | PASSOU | Mensagem de erro exibida e permanencia no login |
| QA-05 | Login administrativo valido | PASSOU | Painel abriu em `/admin` com usuario administrador |
| QA-06 | Conferir indicadores do painel | PASSOU | 134 pratos, 9 categorias, 5 Happy Hours |
| QA-07 | Navegar nas abas administrativas | PASSOU | Pratos, Engenharia, Selos, Categorias, Happy Hour e QR Code abriram |
| QA-08 | Logout | PASSOU | Retorno ao cardapio e remocao de token e usuario do armazenamento local |
| QA-09 | Cardapio em viewport de 390 px | PASSOU | 134 itens presentes e sem overflow horizontal relevante |
| QA-10 | Painel em viewport de 390 px | PASSOU | Painel abriu, manteve indicadores e sem overflow horizontal relevante |
| QA-11 | Build de producao | PASSOU | `npm run build` concluiu com 95 modulos transformados |
| QA-12 | Apresentacao local | PASSOU | 7 slides e 7 imagens carregadas no HTML do pitch |
| QA-13 | Upload e carregamento de imagem no deploy Vercel | PASSOU | Upload temporario foi aceito, imagem apareceu no admin e as imagens existentes carregaram no cardapio |
| QA-14 | Reordenacao de categorias no deploy | PASSOU | `PUT /categorias/reordenar` respondeu 200, a ordem persistiu e foi restaurada |
| QA-15 | Carrinho e validacao do pedido | PASSOU | Prato foi adicionado, modal abriu e campos obrigatorios impediram envio incompleto |
| QA-16 | Happy Hour, QR Code e Avaliacoes | PASSOU | Configuracao abriu, QR Code apontou para a Vercel e link do Google foi encontrado |

## Achados e riscos

### QA-F01 — Estado inicial exibe indicadores zerados durante o carregamento

**Prioridade:** Media  
**Tipo:** UX / possivel bug de estado  
**Status:** Reproduzido uma vez, depois corrigido pelo carregamento dos dados.

Na primeira abertura do painel, os indicadores apareceram como zero antes da resposta dos dados. Depois de aproximadamente 2 a 3 segundos, os valores foram atualizados para 134 pratos, 9 categorias e 5 Happy Hours.

**Impacto:** o administrador pode interpretar temporariamente que os dados foram apagados ou que o banco esta vazio.

**Melhoria sugerida:** exibir estado de carregamento nos indicadores e nas listas; so mostrar zero quando a requisicao tiver terminado com sucesso e realmente retornar zero registros.

### QA-F02 — Avisos de atualizacao futura do React Router

**Prioridade:** Baixa  
**Tipo:** manutencao tecnica  
**Status:** Observado no console.

O console exibiu avisos sobre `v7_startTransition` e `v7_relativeSplatPath`. Nao houve quebra funcional nesta rodada.

**Melhoria sugerida:** avaliar a configuracao das future flags do React Router ou planejar a atualizacao da biblioteca, validando o comportamento das rotas depois da mudanca.

### QA-F03 — API montada com HTTP e hostname fixo por porta

**Prioridade:** Alta em producao com HTTPS  
**Tipo:** configuracao / seguranca  
**Status:** Risco identificado na implementacao.

O frontend monta a API como `http://<hostname>:3001`. Se o frontend for publicado com HTTPS, o navegador pode bloquear as requisicoes por mixed content. A API tambem depende de uma porta publica separada.

**Melhoria sugerida:** usar variavel de ambiente para a URL da API e, em producao, publicar frontend e API sob HTTPS, preferencialmente atras de um proxy reverso.

### QA-F04 — Token JWT armazenado em localStorage

**Prioridade:** Alta para ambiente exposto  
**Tipo:** seguranca  
**Status:** Risco identificado na implementacao.

O token e salvo em `localStorage`. Isso facilita a persistencia do login, mas aumenta o impacto de um eventual XSS, pois o token pode ser lido por JavaScript executado na pagina.

**Melhoria sugerida:** considerar cookie `HttpOnly`, `Secure` e `SameSite`, com protecao CSRF adequada. Tambem definir expiracao, revogacao e politica de renovacao do token.

### QA-F05 — Ausencia de testes automatizados no projeto

**Prioridade:** Media  
**Tipo:** qualidade / regressao  
**Status:** Lacuna identificada.

Os `package.json` nao possuem script de teste. A validacao atual foi manual e por smoke test no navegador.

**Melhoria sugerida:** adicionar testes de API para login e CRUD, testes de componentes para login e painel, e pelo menos um fluxo E2E para login, cadastro e logout.

### QA-F06 — Imagens do backend nao renderizam no deploy da Vercel

**Prioridade:** Alta  
**Tipo:** bug funcional / deploy  
**Status:** Resolvido no estado atual do deploy; manter monitoramento.

Em uma rodada anterior, o login administrativo funcionou e o upload de uma imagem PNG foi aceito, mas as imagens apontaram para o tunel com barra duplicada e o navegador registrou `ERR_BLOCKED_BY_ORB`. No teste de 04/09/2026, o upload temporario foi aceito, as imagens do cardapio carregaram com `naturalWidth > 0` e a URL passou a aparecer sem a barra duplicada.

**Impacto anterior:** o cliente nao visualizava as fotos dos pratos no deploy da Vercel, embora o arquivo fosse gravado no backend.

**Causa provavel anterior:** a aplicacao usava um backend temporario por Cloudflare Tunnel e construia URLs de upload com barra duplicada (`//uploads`).

**Melhoria sugerida:** manter a normalizacao das URLs, testar `/uploads/arquivo` com resposta `200` e `Content-Type: image/*`, e preferir servir frontend, API e uploads sob o mesmo dominio HTTPS por Nginx. Para producao, migrar uploads para armazenamento persistente, como volume da VPS ou Supabase Storage; nao depender do filesystem efemero da Vercel.

## Melhorias de produto recomendadas

- Adicionar indicador visual de carregamento e estado de erro quando a API estiver indisponivel.
- Mostrar uma confirmacao antes de excluir pratos, categorias ou configuracoes.
- Melhorar busca e filtros no painel quando o numero de pratos crescer.
- Validar limites e formato de preco e custo antes do envio.
- Adicionar mensagens de sucesso ou erro persistentes apos operacoes de cadastro e edicao.
- Testar impressao do QR Code em papel e em diferentes tamanhos de tela.
- Verificar acessibilidade com foco de teclado, contraste, labels e leitor de tela.
- Adicionar monitoramento de erros e health check do backend.

## Evidencias disponiveis

As capturas funcionais usadas na apresentacao estao na mesma pasta:

- `01-cardapio-publico.png`
- `02-painel-admin.png`
- `03-engenharia-cardapio.png`
- `04-selos-flags.png`
- `05-categorias.png`
- `06-happy-hour.png`
- `07-qr-code.png`
- `08-login-admin.png`

## Conclusao

O fluxo essencial esta aprovado para demonstracao: cliente acessa o cardapio, administrador autentica, consulta e navega pelo painel, e o sistema oferece QR Code para distribuicao. Antes de um uso comercial mais amplo, as prioridades sao corrigir o estado visual de carregamento, proteger a comunicacao da API com HTTPS e revisar o armazenamento do token.
