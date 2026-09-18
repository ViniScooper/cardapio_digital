// ============================================================
// migrar-ajustes-sivirino.js — Novas colunas solicitadas pelo Boteco do Sivirino
// 1. categoria.imagem (foto da categoria)
// 2. prato.categoria_secundaria (prato em mais de 1 categoria)
// 3. configuracao.hh_apenas_local (travar happy hour no delivery)
// ============================================================

const mysql = require("mysql2");

const db = mysql.createConnection({
    host:     process.env.DB_HOST     || "localhost",
    user:     process.env.DB_USER     || "root",
    password: process.env.DB_PASSWORD || "viniZIKA3103",
    database: process.env.DB_NAME     || "restaurante",
    port:     Number(process.env.DB_PORT) || 3306
});

const query = (sql, params = []) =>
    new Promise((res, rej) => db.query(sql, params, (e, r) => e ? rej(e) : res(r)));

async function migrar() {
    console.log("🚀 Iniciando migração das novas colunas do Boteco do Sivirino...");

    try {
        // 1. Coluna imagem em categoria
        const colsCat = await query("DESCRIBE categoria");
        const colNamesCat = colsCat.map(c => c.Field);
        if (!colNamesCat.includes("imagem")) {
            await query("ALTER TABLE categoria ADD COLUMN imagem VARCHAR(255) DEFAULT NULL AFTER icone");
            console.log("✅ Coluna 'imagem' adicionada na tabela 'categoria'.");
        } else {
            console.log("ℹ️ Coluna 'imagem' já existe na tabela 'categoria'.");
        }

        // 2. Coluna categoria_secundaria em prato
        const colsPrato = await query("DESCRIBE prato");
        const colNamesPrato = colsPrato.map(c => c.Field);
        if (!colNamesPrato.includes("categoria_secundaria")) {
            await query("ALTER TABLE prato ADD COLUMN categoria_secundaria VARCHAR(100) DEFAULT NULL AFTER categoria");
            console.log("✅ Coluna 'categoria_secundaria' adicionada na tabela 'prato'.");
        } else {
            console.log("ℹ️ Coluna 'categoria_secundaria' já existe na tabela 'prato'.");
        }

        // 3. Coluna hh_apenas_local em configuracao
        const colsConfig = await query("DESCRIBE configuracao");
        const colNamesConfig = colsConfig.map(c => c.Field);
        if (!colNamesConfig.includes("hh_apenas_local")) {
            await query("ALTER TABLE configuracao ADD COLUMN hh_apenas_local TINYINT(1) DEFAULT 1 AFTER hh_fim");
            console.log("✅ Coluna 'hh_apenas_local' adicionada na tabela 'configuracao'.");
        } else {
            console.log("ℹ️ Coluna 'hh_apenas_local' já existe na tabela 'configuracao'.");
        }

        // 4. Colunas de taxa de embalagem em configuracao
        if (!colNamesConfig.includes("delivery_taxa_embalagem")) {
            await query("ALTER TABLE configuracao ADD COLUMN delivery_taxa_embalagem DECIMAL(10,2) DEFAULT 0.00");
            console.log("✅ Coluna 'delivery_taxa_embalagem' adicionada na tabela 'configuracao'.");
        } else {
            console.log("ℹ️ Coluna 'delivery_taxa_embalagem' já existe na tabela 'configuracao'.");
        }

        if (!colNamesConfig.includes("delivery_embalagem_tipo")) {
            await query("ALTER TABLE configuracao ADD COLUMN delivery_embalagem_tipo VARCHAR(20) DEFAULT 'pedido'");
            console.log("✅ Coluna 'delivery_embalagem_tipo' adicionada na tabela 'configuracao'.");
        } else {
            console.log("ℹ️ Coluna 'delivery_embalagem_tipo' já existe na tabela 'configuracao'.");
        }

        // 5. Coluna instagram_url em configuracao
        if (!colNamesConfig.includes("instagram_url")) {
            await query("ALTER TABLE configuracao ADD COLUMN instagram_url VARCHAR(255) DEFAULT 'https://www.instagram.com/botecodosivirino/'");
            console.log("✅ Coluna 'instagram_url' adicionada na tabela 'configuracao'.");
        } else {
            console.log("ℹ️ Coluna 'instagram_url' já existe na tabela 'configuracao'.");
        }

        console.log("🎉 Todas as migrações foram aplicadas com sucesso no banco de dados!");
    } catch (err) {
        console.error("❌ Erro na migração:", err.message);
    } finally {
        db.end();
    }
}

migrar();
