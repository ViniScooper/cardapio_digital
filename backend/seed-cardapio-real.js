// ============================================================
// seed-cardapio-real.js — Popula o cardápio oficial do Boteco do Sivirino
// ============================================================

const mysql = require("mysql2");

const db = mysql.createConnection({
    host:     process.env.DB_HOST     || "localhost",
    user:     process.env.DB_USER     || "root",
    password: process.env.DB_PASSWORD || "viniZIKA3103",
    database: process.env.DB_NAME     || "restaurante",
    port:     Number(process.env.DB_PORT) || 3306
});

db.connect(async (err) => {
    if (err) {
        console.error("❌ Erro ao conectar no MySQL:", err.message);
        process.exit(1);
    }
    console.log("✅ Conectado ao MySQL! Iniciando importação do cardápio completo...\n");

    const query = (sql, params = []) =>
        new Promise((res, rej) => db.query(sql, params, (e, r) => e ? rej(e) : res(r)));

    try {
        // 1. Limpa pratos e categorias antigas
        await query("DELETE FROM prato");
        await query("DELETE FROM categoria");
        console.log("🧹 Pratos e categorias anteriores limpos.");

        // 2. Cria as categorias na ordem correta
        const categorias = [
            { nome: "1/2 Refeição Completa", icone: "🍲", ordem: 1 },
            { nome: "1/2 Refeição Simples",  icone: "🥘", ordem: 2 },
            { nome: "Refeição Completa",     icone: "🍽️", ordem: 3 },
            { nome: "Refeição Simples",      icone: "🥩", ordem: 4 },
            { nome: "Petiscos",              icone: "🍟", ordem: 5 },
            { nome: "Pizzas Grandes",        icone: "🍕", ordem: 6 },
            { nome: "Bebidas & Cervejas",    icone: "🍺", ordem: 7 },
            { nome: "Destilados & Drinks",   icone: "🍹", ordem: 8 },
            { nome: "Sobremesas",            icone: "🍰", ordem: 9 }
        ];

        for (const cat of categorias) {
            await query("INSERT INTO categoria (nome, icone, ordem) VALUES (?, ?, ?)", [cat.nome, cat.icone, cat.ordem]);
        }
        console.log("✅ Categorias oficiais cadastradas!\n");

        // 3. Lista completa de pratos
        const pratos = [
            // ── 1. 1/2 REFEIÇÃO COMPLETA ──
            { nome: "1/2 Maminha Argentina Completa", descricao: "Feijão macassar, arroz, batata frita, farofa e vinagrete", preco: 81.00, categoria: "1/2 Refeição Completa", happy_hour: 0, imagem: null },
            { nome: "1/2 Carne de Sol Completa", descricao: "Feijão macassar, arroz, batata frita, farofa, vinagrete e queijo coalho", preco: 79.00, categoria: "1/2 Refeição Completa", happy_hour: 0, imagem: null },
            { nome: "1/2 Galinha Cabidela Completa", descricao: "Feijão macassar, arroz, farofa e vinagrete", preco: 51.00, categoria: "1/2 Refeição Completa", happy_hour: 0, imagem: null },
            { nome: "1/2 Galinha Guisada Completa", descricao: "Feijão macassar, arroz, farofa e vinagrete", preco: 51.00, categoria: "1/2 Refeição Completa", happy_hour: 0, imagem: null },
            { nome: "1/2 Bode Guisado Completo", descricao: "Pirão ou feijão macassar, arroz, farofa e vinagrete", preco: 68.00, categoria: "1/2 Refeição Completa", happy_hour: 0, imagem: null },
            { nome: "1/2 Rabada Completa", descricao: "Pirão, arroz e vinagrete", preco: 59.00, categoria: "1/2 Refeição Completa", happy_hour: 0, imagem: null },
            { nome: "1/2 Feijoada Completa", descricao: "Arroz e farinha", preco: 58.00, categoria: "1/2 Refeição Completa", happy_hour: 0, imagem: null },
            { nome: "1/2 Dobradinha Completa", descricao: "Arroz e farinha", preco: 50.00, categoria: "1/2 Refeição Completa", happy_hour: 0, imagem: null },

            // ── 2. 1/2 REFEIÇÃO SIMPLES ──
            { nome: "1/2 Maminha Argentina Simples", descricao: "Batata frita ou macaxeira, farofa e vinagrete", preco: 69.00, categoria: "1/2 Refeição Simples", happy_hour: 0, imagem: null },
            { nome: "1/2 Carne de Sol Simples", descricao: "Batata frita ou macaxeira, queijo coalho, farofa e vinagrete", preco: 67.00, categoria: "1/2 Refeição Simples", happy_hour: 0, imagem: null },
            { nome: "1/2 Galinha Cabidela Simples", descricao: "Farofa e vinagrete", preco: 42.00, categoria: "1/2 Refeição Simples", happy_hour: 0, imagem: null },
            { nome: "1/2 Galinha Guisada Simples", descricao: "Farofa e vinagrete", preco: 42.00, categoria: "1/2 Refeição Simples", happy_hour: 0, imagem: null },
            { nome: "1/2 Bode Guisado Simples", descricao: "Farofa e vinagrete", preco: 61.00, categoria: "1/2 Refeição Simples", happy_hour: 0, imagem: null },
            { nome: "1/2 Rabada Simples", descricao: "Pirão, farofa e vinagrete", preco: 55.00, categoria: "1/2 Refeição Simples", happy_hour: 0, imagem: null },
            { nome: "1/2 Feijoada Simples", descricao: "Farinha", preco: 53.00, categoria: "1/2 Refeição Simples", happy_hour: 0, imagem: null },
            { nome: "1/2 Dobradinha Simples", descricao: "Farinha", preco: 43.00, categoria: "1/2 Refeição Simples", happy_hour: 0, imagem: null },

            // ── 3. REFEIÇÃO COMPLETA (INTEIRA) ──
            { nome: "Arrumadinho de Carne de Sol Completo", descricao: "Feijão macassar, farofa, vinagrete e arroz", preco: 85.00, categoria: "Refeição Completa", happy_hour: 0, imagem: null },
            { nome: "Arrumadinho de Charque Completo", descricao: "Feijão macassar, farofa, vinagrete e arroz", preco: 89.00, categoria: "Refeição Completa", happy_hour: 0, imagem: null },
            { nome: "Maminha Argentina Completa", descricao: "Feijão macassar, farofa, vinagrete, arroz e batata frita", preco: 129.00, categoria: "Refeição Completa", happy_hour: 0, imagem: null },
            { nome: "Carne de Sol Bovina Completa", descricao: "Feijão macassar, farofa, vinagrete, arroz, batata frita e queijo coalho", preco: 119.00, categoria: "Refeição Completa", happy_hour: 0, imagem: null },
            { nome: "Galinha Cabidela Completa", descricao: "Feijão macassar, arroz, farofa e vinagrete", preco: 68.00, categoria: "Refeição Completa", happy_hour: 0, imagem: null },
            { nome: "Galinha Guisada Completa", descricao: "Feijão macassar, arroz, farofa e vinagrete", preco: 68.00, categoria: "Refeição Completa", happy_hour: 0, imagem: null },
            { nome: "Rabada Completa", descricao: "Pirão, arroz e vinagrete", preco: 89.00, categoria: "Refeição Completa", happy_hour: 0, imagem: null },
            { nome: "Bode Guisado Completo", descricao: "Pirão ou feijão macassar, arroz, farofa e vinagrete", preco: 97.00, categoria: "Refeição Completa", happy_hour: 0, imagem: null },
            { nome: "Chambaril Completo", descricao: "Pirão, arroz e vinagrete", preco: 95.00, categoria: "Refeição Completa", happy_hour: 0, imagem: null },
            { nome: "Feijoada Completa", descricao: "Arroz e farinha", preco: 78.00, categoria: "Refeição Completa", happy_hour: 0, imagem: null },
            { nome: "Dobradinha Completa", descricao: "Arroz e farinha", preco: 70.00, categoria: "Refeição Completa", happy_hour: 0, imagem: null },

            // ── 4. REFEIÇÃO SIMPLES (INTEIRA) ──
            { nome: "Arrumadinho de Carne de Sol Simples", descricao: "Feijão macassar, farofa e vinagrete", preco: 82.00, categoria: "Refeição Simples", happy_hour: 0, imagem: null },
            { nome: "Arrumadinho de Charque Simples", descricao: "Feijão macassar, farofa e vinagrete", preco: 79.00, categoria: "Refeição Simples", happy_hour: 0, imagem: null },
            { nome: "Maminha Argentina Simples", descricao: "Batata frita ou macaxeira, farofa e vinagrete", preco: 112.00, categoria: "Refeição Simples", happy_hour: 0, imagem: null },
            { nome: "Carne de Sol Bovina Simples", descricao: "Batata frita ou macaxeira, queijo coalho, farofa e vinagrete", preco: 98.00, categoria: "Refeição Simples", happy_hour: 0, imagem: null },
            { nome: "Galinha Cabidela Simples", descricao: "Farofa e vinagrete", preco: 56.00, categoria: "Refeição Simples", happy_hour: 0, imagem: null },
            { nome: "Galinha Guisada Simples", descricao: "Farofa e vinagrete", preco: 56.00, categoria: "Refeição Simples", happy_hour: 0, imagem: null },
            { nome: "Rabada Simples", descricao: "Pirão e vinagrete", preco: 79.00, categoria: "Refeição Simples", happy_hour: 0, imagem: null },
            { nome: "Bode Guisado Simples", descricao: "Farofa e vinagrete", preco: 89.00, categoria: "Refeição Simples", happy_hour: 0, imagem: null },
            { nome: "Chambaril Simples", descricao: "Pirão e vinagrete", preco: 75.00, categoria: "Refeição Simples", happy_hour: 0, imagem: null },
            { nome: "Feijoada Simples", descricao: "Farinha", preco: 72.00, categoria: "Refeição Simples", happy_hour: 0, imagem: null },
            { nome: "Dobradinha Simples", descricao: "Farinha", preco: 62.00, categoria: "Refeição Simples", happy_hour: 0, imagem: null },

            // ── 5. PETISCOS ──
            { nome: "Codorna", descricao: "Porção de codorna frita temperada", preco: 12.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Maminha com Fritas", descricao: "Tiras suculentas de maminha com batata frita", preco: 69.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Panceta de Porco", descricao: "Panceta crocante e dourada", preco: 29.00, categoria: "Petiscos", happy_hour: 0, imagem: "/uploads/torresmo.png" },
            { nome: "Cupim com Fritas", descricao: "Cupim desfiando acompanhado de batatas fritas", preco: 50.00, categoria: "Petiscos", happy_hour: 0, imagem: "/uploads/carne-desfiada.png" },
            { nome: "Calabresa com Fritas", descricao: "Calabresa acebolada com batata frita", preco: 31.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Carne de Sol com Fritas", descricao: "Carne de sol na manteiga de garrafa com fritas", preco: 49.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Sarapatel", descricao: "Tradicional sarapatel da casa bem temperado", preco: 36.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Frango a Passarinha", descricao: "Frango crocante com alho e cheiro verde", preco: 32.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Miúdo de Galinha", descricao: "Porção tradicional de miúdos bem temperados", preco: 35.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Gurjão de Frango", descricao: "Tiras de frango empanadas com molho especial", preco: 39.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Tripa de Porco", descricao: "Tripa de porco frita sequinha e crocante", preco: 30.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Caranguejo Água e Sal (unidade)", descricao: "Caranguejo fresco preparado na água e sal", preco: 5.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Camarão ao Alho e Óleo (300g)", descricao: "Camarões selecionados dourados no alho e azeite", preco: 45.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Batata Frita (250g)", descricao: "Batata frita crocante", preco: 16.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Queijo Assado", descricao: "Queijo coalho assado na brasa", preco: 21.00, categoria: "Petiscos", happy_hour: 0, imagem: null },

            // Salgados & Pastéis
            { nome: "Pastel Crocante (04 unid.)", descricao: "Pasteis fritos na hora com recheio especial", preco: 17.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Pastel de Camarão (04 unid.)", descricao: "Pastéis crocantes recheados com camarão", preco: 15.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Croquete de Cupim (04 unid.)", descricao: "Croquetes artesanais de cupim desfiado", preco: 15.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Mini Coxinha (06 unid.)", descricao: "Mini coxinhas de frango sequinhas", preco: 11.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Croquete do Biu (04 unid.)", descricao: "Receita exclusiva e premiada da casa", preco: 16.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Bolinho de Jerimum com Charque (04 unid.)", descricao: "Massa suave de abóbora com recheio de charque", preco: 20.00, categoria: "Petiscos", happy_hour: 0, imagem: null },

            // Pães de Alho & Espetinhos
            { nome: "Pão de Alho Tradicional", descricao: "Crocante e bem recheado", preco: 8.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Pão de Alho com Bacon", descricao: "Recheado com queijo, alho e pedaços de bacon", preco: 10.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Pão de Alho Camarão", descricao: "Recheio cremoso com camarão", preco: 18.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Espetinho de Frango", descricao: "Espetinho suculento na brasa", preco: 10.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Espetinho de Carne", descricao: "Carne bovina selecionada grelhada", preco: 12.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Espetinho Frango com Bacon", descricao: "Cubos de frango envolvidos em tiras de bacon", preco: 14.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Espetinho Carne de Sol com Queijo", descricao: "Carne de sol acompanhada de queijo coalho", preco: 14.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Espetinho Carne com Bacon", descricao: "Carne bovina com fatias de bacon grelhado", preco: 14.00, categoria: "Petiscos", happy_hour: 0, imagem: null },

            // Caldinhos
            { nome: "Caldão de Feijão", descricao: "Acompanha torresminho, milho e cheiro verde", preco: 10.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Caldão de Dobradinha", descricao: "Caldinho quente tradicional e temperado", preco: 10.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Caldão de Feijoada", descricao: "Caldinho encorpado de feijoada", preco: 10.00, categoria: "Petiscos", happy_hour: 0, imagem: null },
            { nome: "Caldão de Marisco", descricao: "Caldinho especial de marisco da casa", preco: 12.00, categoria: "Petiscos", happy_hour: 0, imagem: null },

            // ── 6. PIZZAS (TAMANHO GRANDE) ──
            { nome: "Pizza Calabresa", descricao: "Molho de tomate, calabresa, queijo mussarela, cebola, orégano e azeitona", preco: 49.00, categoria: "Pizzas Grandes", happy_hour: 0, imagem: null },
            { nome: "Pizza Marguerita", descricao: "Molho de tomate, queijo mussarela, tomate, manjericão, orégano e azeitona", preco: 48.00, categoria: "Pizzas Grandes", happy_hour: 0, imagem: null },
            { nome: "Pizza Mussarela", descricao: "Molho de tomate, queijo mussarela, orégano e azeitona", preco: 48.00, categoria: "Pizzas Grandes", happy_hour: 0, imagem: null },
            { nome: "Pizza Nordestina", descricao: "Molho de tomate, charque desfiada, requeijão cremoso, queijo mussarela, cebola, orégano e azeitona", preco: 55.00, categoria: "Pizzas Grandes", happy_hour: 0, imagem: null },
            { nome: "Pizza Portuguesa", descricao: "Molho de tomate, presunto, ovo, milho verde, pimentão, queijo mussarela, cebola, orégano e azeitona", preco: 55.00, categoria: "Pizzas Grandes", happy_hour: 0, imagem: null },
            { nome: "Pizza de Frango", descricao: "Molho de tomate, frango desfiado, queijo mussarela, cebola, orégano e azeitona", preco: 49.00, categoria: "Pizzas Grandes", happy_hour: 0, imagem: null },
            { nome: "Pizza Frango com Catupiry", descricao: "Molho de tomate, frango desfiado, queijo mussarela, requeijão cremoso, cebola, orégano e azeitona", preco: 55.00, categoria: "Pizzas Grandes", happy_hour: 0, imagem: null },
            { nome: "Pizza Frango com Bacon", descricao: "Molho de tomate, frango desfiado, bacon em cubos, queijo mussarela, cebola, orégano e azeitona", preco: 49.00, categoria: "Pizzas Grandes", happy_hour: 0, imagem: null },
            { nome: "Pizza Quatro Queijos", descricao: "Molho de tomate, provolone, ricota, requeijão cremoso, queijo mussarela, orégano e azeitona", preco: 55.00, categoria: "Pizzas Grandes", happy_hour: 0, imagem: null },
            { nome: "Pizza Caipira", descricao: "Molho de tomate, carne de sol, requeijão cremoso, queijo mussarela, cebola, orégano e azeitona", preco: 55.00, categoria: "Pizzas Grandes", happy_hour: 0, imagem: null },
            { nome: "Pizza Napolitano", descricao: "Molho de tomate, queijo mussarela, tomate, orégano e azeitona", preco: 48.00, categoria: "Pizzas Grandes", happy_hour: 0, imagem: null },

            // ── 7. BEBIDAS & CERVEJAS ──
            { nome: "Heineken Zero Long Neck", descricao: "330ml geladíssima (sem álcool)", preco: 12.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },
            { nome: "Heineken Long Neck", descricao: "330ml geladíssima", preco: 12.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },
            { nome: "Heineken 600ml", descricao: "Garrafa 600ml servida no balde de gelo", preco: 18.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },
            { nome: "Devassa 600ml", descricao: "Garrafa 600ml puro malte gelada", preco: 12.00, categoria: "Bebidas & Cervejas", happy_hour: 1, imagem: null },
            { nome: "Brahma 600ml", descricao: "Garrafa 600ml tradicional trincando", preco: 13.00, categoria: "Bebidas & Cervejas", happy_hour: 1, imagem: null },
            { nome: "Budweiser 600ml", descricao: "Garrafa 600ml", preco: 14.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },
            { nome: "Spaten 600ml", descricao: "Garrafa 600ml puro malte alemã", preco: 16.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },
            { nome: "Stella Artois 600ml", descricao: "Garrafa 600ml gelada", preco: 17.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },

            // Não Alcoólicas & Sucos
            { nome: "Água Mineral", descricao: "500ml sem gás", preco: 3.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },
            { nome: "Água Mineral c/ Gás", descricao: "500ml com gás", preco: 5.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },
            { nome: "Coca-Cola 1L", descricao: "Garrafa PET 1 Litro", preco: 9.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },
            { nome: "Refrigerante PET 1L", descricao: "Guaraná / Fanta 1 Litro", preco: 14.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },
            { nome: "Refrigerante Lata", descricao: "Lata 350ml (Coca, Guaraná, Fanta)", preco: 7.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },
            { nome: "Água de Coco (Copo)", descricao: "Copo 300ml gelado e natural", preco: 6.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },
            { nome: "Água de Coco (Jarra)", descricao: "Jarra natural 700ml", preco: 13.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },
            { nome: "Café Expresso", descricao: "Café expresso tirado na hora", preco: 6.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },
            { nome: "H2OH!", descricao: "Garrafa 500ml limão", preco: 8.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },
            { nome: "Red Bull", descricao: "Lata 250ml energético", preco: 15.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },
            { nome: "Suco de Limão (Copo)", descricao: "Copo 300ml natural", preco: 8.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },
            { nome: "Suco de Limão (Jarra 700ml)", descricao: "Jarra 700ml natural da fruta", preco: 14.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },
            { nome: "Suco de Laranja (Copo)", descricao: "Copo 300ml natural da fruta", preco: 8.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },
            { nome: "Suco de Laranja (Jarra 700ml)", descricao: "Jarra 700ml natural da fruta", preco: 14.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },
            { nome: "Suco de Polpa (Copo)", descricao: "Sabores: Graviola, Maracujá, Acerola, Manga, Caju", preco: 7.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },
            { nome: "Suco de Polpa (Jarra 700ml)", descricao: "Jarra 700ml sabor à escolha", preco: 14.00, categoria: "Bebidas & Cervejas", happy_hour: 0, imagem: null },

            // ── 8. DESTILADOS, APERITIVOS & DRINKS ──
            { nome: "Dose Johnnie Walker Red Label", descricao: "Dose de whisky escocês", preco: 9.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Dose White Horse", descricao: "Dose de whisky escocês", preco: 8.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Dose Black & White", descricao: "Dose de whisky escocês", preco: 7.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Garrafa Johnnie Red Label (1L)", descricao: "Garrafa 1 Litro com gelo e energético à parte", preco: 145.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Garrafa White Horse (1L)", descricao: "Garrafa 1 Litro", preco: 125.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Garrafa Black & White (1L)", descricao: "Garrafa 1 Litro", preco: 100.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Dose Smirnoff", descricao: "Dose de vodka", preco: 7.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Dose Orloff", descricao: "Dose de vodka nacional", preco: 6.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Garrafa Smirnoff (1L)", descricao: "Garrafa 1 Litro", preco: 68.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Garrafa Orloff (1L)", descricao: "Garrafa 1 Litro", preco: 58.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Dose Bacardi Carta Branca", descricao: "Dose de rum caribenho", preco: 6.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Dose Bacardi Limão", descricao: "Dose saborizada de rum", preco: 8.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Dose Montilla Carta Branca", descricao: "Dose de rum nacional", preco: 5.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Dose Montilla Cristal", descricao: "Dose de rum", preco: 6.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Garrafa Bacardi Carta Branca (1L)", descricao: "Garrafa 1 Litro", preco: 75.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Garrafa Bacardi Limão (1L)", descricao: "Garrafa 1 Litro", preco: 50.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },

            // Cachaças & Aperitivos
            { nome: "Dose Pitú Tradicional", descricao: "A autêntica cachaça pernambucana", preco: 4.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Dose Pitú Gold", descricao: "Cachaça envelhecida premium", preco: 7.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Dose Seleta", descricao: "Cachaça artesanal de Salinas", preco: 8.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Dose Campari", descricao: "Aperitivo amargo clássico com gelo e laranja", preco: 6.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Dose Conhaque Domecq", descricao: "Dose tradicional", preco: 5.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Dose Alcatrão da Barra", descricao: "Bebida mista tradicional", preco: 4.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },
            { nome: "Dose Gin Nacional", descricao: "Dose de gin nacional", preco: 9.00, categoria: "Destilados & Drinks", happy_hour: 0, imagem: null },

            // Drinks
            { nome: "Caipirinha Tradicional", descricao: "Cachaça artesanal, limão fresco e açúcar", preco: 9.00, categoria: "Destilados & Drinks", happy_hour: 1, imagem: null },
            { nome: "Caipirosca", descricao: "Vodka Smirnoff com limão ou morango", preco: 17.00, categoria: "Destilados & Drinks", happy_hour: 1, imagem: null },
            { nome: "Caipifruta Especial", descricao: "Vodka com frutas selecionadas (maracujá, abacaxi, kiwi ou morango)", preco: 19.00, categoria: "Destilados & Drinks", happy_hour: 1, imagem: null },

            // ── 9. SOBREMESAS ──
            { nome: "Pudim de Leite Condensado", descricao: "Fatia cremosa com calda de caramelo artesanal", preco: 8.00, categoria: "Sobremesas", happy_hour: 0, imagem: null },
            { nome: "Banoffee da Casa", descricao: "Torta artesanal de banana com doce de leite e chantilly", preco: 8.00, categoria: "Sobremesas", happy_hour: 0, imagem: null }
        ];

        console.log(`📦 Inserindo ${pratos.length} pratos reais no banco de dados...\n`);

        for (const p of pratos) {
            await query(
                "INSERT INTO prato (nome, descricao, preco, categoria, happy_hour, imagem) VALUES (?, ?, ?, ?, ?, ?)",
                [p.nome, p.descricao, p.preco, p.categoria, p.happy_hour, p.imagem]
            );
        }

        console.log(`🎉 Sucesso absoluto! ${pratos.length} itens do cliente cadastrados no Boteco do Sivirino!`);
    } catch (e) {
        console.error("❌ Erro ao cadastrar:", e);
    } finally {
        db.end();
    }
});
