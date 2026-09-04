# 📋 ORDENAÇÃO MANUAL DE PRATOS E CATEGORIAS

---

## 📌 1. Visão Geral

A funcionalidade de **ordenação manual com persistência no MySQL** está 100% implementada no frontend e no backend.

O administrador do restaurante tem controle absoluto sobre:
1. **Ordem das Categorias / Seções:** Escolhe qual categoria aparece primeiro no cardápio (ex: *1/2 Refeição Completa* antes de *Petiscos*).
2. **Ordem dos Pratos dentro de cada Categoria:** Escolhe qual prato aparece no topo da sua seção (ex: colocar a *Maminha Argentina* em 1º lugar com destaque).

---

## ⚙️ 2. Como Funciona no Painel Admin (`/admin`)

### A. Reordenando Categorias (`📂 Categorias`):
- Acesse a aba **📂 Categorias**.
- Cada categoria exibe seu número de ordem atual (`1.`, `2.`, `3.`) e dois botões:
  - **▲ (Subir):** Move a categoria uma posição para cima.
  - **▼ (Descer):** Move a categoria uma posição para baixo.
- A tela atualiza instantaneamente (UI otimista) e dispara `PUT /categorias/reordenar`, salvando a nova sequência no MySQL.

### B. Reordenando Pratos (`📋 Pratos`):
- Acesse a aba **📋 Pratos**.
- Há um seletor dropdown no topo: **"📂 Todas as Categorias"** ou selecione uma categoria específica (ex: *1/2 Refeição Completa*).
- Em cada prato da lista, há os botões:
  - **▲ (Subir):** Move o prato para cima dentro da sua categoria.
  - **▼ (Descer):** Move o prato para baixo.
- O sistema dispara `PUT /pratos/reordenar`, atualizando a coluna `ordem_manual` no banco.

---

## 🖥️ 3. Como o Cardápio Público Reflete a Ordem

No cardápio do cliente ([`Home.jsx`](file:///C:/Users/vini/Documents/AP1_CARDAPIO/frontend/src/pages/Home.jsx)):
- As seções são geradas estritamente na ordem das categorias no banco (`ordem ASC`).
- Dentro de cada seção, os pratos são ordenados estritamente pela coluna `ordem_manual ASC`.
