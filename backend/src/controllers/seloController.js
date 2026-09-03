// ============================================================
// backend/src/controllers/seloController.js
// ============================================================

const db = require("../config/database");

// GET /selos — público
const listarSelos = (req, res) => {
    db.query("SELECT * FROM selo ORDER BY id ASC", (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        res.json(resultado);
    });
};

// POST /selos — admin
const criarSelo = (req, res) => {
    const { nome, icone, cor } = req.body;

    if (!nome) {
        return res.status(400).json({ erro: "O nome do selo é obrigatório." });
    }

    const iconeFinal = icone || "🏷️";
    const corFinal   = cor   || "#e8b84b";

    const sql = "INSERT INTO selo (nome, icone, cor) VALUES (?, ?, ?)";
    db.query(sql, [nome.trim(), iconeFinal, corFinal], (erro, resultado) => {
        if (erro) {
            if (erro.code === "ER_DUP_ENTRY") {
                return res.status(400).json({ erro: "Já existe um selo com esse nome." });
            }
            return res.status(500).json({ erro: erro.message });
        }
        res.status(201).json({ 
            mensagem: "Selo criado com sucesso!", 
            id: resultado.insertId,
            selo: { id: resultado.insertId, nome: nome.trim(), icone: iconeFinal, cor: corFinal }
        });
    });
};

// DELETE /selos/:id — admin
const deletarSelo = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM selo WHERE id = ?", [id], (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        if (resultado.affectedRows === 0) return res.status(404).json({ erro: "Selo não encontrado." });
        res.json({ mensagem: "Selo removido com sucesso!" });
    });
};

module.exports = { listarSelos, criarSelo, deletarSelo };
