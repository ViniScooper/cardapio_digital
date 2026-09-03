// ============================================================
// migrar-selos.js — Cria tabela de selos personalizados
// ============================================================

require("dotenv").config();
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
    console.log("✅ Conectado ao MySQL! Criando tabela de selos...\n");

    const query = (sql, params = []) =>
        new Promise((res, rej) => db.query(sql, params, (e, r) => e ? rej(e) : res(r)));

    try {
        await query(`
            CREATE TABLE IF NOT EXISTS selo (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(50) NOT NULL UNIQUE,
                icone VARCHAR(10) DEFAULT '🔥',
                cor VARCHAR(20) DEFAULT '#e8b84b',
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Tabela selo criada com sucesso!");

        // Insere selos iniciais padrão
        const selosIniciais = [
            { nome: "Mais Pedido",           icone: "🔥", cor: "#e8b84b" },
            { nome: "Recomendado do Chef",   icone: "👨‍🍳", cor: "#e67e22" },
            { nome: "Favorito da Casa",      icone: "⭐", cor: "#f1c40f" },
            { nome: "Destaque da Noite",     icone: "✨", cor: "#9b59b6" },
            { nome: "Receita Tradicional",   icone: "🏆", cor: "#27ae60" },
            { nome: "Novidade",              icone: "🆕", cor: "#3498db" }
        ];

        for (const s of selosIniciais) {
            try {
                await query("INSERT INTO selo (nome, icone, cor) VALUES (?, ?, ?)", [s.nome, s.icone, s.cor]);
                console.log(`  ➕ Selo adicionado: ${s.icone} ${s.nome}`);
            } catch (e) {
                // Já existe, ignora
            }
        }

        console.log("\n🎉 Selos iniciais configurados com sucesso!");
    } catch (e) {
        console.error("❌ Erro:", e);
    } finally {
        db.end();
    }
});
