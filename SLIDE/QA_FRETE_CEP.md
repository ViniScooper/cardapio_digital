# QA — Frete por CEP e raio de entrega

**Data:** 05/09/2026  
**Feature:** cálculo de frete no carrinho para pedidos delivery  
**Backend testado:** API local em `http://localhost:3001`  
**Frontend publicado:** `https://cardapiodigital-gamma.vercel.app`

## Resultado executivo

A regra de negócio do backend está definida assim:

- Bairro cadastrado: usa a taxa fixa da tabela.
- Distância calculada dentro do raio: usa `taxa_base + km adicional`.
- Distância acima do raio: retorna `atendido: false`.
- Bairro sem distância ou não cadastrado: usa a Taxa Padrão de Fallback.
- CEP inválido: a interface marca o CEP como não encontrado e permite cálculo manual pelo bairro.

**Ponto importante:** fora do raio, o botão de envio não fica visualmente desabilitado. O envio é interrompido no `submit` por alerta:

```text
Desculpe, o endereço informado está fora da nossa área de entrega.
```

Portanto, o sistema não deixa o pedido chegar ao WhatsApp, mas a interface poderia ser melhorada para desabilitar o botão antes do clique.

## Evidências reais dos quatro cenários

Os resultados abaixo foram obtidos com `POST /config/delivery/calcular` no backend local.

### QA-FRETE-01 — Bairro cadastrado

**Entrada:**

```json
{
  "bairro": "Aflitos",
  "cep": "52050-000"
}
```

**Resposta real:**

```json
{
  "atendido": true,
  "modo": "bairro_tabelado",
  "bairro": "Aflitos",
  "taxa": 8,
  "tempo_estimado": "35 a 50 min",
  "pedido_minimo": 0
}
```

**Resultado:** PASSOU. A taxa tabelada de Aflitos foi R$ 8,00.

### QA-FRETE-02 — Bairro não tabelado dentro do raio

**Entrada controlada:**

```json
{
  "bairro": "Espinheiro",
  "cep": "52020-000",
  "distancia_km": 5
}
```

**Resposta real:**

```json
{
  "atendido": true,
  "modo": "km",
  "distancia_km": 5,
  "taxa": 12,
  "tempo_estimado": "40 a 60 min",
  "bairro": "Espinheiro",
  "pedido_minimo": 0
}
```

**Resultado:** PASSOU. Com taxa base de R$ 6,00 e R$ 2,00 por km adicional depois de 2 km:

```text
R$ 6,00 + (5 - 2) x R$ 2,00 = R$ 12,00
```

### QA-FRETE-03 — Bairro fora do raio máximo

**Entrada:**

```json
{
  "bairro": "Jaboatão dos Guararapes",
  "cep": "54100-000",
  "distancia_km": 15
}
```

**Resposta real:**

```json
{
  "atendido": false,
  "motivo": "fora_raio",
  "distancia": 15,
  "mensagem": "O endereço está a ~15.0 km do Boteco. Nosso raio de entrega é de até 12 km."
}
```

**Resultado:** PASSOU na regra de negócio.

**Comportamento do carrinho:**

- O botão de WhatsApp não está desabilitado visualmente.
- Ao tentar enviar, `enviarPedidoWhatsApp` interrompe o fluxo.
- Um alerta informa que o endereço está fora da área.
- Nenhuma janela do WhatsApp deve ser aberta.

**Melhoria recomendada:** desabilitar o botão enquanto `tipoEntrega === "delivery" && freteInfo.calculado && !freteInfo.atendido`, além de exibir o motivo no próprio modal.

### QA-FRETE-04 — CEP inválido ou inexistente

**Entrada:**

```json
{
  "bairro": "Bairro Inexistente",
  "cep": "00000000"
}
```

**Resposta real da regra de fallback:**

```json
{
  "atendido": true,
  "modo": "taxa_padrao",
  "bairro": "Bairro Inexistente",
  "taxa": 8,
  "tempo_estimado": "40 a 60 min",
  "aviso": "Taxa Padrão de R$ 8,00 aplicada para o bairro Bairro Inexistente. O Boteco confirmará pelo WhatsApp.",
  "pedido_minimo": 0
}
```

**Resultado:** PASSOU na API. A taxa padrão de R$ 8,00 é aplicada sem travar o pedido.

**Observação da interface:** quando o ViaCEP retorna `erro: true`, o frontend exibe `CEP não encontrado. Selecione seu bairro abaixo para calcular o frete.` Nesse caminho, o cliente deve selecionar um bairro ou informar um bairro que acione o fallback.

## Testes adicionais recomendados para o QA

| ID | Cenário | Esperado |
|---|---|---|
| QA-FRETE-05 | Distância exatamente 12 km | Aceita, pois o bloqueio ocorre somente quando `dist > 12` |
| QA-FRETE-06 | Distância 12,1 km | Retorna fora do raio e bloqueia envio |
| QA-FRETE-07 | Distância 0,5 km | Cobra apenas taxa base, sem valor negativo |
| QA-FRETE-08 | Bairro com diferença de acento ou maiúsculas | Normalização encontra bairro cadastrado |
| QA-FRETE-09 | API fora do ar durante cálculo | Frontend aplica taxa padrão e mostra aviso |
| QA-FRETE-10 | Delivery desligado no admin | Retorna `atendido: false` com motivo `delivery_inativo` |
| QA-FRETE-11 | Pedido abaixo do mínimo | Deve impedir envio e informar valor mínimo |
| QA-FRETE-12 | Alterar taxa no admin | Próximo cálculo usa o valor novo sem deploy |
| QA-FRETE-13 | Mensagem WhatsApp com delivery | Inclui endereço, bairro, CEP, taxa e total com frete |

## Bloqueio encontrado no deploy

Na data do teste, a Vercel carregou o frontend, mas a URL de API configurada no bundle apontava para:

```text
https://peers-discussed-gadgets-metres.trycloudflare.com
```

Essa URL respondeu HTML do frontend para as rotas da API, em vez de JSON. Consequentemente, não foi possível validar o fluxo completo do carrinho no domínio publicado sem renovar/corrigir o túnel.

**Ação necessária antes do aceite do cliente:** configurar uma URL persistente de backend HTTPS no Vercel e repetir os cenários no carrinho publicado.

## Critérios de aceite

A feature só deve ser considerada aprovada quando:

- A taxa exibida no carrinho coincidir com a resposta da API.
- Bairro cadastrado usar a taxa fixa correta.
- Distância dentro do raio mostrar taxa e distância.
- Distância fora do raio deixar claro que o pedido não pode ser enviado.
- CEP inválido não quebrar a tela.
- Fallback mostrar aviso ao cliente.
- Botão de WhatsApp não abrir para endereço fora do raio.
- Mensagem enviada conter taxa e total corretos.
- O mesmo comportamento funcionar no celular.
