// ============================================================
// migrar-delivery.js — Criação das tabelas e seeds de delivery
// ============================================================

const db = require("./src/config/database");

const query = (sql, params = []) =>
    new Promise((res, rej) => db.query(sql, params, (e, r) => e ? rej(e) : res(r)));

async function migrar() {
    console.log("🚚 [Delivery] Iniciando migração de Delivery/Frete...");

    try {
        // 1. Adicionar campos em configuracao se não existirem
        const cols = await query("DESCRIBE configuracao");
        const colNames = cols.map(c => c.Field);

        if (!colNames.includes("delivery_ativo")) {
            await query("ALTER TABLE configuracao ADD COLUMN delivery_ativo TINYINT(1) DEFAULT 1");
            console.log("✅ Coluna delivery_ativo adicionada");
        }
        if (!colNames.includes("delivery_tempo")) {
            await query("ALTER TABLE configuracao ADD COLUMN delivery_tempo VARCHAR(50) DEFAULT '40 a 60 min'");
            console.log("✅ Coluna delivery_tempo adicionada");
        }
        if (!colNames.includes("delivery_taxa_padrao")) {
            await query("ALTER TABLE configuracao ADD COLUMN delivery_taxa_padrao DECIMAL(10,2) DEFAULT 8.00");
            console.log("✅ Coluna delivery_taxa_padrao adicionada");
        }
        if (!colNames.includes("delivery_pedido_minimo")) {
            await query("ALTER TABLE configuracao ADD COLUMN delivery_pedido_minimo DECIMAL(10,2) DEFAULT 0.00");
            console.log("✅ Coluna delivery_pedido_minimo adicionada");
        }
        if (!colNames.includes("delivery_modo")) {
            await query("ALTER TABLE configuracao ADD COLUMN delivery_modo VARCHAR(20) DEFAULT 'km'");
            console.log("✅ Coluna delivery_modo adicionada");
        }
        if (!colNames.includes("delivery_taxa_base")) {
            await query("ALTER TABLE configuracao ADD COLUMN delivery_taxa_base DECIMAL(10,2) DEFAULT 6.00");
            console.log("✅ Coluna delivery_taxa_base adicionada");
        }
        if (!colNames.includes("delivery_taxa_km")) {
            await query("ALTER TABLE configuracao ADD COLUMN delivery_taxa_km DECIMAL(10,2) DEFAULT 2.00");
            console.log("✅ Coluna delivery_taxa_km adicionada");
        }
        if (!colNames.includes("delivery_raio_maximo")) {
            await query("ALTER TABLE configuracao ADD COLUMN delivery_raio_maximo DECIMAL(10,2) DEFAULT 12.00");
            console.log("✅ Coluna delivery_raio_maximo adicionada");
        }

        // 2. Criar tabela delivery_bairro
        await query(`
            CREATE TABLE IF NOT EXISTS delivery_bairro (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL UNIQUE,
                nome_normalizado VARCHAR(100) NOT NULL,
                taxa DECIMAL(10,2) NOT NULL DEFAULT 8.00,
                tempo_estimado VARCHAR(50) DEFAULT '40 a 55 min',
                ativo TINYINT(1) DEFAULT 1,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log("✅ Tabela delivery_bairro verificada/criada");

        // 3. Povoar bairros estratégicos reais de Recife em torno da Encruzilhada
        const bairrosIniciais = [
            // Zona 1: Imediata / Raio Curto (~ R$ 6,00 a R$ 7,00)
            { nome: "Encruzilhada", taxa: 6.00, tempo: "30 a 45 min" },
            { nome: "Rosarinho", taxa: 6.00, tempo: "30 a 45 min" },
            { nome: "Campo Grande", taxa: 7.00, tempo: "35 a 50 min" },
            { nome: "Ponto de Parada", taxa: 6.00, tempo: "30 a 45 min" },
            { nome: "Hipódromo", taxa: 6.00, tempo: "30 a 45 min" },
            { nome: "Torreão", taxa: 7.00, tempo: "35 a 50 min" },

            // Zona 2: Central / Raio Médio (~ R$ 8,00 a R$ 10,00)
            { nome: "Aflitos", taxa: 8.00, tempo: "35 a 50 min" },
            { nome: "Espinheiro", taxa: 8.00, tempo: "35 a 50 min" },
            { nome: "Graças", taxa: 10.00, tempo: "40 a 55 min" },
            { nome: "Jaqueira", taxa: 10.00, tempo: "40 a 55 min" },
            { nome: "Tamarineira", taxa: 9.00, tempo: "40 a 55 min" },
            { nome: "Arruda", taxa: 8.00, tempo: "35 a 50 min" },
            { nome: "Água Fria", taxa: 9.00, tempo: "40 a 55 min" },
            { nome: "Santo Amaro", taxa: 10.00, tempo: "40 a 55 min" },

            // Zona 3: Expandida (~ R$ 12,00 a R$ 15,00)
            { nome: "Casa Forte", taxa: 12.00, tempo: "45 a 60 min" },
            { nome: "Santana", taxa: 12.00, tempo: "45 a 60 min" },
            { nome: "Poço da Panela", taxa: 14.00, tempo: "50 a 65 min" },
            { nome: "Derby", taxa: 12.00, tempo: "45 a 60 min" },
            { nome: "Boa Vista", taxa: 12.00, tempo: "45 a 60 min" },
            { nome: "Madalena", taxa: 14.00, tempo: "50 a 65 min" },
            { nome: "Torre", taxa: 13.00, tempo: "45 a 60 min" },
            { nome: "Parnamirim", taxa: 12.00, tempo: "45 a 60 min" },
            { nome: "Monteiro", taxa: 15.00, tempo: "50 a 65 min" }
        ];

        function normalizar(texto) {
            return texto
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim();
        }

        for (const b of bairrosIniciais) {
            const norm = normalizar(b.nome);
            await query(`
                INSERT INTO delivery_bairro (nome, nome_normalizado, taxa, tempo_estimado, ativo)
                VALUES (?, ?, ?, ?, 1)
                ON DUPLICATE KEY UPDATE 
                    nome_normalizado = VALUES(nome_normalizado),
                    taxa = VALUES(taxa),
                    tempo_estimado = VALUES(tempo_estimado)
            `, [b.nome, norm, b.taxa, b.tempo]);
        }

        console.log(`✅ ${bairrosIniciais.length} bairros base cadastrados com sucesso!`);
    } catch (err) {
        console.error("❌ Erro na migração:", err);
    } finally {
        process.exit(0);
    }
}

migrar();
