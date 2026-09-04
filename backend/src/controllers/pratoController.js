// ============================================================
// backend/src/controllers/pratoController.js
// ============================================================

const db = require("../config/database");
const { classificarPratos, ordenarPorEstrategia } = require("../services/menuEngineeringService");

// GET /pratos — público (agora com inteligência de cardápio e ordenação estratégica)
const listarPratos = (req, res) => {
    const sql = "SELECT * FROM prato ORDER BY categoria, ordem_manual ASC, preco DESC";
    db.query(sql, (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: erro.message });

        // Agrupa por categoria para classificar individualmente
        const porCategoria = {};
        for (const p of resultado) {
            const cat = p.categoria || "Cardápio";
            if (!porCategoria[cat]) porCategoria[cat] = [];
            porCategoria[cat].push(p);
        }

        let listaFinal = [];
        for (const cat of Object.keys(porCategoria)) {
            const classificados = classificarPratos(porCategoria[cat]);
            const ordenados = ordenarPorEstrategia(classificados);
            listaFinal = listaFinal.concat(ordenados);
        }

        res.json(listaFinal);
    });
};

// POST /pratos — admin
const criarPrato = (req, res) => {
    const { nome, descricao, preco, categoria, happy_hour, custo, selo, destaque_manual, ordem_manual } = req.body;

    if (!nome || !preco) {
        return res.status(400).json({ erro: "Nome e preço são obrigatórios." });
    }

    const imagem     = req.file ? `/uploads/${req.file.filename}` : null;
    const cat        = categoria || "Cardápio";
    const isHH       = happy_hour === "true" || happy_hour === true || happy_hour === 1 ? 1 : 0;
    const vCusto     = custo ? parseFloat(custo) : null;
    const vSelo      = selo || null;
    const vDestaque  = destaque_manual || null;
    const vOrdem     = ordem_manual ? parseInt(ordem_manual, 10) : 0;

    const sql = `
        INSERT INTO prato (nome, descricao, preco, categoria, happy_hour, imagem, custo, selo, destaque_manual, ordem_manual) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [nome, descricao || "", parseFloat(preco), cat, isHH, imagem, vCusto, vSelo, vDestaque, vOrdem], (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        res.status(201).json({ mensagem: "Prato cadastrado com sucesso!", id: resultado.insertId });
    });
};

// PUT /pratos/:id — admin (edição com custo e inteligência)
const editarPrato = (req, res) => {
    const { id } = req.params;
    const { nome, descricao, preco, categoria, happy_hour, custo, selo, destaque_manual, ordem_manual, pedidos_estimados } = req.body;

    if (!nome || !preco) {
        return res.status(400).json({ erro: "Nome e preço são obrigatórios." });
    }

    const isHH      = happy_hour === "true" || happy_hour === true || happy_hour === 1 ? 1 : 0;
    const cat       = categoria || "Cardápio";
    const vCusto    = (custo !== undefined && custo !== null && custo !== "") ? parseFloat(custo) : null;
    const vSelo     = selo || null;
    const vDestaque = destaque_manual || null;
    const vOrdem    = ordem_manual ? parseInt(ordem_manual, 10) : 0;
    const vPedidos  = pedidos_estimados ? parseInt(pedidos_estimados, 10) : 0;

    if (req.file) {
        const novaImagem = `/uploads/${req.file.filename}`;
        const sql = `
            UPDATE prato 
            SET nome=?, descricao=?, preco=?, categoria=?, happy_hour=?, imagem=?, custo=?, selo=?, destaque_manual=?, ordem_manual=?, pedidos_estimados=?
            WHERE id=?
        `;
        db.query(sql, [nome, descricao || "", parseFloat(preco), cat, isHH, novaImagem, vCusto, vSelo, vDestaque, vOrdem, vPedidos, id], (erro, resultado) => {
            if (erro) return res.status(500).json({ erro: erro.message });
            if (resultado.affectedRows === 0) return res.status(404).json({ erro: "Prato não encontrado." });
            res.json({ mensagem: "Prato atualizado com sucesso!" });
        });
    } else {
        const sql = `
            UPDATE prato 
            SET nome=?, descricao=?, preco=?, categoria=?, happy_hour=?, custo=?, selo=?, destaque_manual=?, ordem_manual=?, pedidos_estimados=?
            WHERE id=?
        `;
        db.query(sql, [nome, descricao || "", parseFloat(preco), cat, isHH, vCusto, vSelo, vDestaque, vOrdem, vPedidos, id], (erro, resultado) => {
            if (erro) return res.status(500).json({ erro: erro.message });
            if (resultado.affectedRows === 0) return res.status(404).json({ erro: "Prato não encontrado." });
            res.json({ mensagem: "Prato atualizado com sucesso!" });
        });
    }
};

// DELETE /pratos/:id — admin
const deletarPrato = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM prato WHERE id = ?", [id], (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        if (resultado.affectedRows === 0) return res.status(404).json({ erro: "Prato não encontrado." });
        res.json({ mensagem: "Prato removido!" });
    });
};

// POST /pratos/:id/visualizacao — rastreia interesse do cliente
const registrarVisualizacao = (req, res) => {
    const { id } = req.params;
    const hoje = new Date().toISOString().split("T")[0];

    db.query("UPDATE prato SET visualizacoes = visualizacoes + 1 WHERE id = ?", [id]);
    
    // Incrementa na tabela diária também
    const sqlDiario = `
        INSERT INTO prato_metricas_diarias (prato_id, data, visualizacoes)
        VALUES (?, ?, 1)
        ON DUPLICATE KEY UPDATE visualizacoes = visualizacoes + 1
    `;
    db.query(sqlDiario, [id, hoje]);

    res.json({ sucesso: true });
};

// GET /pratos/matriz — resumo executivo da engenharia para o painel admin
const obterMatrizEngenharia = (req, res) => {
    db.query("SELECT * FROM prato ORDER BY categoria", (erro, pratos) => {
        if (erro) return res.status(500).json({ erro: erro.message });

        const porCategoria = {};
        for (const p of pratos) {
            const cat = p.categoria || "Cardápio";
            if (!porCategoria[cat]) porCategoria[cat] = [];
            porCategoria[cat].push(p);
        }

        let todosClassificados = [];
        for (const cat of Object.keys(porCategoria)) {
            const classificados = classificarPratos(porCategoria[cat]);
            todosClassificados = todosClassificados.concat(classificados);
        }

        const estrelas       = todosClassificados.filter(p => p.classificacao === "estrela");
        const vacasLeiteiras = todosClassificados.filter(p => p.classificacao === "vaca_leiteira");
        const enigmas        = todosClassificados.filter(p => p.classificacao === "enigma");
        const abacaxis       = todosClassificados.filter(p => p.classificacao === "abacaxi");
        const semDados       = todosClassificados.filter(p => !p.classificacao);

        res.json({
            resumo: {
                total: todosClassificados.length,
                estrelas: estrelas.length,
                vacas_leiteiras: vacasLeiteiras.length,
                enigmas: enigmas.length,
                abacaxis: abacaxis.length,
                sem_dados: semDados.length
            },
            pratos: todosClassificados
        });
    });
};

// PUT /pratos/reordenar — admin (atualiza a ordem manual de pratos)
const reordenarPratos = (req, res) => {
    const { pratos } = req.body; // Array de { id, ordem_manual }

    if (!Array.isArray(pratos) || pratos.length === 0) {
        return res.status(400).json({ erro: "Envie uma lista de pratos com seus IDs e nova ordem." });
    }

    const updates = pratos.map(p => {
        return new Promise((resolve, reject) => {
            db.query(
                "UPDATE prato SET ordem_manual = ? WHERE id = ?",
                [parseInt(p.ordem_manual, 10), parseInt(p.id, 10)],
                (err) => err ? reject(err) : resolve()
            );
        });
    });

    Promise.all(updates)
        .then(() => res.json({ mensagem: "Ordem dos pratos salva com sucesso!" }))
        .catch(err => res.status(500).json({ erro: err.message }));
};

module.exports = {
    listarPratos,
    criarPrato,
    editarPrato,
    deletarPrato,
    registrarVisualizacao,
    obterMatrizEngenharia,
    reordenarPratos
};
