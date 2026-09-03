// ============================================================
// seed-config.js — Cria tabela de configurações do restaurante
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
        console.error("Erro:", err.message);
        process.exit(1);
    }

    const query = (sql, params = []) =>
        new Promise((res, rej) => db.query(sql, params, (e, r) => e ? rej(e) : res(r)));

    try {
        await query(`
            CREATE TABLE IF NOT EXISTS configuracao (
                id INT PRIMARY KEY DEFAULT 1,
                hh_ativo TINYINT(1) DEFAULT 1,
                hh_dias VARCHAR(255) DEFAULT 'Segunda, Terça e Quarta',
                hh_inicio VARCHAR(10) DEFAULT '19:00',
                hh_fim VARCHAR(10) DEFAULT '22:00',
                atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await query(`
            INSERT INTO configuracao (id, hh_ativo, hh_dias, hh_inicio, hh_fim)
            VALUES (1, 1, 'Segunda, Terça e Quarta', '19:00', '22:00')
            ON DUPLICATE KEY UPDATE id=1
        `);

        console.log("✅ Tabela configuracao criada e inicializada com sucesso!");
    } catch (e) {
        console.error("Erro na criação:", e);
    } finally {
        db.end();
    }
});
