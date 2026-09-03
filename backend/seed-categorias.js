// ============================================================
// seed-categorias.js — Cria tabela e popula categorias iniciais
// Rode com: node seed-categorias.js
// ============================================================

const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost", user: "root",
    password: "viniZIKA3103", database: "restaurante"
});

db.connect((err) => {
    if (err) { console.error("Erro:", err.message); process.exit(1); }
    console.log("✅ Conectado!\n");
    rodar();
});

async function rodar() {
    const query = (sql, params = []) =>
        new Promise((res, rej) =>
            db.query(sql, params, (e, r) => e ? rej(e) : res(r))
        );

    // Cria tabela categoria
    await query(`
        CREATE TABLE IF NOT EXISTS categoria (
            id        INT AUTO_INCREMENT PRIMARY KEY,
            nome      VARCHAR(100) NOT NULL UNIQUE,
            icone     VARCHAR(10)  NOT NULL DEFAULT '🍴',
            ordem     INT          DEFAULT 0,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log("✅ Tabela categoria criada/verificada\n");

    // Insere as categorias já existentes
    const cats = [
        { nome: "Almoço",     icone: "🍽️", ordem: 1 },
        { nome: "Petiscos",   icone: "🍟",  ordem: 2 },
        { nome: "Pizzas",     icone: "🍕",  ordem: 3 },
        { nome: "Bebidas",    icone: "🥤",  ordem: 4 },
        { nome: "Sobremesas", icone: "🍰",  ordem: 5 },
        { nome: "Cardápio",   icone: "🍴",  ordem: 6 },
    ];

    for (const c of cats) {
        try {
            await query(
                "INSERT INTO categoria (nome, icone, ordem) VALUES (?, ?, ?)",
                [c.nome, c.icone, c.ordem]
            );
            console.log(`  ✅ ${c.icone} ${c.nome}`);
        } catch (e) {
            console.log(`  ⚠️  ${c.nome} já existe`);
        }
    }

    console.log("\n🎉 Categorias prontas!");
    db.end();
}
