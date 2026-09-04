// ============================================================
// migrar-banco-completo.js — Criação de todas as tabelas e dados
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
        console.error("❌ Erro ao conectar no MySQL para criar tabelas base:", err.message);
        process.exit(1);
    }
    console.log("✅ Conectado ao MySQL! Garantindo integridade das tabelas base...");

    const query = (sql, params = []) =>
        new Promise((res, rej) => db.query(sql, params, (e, r) => e ? rej(e) : res(r)));

    try {
        // 1. Tabela usuario
        await query(`
            CREATE TABLE IF NOT EXISTS usuario (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                senha VARCHAR(255) NOT NULL,
                role ENUM('admin', 'user') DEFAULT 'user',
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Tabela categoria
        await query(`
            CREATE TABLE IF NOT EXISTS categoria (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL UNIQUE,
                icone VARCHAR(10) NOT NULL DEFAULT '🍴',
                ordem INT DEFAULT 0,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Tabela prato
        await query(`
            CREATE TABLE IF NOT EXISTS prato (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                descricao TEXT,
                preco DECIMAL(10, 2) NOT NULL,
                categoria VARCHAR(50) DEFAULT 'Cardápio',
                happy_hour TINYINT(1) DEFAULT 0,
                imagem VARCHAR(255) DEFAULT NULL,
                custo DECIMAL(10, 2) DEFAULT NULL,
                ordem_manual INT DEFAULT NULL,
                destaque_manual VARCHAR(50) DEFAULT NULL,
                selo VARCHAR(50) DEFAULT NULL,
                visualizacoes INT DEFAULT 0,
                pedidos_estimados INT DEFAULT 0,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 4. Tabela configuracao
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

        // Inserir Admin se não existir (senha: admin123)
        await query(`
            INSERT IGNORE INTO usuario (id, nome, email, senha, role) 
            VALUES (1, 'Administrador', 'admin@boteco.com', '$2a$10$vI8aWBnW3fID.ZQ4/ZOIj.qU5vY3K5x1hT.0aY844hXq9E3l9Geq6', 'admin')
        `);

        // Inserir Configuração se não existir
        await query(`
            INSERT IGNORE INTO configuracao (id, hh_ativo, hh_dias, hh_inicio, hh_fim) 
            VALUES (1, 1, 'Segunda, Terça e Quarta', '19:00', '22:00')
        `);

        console.log("✅ Tabelas base verificadas e prontas!");
    } catch (e) {
        console.error("❌ Erro ao criar tabelas base:", e.message);
    } finally {
        db.end();
    }
});
