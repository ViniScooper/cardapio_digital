# 🎯 ENGENHARIA DE CARDÁPIO — BOTECO DO SIVIRINO
### Como o Cardápio Vende Sozinho e Aumenta o Lucro da Casa

---

## 📌 1. O que foi implementado?

O cardápio digital do **Boteco do Sivirino** deixou de ser apenas uma vitrine estática e passou a contar com o motor de **Engenharia de Cardápio (Kasavana & Smith)**.

Com todos os **134 pratos e preços oficiais cadastrados**, a plataforma agora aplica técnicas de **venda ativa e psicologia de consumo** diretamente no celular do cliente:

1. **Ordenação Estratégica ("Triângulo de Ouro"):**
   - Os pratos com maior margem de lucro e maior apelo aparecem no topo de cada categoria.
   - O cliente é direcionado naturalmente para os pratos que deixam mais dinheiro no caixa da casa (como as *Maminhas*, os *Arrumadinhos* e a *Pizza Nordestina*).

2. **Destaque Visual & Prova Social:**
   - Pratos classificados como **⭐ Estrela** ganham sutil **borda dourada** e o selo **🔥 Mais Pedido** (ou selos personalizados como **👨‍🍳 Recomendado do Chef** e **✨ Destaque da Casa**).
   - O cliente decide até **30% mais rápido** ao ver selos de confiança.

3. **Rastreamento Silencioso de Visualizações:**
   - Cada toque/clique em um prato no cardápio registra interesse na tabela `prato_metricas_diarias`, alimentando a popularidade do prato mesmo sem o restaurante precisar de um sistema de PDV integrado.

4. **Nova Aba "📊 Engenharia" no Painel Admin:**
   - Resumo em tempo real dos 4 quadrantes da matriz:
     - **⭐ Estrelas:** Alta Margem + Alta Procura (o coração do faturamento).
     - **🐄 Vacas Leiteiras:** Alta Procura + Margem Baixa (mantidos visíveis, vendem sozinhos).
     - **❓ Enigmas:** Alta Margem + Baixa Procura (oportunidade: basta colocar foto boa e selo para virar Estrela).
     - **🐌 Abacaxis:** Baixa Margem + Baixa Procura (avaliar ajuste de preço ou porção).
   - Tabela comparativa com cálculo automático de **Margem de Lucro (%)** por prato.

---

## 🛠️ 2. Como Usar no Dia a Dia

1. **Acesse o Painel:** `http://localhost:5173/admin` (ou pelo IP da sua rede).
2. **Abra a aba "📊 Engenharia"**: Você verá o panorama de todos os 134 itens, suas margens e quais já têm selo ativo.
3. **Para ajustar qualquer prato:**
   - Clique no botão **✏️ Ajustar** ao lado do prato.
   - O formulário abrirá com os novos campos:
     - **Custo de Produção (CMV R$):** Preencha quanto custa fazer aquele prato. O sistema calcula a margem na hora!
     - **Selo Promocional:** Digite qualquer texto (Ex: *🔥 Mais Pedido*, *🏆 Receita da Casa*, *✨ Novidade*).
     - **Classificação Estratégica:** Deixe em *Automático* ou force como *Estrela*, *Enigma*, etc.
4. **Salve:** O cardápio público atualiza instantaneamente para todos os celulares conectados ao QR Code!
