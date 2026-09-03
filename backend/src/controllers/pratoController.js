// ============================================================
// backend/src/controllers/pratoController.js
// ============================================================

const db = require("../config/database");

// GET /pratos — público
const listarPratos = (req, res) => {
    const sql = "SELECT * FROM prato ORDER BY categoria, criado_em DESC";
    db.query(sql, (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        res.json(resultado);
    });
};

// POST /pratos — admin
const criarPrato = (req, res) => {
    const { nome, descricao, preco, categoria, happy_hour } = req.body;

    if (!nome || !preco) {
        return res.status(400).json({ erro: "Nome e preço são obrigatórios." });
    }

    const imagem     = req.file ? `/uploads/${req.file.filename}` : null;
    const cat        = categoria  || "Cardápio";
    const isHH       = happy_hour === "true" || happy_hour === true || happy_hour === 1 ? 1 : 0;

    const sql = "INSERT INTO prato (nome, descricao, preco, categoria, happy_hour, imagem) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [nome, descricao || "", parseFloat(preco), cat, isHH, imagem], (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        res.status(201).json({ mensagem: "Prato cadastrado!", id: resultado.insertId });
    });
};

// PUT /pratos/:id — admin (edição)
const editarPrato = (req, res) => {
    const { id } = req.params;
    const { nome, descricao, preco, categoria, happy_hour } = req.body;

    if (!nome || !preco) {
        return res.status(400).json({ erro: "Nome e preço são obrigatórios." });
    }

    const isHH = happy_hour === "true" || happy_hour === true || happy_hour === 1 ? 1 : 0;
    const cat  = categoria || "Cardápio";

    // Se enviou nova imagem, atualiza; senão mantém a atual
    if (req.file) {
        const novaImagem = `/uploads/${req.file.filename}`;
        const sql = "UPDATE prato SET nome=?, descricao=?, preco=?, categoria=?, happy_hour=?, imagem=? WHERE id=?";
        db.query(sql, [nome, descricao || "", parseFloat(preco), cat, isHH, novaImagem, id], (erro, resultado) => {
            if (erro) return res.status(500).json({ erro: erro.message });
            if (resultado.affectedRows === 0) return res.status(404).json({ erro: "Prato não encontrado." });
            res.json({ mensagem: "Prato atualizado!" });
        });
    } else {
        const sql = "UPDATE prato SET nome=?, descricao=?, preco=?, categoria=?, happy_hour=? WHERE id=?";
        db.query(sql, [nome, descricao || "", parseFloat(preco), cat, isHH, id], (erro, resultado) => {
            if (erro) return res.status(500).json({ erro: erro.message });
            if (resultado.affectedRows === 0) return res.status(404).json({ erro: "Prato não encontrado." });
            res.json({ mensagem: "Prato atualizado!" });
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

module.exports = { listarPratos, criarPrato, editarPrato, deletarPrato };
