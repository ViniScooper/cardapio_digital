# 🛒 SISTEMA DE PEDIDOS VIA WHATSAPP — BOTECO DO SIVIRINO

---

## 📌 1. Visão Geral

Implementado o sistema de **carrinho dinâmico e fechamento de pedidos direto para o WhatsApp** oficial do Boteco do Sivirino `(81) 98271-4421`.

Elimina qualquer taxa de intermediação de cartão/gateway e centraliza o atendimento no canal que o cliente e o restaurante mais utilizam.

---

## 🚀 2. Como Funciona para o Cliente

1. **Adicionar Itens:**
   - Em cada prato do cardápio há o botão **`+ Pedir`**.
   - Ao clicar, o item entra no carrinho e o botão passa a mostrar a quantidade atual (ex: `(2)`).
2. **Barra Flutuante do Pedido:**
   - Surge no canto inferior direito um botão flutuante verde com contador de itens, valor total somado e ícone do WhatsApp:
     > `[ 3 ] Ver Pedido  R$ 115,00  💬`
3. **Modal de Fechamento:**
   - O cliente pode ajustar quantidades com botões `+` e `-`.
   - Escolhe se o consumo é **🍻 No Salão / Mesa** ou **🛵 Delivery / Entrega**.
   - Digita o **Nome**, **Nº da Mesa** (ou **Endereço**), **Forma de Pagamento** (Cartão, Pix, Dinheiro) e **Observações** (ex: *sem cebola*, *gelo e limão*).
4. **Disparo para o WhatsApp:**
   - Ao clicar em **"Enviar Pedido para WhatsApp"**, o sistema abre a conversa com a mensagem já pré-digitada e formatada:

```text
🍻 *NOVO PEDIDO — BOTECO DO SIVIRINO*
----------------------------------------
👤 *Cliente:* Lucas Mendes
📍 *Mesa no Salão:* Mesa 05
💳 *Forma de Pagamento:* PIX
📝 *Observação:* O Bode bem passado, por favor!
----------------------------------------
📋 *ITENS DO PEDIDO:*
• 1x Bode Guisado Completo — R$ 68,00
• 2x Heineken 600ml — R$ 34,00
----------------------------------------
💰 *VALOR TOTAL:* R$ 102,00
----------------------------------------
_Pedido gerado automaticamente pelo cardápio digital._
```
