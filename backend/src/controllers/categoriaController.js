// ============================================================
// backend/src/controllers/categoriaController.js
// ============================================================

const db = require("../config/database");

// GET /categorias — público (usado no form e na home)
const listarCategorias = (req, res) => {
    db.query("SELECT * FROM categoria ORDER BY ordem ASC, nome ASC", (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        res.json(resultado);
    });
};

// POST /categorias — admin
const criarCategoria = (req, res) => {
    const { nome, icone } = req.body;

    if (!nome) return res.status(400).json({ erro: "Nome é obrigatório." });

    const ic = icone || "🍴";

    // Pega a maior ordem atual e adiciona 1
    db.query("SELECT MAX(ordem) as maxOrdem FROM categoria", (err, rows) => {
        const novaOrdem = (rows[0]?.maxOrdem || 0) + 1;
        db.query(
            "INSERT INTO categoria (nome, icone, ordem) VALUES (?, ?, ?)",
            [nome.trim(), ic, novaOrdem],
            (erro, resultado) => {
                if (erro) {
                    if (erro.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({ erro: "Categoria já existe." });
                    }
                    return res.status(500).json({ erro: erro.message });
                }
                res.status(201).json({ mensagem: "Categoria criada!", id: resultado.insertId });
            }
        );
    });
};

// DELETE /categorias/:id — admin
const deletarCategoria = (req, res) => {
    const { id } = req.params;

    // Verifica se tem pratos usando esta categoria
    db.query(
        "SELECT nome FROM categoria WHERE id = ?", [id],
        (err, rows) => {
            if (!rows || rows.length === 0) return res.status(404).json({ erro: "Categoria não encontrada." });
            const nomeCategoria = rows[0].nome;

            db.query(
                "SELECT COUNT(*) as total FROM prato WHERE categoria = ?", [nomeCategoria],
                (err2, counts) => {
                    if (counts[0].total > 0) {
                        return res.status(400).json({
                            erro: `Não é possível excluir: ${counts[0].total} prato(s) usam esta categoria.`
                        });
                    }
                    db.query("DELETE FROM categoria WHERE id = ?", [id], (erro) => {
                        if (erro) return res.status(500).json({ erro: erro.message });
                        res.json({ mensagem: "Categoria removida!" });
                    });
                }
            );
        }
    );
};

module.exports = { listarCategorias, criarCategoria, deletarCategoria };
