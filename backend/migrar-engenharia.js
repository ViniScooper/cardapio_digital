// ============================================================
// migrar-engenharia.js — Adiciona colunas para Engenharia de Cardápio
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
    console.log("✅ Conectado ao MySQL! Iniciando migração da Engenharia de Cardápio...\n");

    const query = (sql, params = []) =>
        new Promise((res, rej) => db.query(sql, params, (e, r) => e ? rej(e) : res(r)));

    try {
        // Adiciona colunas na tabela prato
        const colunas = [
            "ALTER TABLE prato ADD COLUMN custo DECIMAL(10,2) DEFAULT NULL",
            "ALTER TABLE prato ADD COLUMN ordem_manual INT DEFAULT 0",
            "ALTER TABLE prato ADD COLUMN destaque_manual VARCHAR(30) DEFAULT NULL",
            "ALTER TABLE prato ADD COLUMN selo VARCHAR(50) DEFAULT NULL",
            "ALTER TABLE prato ADD COLUMN visualizacoes INT DEFAULT 0",
            "ALTER TABLE prato ADD COLUMN pedidos_estimados INT DEFAULT 0"
        ];

        for (const sql of colunas) {
            try {
                await query(sql);
                console.log(`  ➕ Executado: ${sql.split("ADD COLUMN ")[1].split(" ")[0]}`);
            } catch (e) {
                console.log(`  ℹ️ Coluna já existente (OK)`);
            }
        }

        // Cria tabela de métricas diárias
        await query(`
            CREATE TABLE IF NOT EXISTS prato_metricas_diarias (
                id INT AUTO_INCREMENT PRIMARY KEY,
                prato_id INT NOT NULL,
                data DATE NOT NULL,
                visualizacoes INT DEFAULT 0,
                cliques_detalhe INT DEFAULT 0,
                FOREIGN KEY (prato_id) REFERENCES prato(id) ON DELETE CASCADE,
                UNIQUE KEY prato_dia (prato_id, data)
            )
        `);
        console.log("  ✅ Tabela prato_metricas_diarias verificada/criada.");

        // Atualiza alguns destaques e custos de exemplo nos carros-chefes para o cliente já ver pronto
        console.log("\n🎯 Configurando itens estratégicos iniciais...");

        // 1. Maminha Argentina Completa -> Estrela (Mais Pedido)
        await query(`
            UPDATE prato 
            SET custo = 38.00, selo = '🔥 Mais Pedido', destaque_manual = 'estrela', pedidos_estimados = 120, visualizacoes = 245
            WHERE nome LIKE '%Maminha Argentina Completa%'
        `);

        // 2. Carne de Sol Completa -> Vaca Leiteira (Favorito)
        await query(`
            UPDATE prato 
            SET custo = 35.00, selo = '⭐ Favorito da Casa', destaque_manual = 'vaca_leiteira', pedidos_estimados = 110, visualizacoes = 190
            WHERE nome LIKE '%Carne de Sol Completa%'
        `);

        // 3. Arrumadinho de Carne de Sol Completo -> Estrela
        await query(`
            UPDATE prato 
            SET custo = 28.00, selo = '👨‍🍳 Recomendado do Chef', destaque_manual = 'estrela', pedidos_estimados = 95, visualizacoes = 180
            WHERE nome LIKE '%Arrumadinho de Carne de Sol Completo%'
        `);

        // 4. Cupim com Fritas -> Enigma (Alta margem, precisa de destaque)
        await query(`
            UPDATE prato 
            SET custo = 15.00, selo = '✨ Destaque do Chef', destaque_manual = 'enigma', pedidos_estimados = 35, visualizacoes = 80
            WHERE nome LIKE '%Cupim com Fritas%'
        `);

        // 5. Pizza Nordestina -> Estrela
        await query(`
            UPDATE prato 
            SET custo = 16.00, selo = '🔥 Mais Pedida', destaque_manual = 'estrela', pedidos_estimados = 90, visualizacoes = 150
            WHERE nome LIKE '%Pizza Nordestina%'
        `);

        // 6. Croquete do Biu -> Enigma
        await query(`
            UPDATE prato 
            SET custo = 4.50, selo = '🏆 Receita da Casa', destaque_manual = 'enigma', pedidos_estimados = 28, visualizacoes = 60
            WHERE nome LIKE '%Croquete do Biu%'
        `);

        console.log("🎉 Migração concluída com sucesso!");
    } catch (e) {
        console.error("❌ Erro durante migração:", e);
    } finally {
        db.end();
    }
});
