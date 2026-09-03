// ============================================================
// seed.js — Script de seed: cria colunas e cadastra 20 pratos
// Rode com: node seed.js
// ============================================================

const mysql = require("mysql2");

const db = mysql.createConnection({
    host:     "localhost",
    user:     "root",
    password: "viniZIKA3103",
    database: "restaurante"
});

db.connect((err) => {
    if (err) { console.error("Erro:", err.message); process.exit(1); }
    console.log("✅ Conectado! Iniciando seed...\n");
    rodar();
});

async function rodar() {
    const query = (sql, params = []) =>
        new Promise((res, rej) =>
            db.query(sql, params, (e, r) => e ? rej(e) : res(r))
        );

    // 1. Adiciona colunas (ignora erro se já existir)
    console.log("🔧 Adicionando colunas...");
    const alterações = [
        "ALTER TABLE prato ADD COLUMN categoria VARCHAR(50) DEFAULT 'Cardápio'",
        "ALTER TABLE prato ADD COLUMN happy_hour TINYINT(1) DEFAULT 0",
        "ALTER TABLE prato ADD COLUMN imagem VARCHAR(255) DEFAULT NULL",
    ];
    for (const sql of alterações) {
        try { await query(sql); } catch (e) { console.log(`   ⚠️  Coluna já existe (OK): ${e.sqlMessage}`); }
    }
    console.log("✅ Colunas OK\n");

    // 2. Limpa pratos antigos (opcional)
    await query("DELETE FROM prato");
    console.log("🗑️  Pratos antigos removidos\n");

    // 3. Cadastra 20 pratos
    const pratos = [
        // ── ALMOÇO ─────────────────────────────────────────
        { nome: "Cozido de Carne na Panela",    descricao: "Carne bovina cozida no molho especial da casa, arroz e feijão",  preco: 38.90, categoria: "Almoço",    happy_hour: 0, imagem: "/uploads/cozido.png" },
        { nome: "Carne Desfiada com Fritas",     descricao: "Carne desfiada ao molho com batata frita crocante",              preco: 34.90, categoria: "Almoço",    happy_hour: 0, imagem: "/uploads/carne-desfiada.png" },
        { nome: "Frango Assado Completo",        descricao: "Frango assado na brasa com arroz, feijão e farofa",              preco: 32.00, categoria: "Almoço",    happy_hour: 0, imagem: null },
        { nome: "Baião de Dois",                 descricao: "Arroz com feijão-verde, queijo coalho e carne de sol",           preco: 29.90, categoria: "Almoço",    happy_hour: 0, imagem: null },
        { nome: "Carne de Sol com Macaxeira",    descricao: "Carne de sol grelhada com macaxeira cozida e manteiga",          preco: 36.00, categoria: "Almoço",    happy_hour: 0, imagem: null },

        // ── PETISCOS ────────────────────────────────────────
        { nome: "Torresmo da Casa",              descricao: "Torresmo crocante frito na hora, porção generosa",               preco: 28.00, categoria: "Petiscos",  happy_hour: 0, imagem: "/uploads/torresmo.png" },
        { nome: "Bolinho de Bacalhau",           descricao: "6 unidades crocantes com molho de coentro",                     preco: 24.90, categoria: "Petiscos",  happy_hour: 0, imagem: null },
        { nome: "Isca de Frango Temperada",      descricao: "Frango empanado com temperos nordestinos e molho barbecue",      preco: 22.00, categoria: "Petiscos",  happy_hour: 0, imagem: null },
        { nome: "Macaxeira Frita",               descricao: "Macaxeira frita crocante por fora e macia por dentro",          preco: 16.00, categoria: "Petiscos",  happy_hour: 0, imagem: null },
        { nome: "Queijo Coalho na Brasa",        descricao: "Espetinho de queijo coalho grelhado com mel de engenho",        preco: 14.00, categoria: "Petiscos",  happy_hour: 0, imagem: null },

        // ── PIZZAS ──────────────────────────────────────────
        { nome: "Pizza Calabresa",               descricao: "Calabresa fatiada, cebola e azeitona sobre molho da casa",      preco: 42.00, categoria: "Pizzas",    happy_hour: 0, imagem: null },
        { nome: "Pizza Frango com Catupiry",     descricao: "Frango desfiado com catupiry cremoso e milho",                  preco: 45.00, categoria: "Pizzas",    happy_hour: 0, imagem: null },
        { nome: "Pizza Nordestina",              descricao: "Carne de sol, queijo coalho, cebola e pimenta",                 preco: 48.00, categoria: "Pizzas",    happy_hour: 0, imagem: null },
        { nome: "Pizza 4 Queijos",               descricao: "Mussarela, coalho, prato e parmesão",                           preco: 44.00, categoria: "Pizzas",    happy_hour: 0, imagem: null },

        // ── HAPPY HOUR ──────────────────────────────────────
        { nome: "Cerveja Brahma 600ml",          descricao: "Geladíssima, direto do barril",                                 preco: 12.00, categoria: "Happy Hour", happy_hour: 1, imagem: null },
        { nome: "Cerveja Skol Lata 350ml",       descricao: "Lata gelada com desconto especial no happy hour",               preco:  7.00, categoria: "Happy Hour", happy_hour: 1, imagem: null },
        { nome: "Caipirinha da Casa",            descricao: "Limão, cachaça artesanal e açúcar mascavo",                     preco: 15.00, categoria: "Happy Hour", happy_hour: 1, imagem: null },
        { nome: "Promoção Torresmo + 2 Cervejas",descricao: "Porção de torresmo com 2 Brahmas 600ml por preço especial",    preco: 45.00, categoria: "Happy Hour", happy_hour: 1, imagem: "/uploads/torresmo.png" },
        { nome: "Combo Petisco + Cerveja",       descricao: "Escolha 1 petisco + 1 cerveja 600ml com 20% OFF",               preco: 34.00, categoria: "Happy Hour", happy_hour: 1, imagem: null },
        { nome: "Caldinho de Feijão",            descricao: "Caldinho quente temperado, ideal pra acompanhar a cerveja",     preco:  8.00, categoria: "Happy Hour", happy_hour: 1, imagem: null },
    ];

    console.log("🍽️  Inserindo 20 pratos...\n");
    for (const p of pratos) {
        await query(
            "INSERT INTO prato (nome, descricao, preco, categoria, happy_hour, imagem) VALUES (?, ?, ?, ?, ?, ?)",
            [p.nome, p.descricao, p.preco, p.categoria, p.happy_hour, p.imagem]
        );
        console.log(`  ✅ ${p.nome} — R$ ${p.preco.toFixed(2)} [${p.categoria}]${p.happy_hour ? " 🍺 HAPPY HOUR" : ""}`);
    }

    console.log("\n🎉 Seed concluído! 20 pratos cadastrados com sucesso.");
    db.end();
}
