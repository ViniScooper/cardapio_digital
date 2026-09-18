// ============================================================
// backend/src/controllers/categoriaController.js
// ============================================================

const db = require("../config/database");
const { uploadParaBucket } = require("../config/upload");

// GET /categorias — público (usado no form e na home com ordenação por 'ordem')
const listarCategorias = (req, res) => {
    db.query("SELECT * FROM categoria ORDER BY ordem ASC, id ASC", (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        res.json(resultado);
    });
};

// POST /categorias — admin (com suporte a upload de foto da categoria)
const criarCategoria = async (req, res) => {
    const { nome, icone } = req.body;

    if (!nome) return res.status(400).json({ erro: "Nome é obrigatório." });

    const ic = icone || "🍴";

    try {
        let imagem = null;
        if (req.file) {
            imagem = await uploadParaBucket(req.file);
        } else if (req.body.imagem) {
            imagem = req.body.imagem;
        }

        // Pega a maior ordem atual e adiciona 1
        db.query("SELECT MAX(ordem) as maxOrdem FROM categoria", (err, rows) => {
            if (err) return res.status(500).json({ erro: err.message });

            const novaOrdem = (rows[0]?.maxOrdem || 0) + 1;
            db.query(
                "INSERT INTO categoria (nome, icone, ordem, imagem) VALUES (?, ?, ?, ?)",
                [nome.trim(), ic, novaOrdem, imagem],
                (erro, resultado) => {
                    if (erro) {
                        if (erro.code === "ER_DUP_ENTRY") {
                            return res.status(409).json({ erro: "Categoria já existe." });
                        }
                        return res.status(500).json({ erro: erro.message });
                    }
                    res.status(201).json({ mensagem: "Categoria criada com sucesso!", id: resultado.insertId, imagem });
                }
            );
        });
    } catch (err) {
        console.error("Erro ao salvar foto da categoria:", err);
        return res.status(500).json({ erro: "Erro ao processar imagem da categoria: " + err.message });
    }
};

// PUT /categorias/:id — admin (edição de nome, ícone e foto)
const editarCategoria = async (req, res) => {
    const { id } = req.params;
    const { nome, icone } = req.body;

    if (!nome) return res.status(400).json({ erro: "Nome é obrigatório." });

    try {
        let imagem = req.body.imagem;
        if (req.file) {
            imagem = await uploadParaBucket(req.file);
        }

        // Primeiro busca categoria antiga para renomear pratos associados se o nome mudou
        db.query("SELECT nome, imagem FROM categoria WHERE id = ?", [id], (err, rows) => {
            if (err || !rows.length) return res.status(404).json({ erro: "Categoria não encontrada." });

            const nomeAntigo = rows[0].nome;
            const imagemFinal = imagem !== undefined ? imagem : rows[0].imagem;

            db.query(
                "UPDATE categoria SET nome = ?, icone = ?, imagem = ? WHERE id = ?",
                [nome.trim(), icone || "🍴", imagemFinal, id],
                (erro) => {
                    if (erro) return res.status(500).json({ erro: erro.message });

                    // Se o nome da categoria mudou, atualiza os pratos associados
                    if (nomeAntigo !== nome.trim()) {
                        db.query("UPDATE prato SET categoria = ? WHERE categoria = ?", [nome.trim(), nomeAntigo]);
                        db.query("UPDATE prato SET categoria_secundaria = ? WHERE categoria_secundaria = ?", [nome.trim(), nomeAntigo]);
                    }

                    res.json({ mensagem: "Categoria atualizada com sucesso!", imagem: imagemFinal });
                }
            );
        });
    } catch (err) {
        console.error("Erro ao atualizar categoria:", err);
        return res.status(500).json({ erro: "Erro ao atualizar categoria: " + err.message });
    }
};

// PUT /categorias/reordenar — admin (atualiza a ordem de exibição no cardápio)
const reordenarCategorias = async (req, res) => {
    const { categorias } = req.body; // Array de { id, ordem }

    if (!Array.isArray(categorias)) {
        return res.status(400).json({ erro: "Array de categorias é obrigatório." });
    }

    try {
        for (const cat of categorias) {
            await new Promise((resolve, reject) => {
                db.query("UPDATE categoria SET ordem = ? WHERE id = ?", [cat.ordem, cat.id], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
        res.json({ mensagem: "Ordem das categorias atualizada com sucesso!" });
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
};

// DELETE /categorias/:id — admin (exclusão segura e automática)
const deletarCategoria = (req, res) => {
    const { id } = req.params;

    // Busca a categoria para obter o nome
    db.query(
        "SELECT nome FROM categoria WHERE id = ?", [id],
        (err, rows) => {
            if (!rows || rows.length === 0) return res.status(404).json({ erro: "Categoria não encontrada." });
            const nomeCategoria = rows[0].nome;

            // Move os pratos vinculados para 'Cardápio' e limpa categoria secundária se for o caso
            db.query(
                "UPDATE prato SET categoria = 'Cardápio' WHERE categoria = ?", [nomeCategoria],
                (errUpdate) => {
                    if (errUpdate) console.warn("Aviso ao mover categoria principal:", errUpdate.message);

                    db.query(
                        "UPDATE prato SET categoria_secundaria = NULL WHERE categoria_secundaria = ?", [nomeCategoria],
                        (errSec) => {
                            if (errSec) console.warn("Aviso ao limpar categoria secundária:", errSec.message);

                            // Agora exclui a categoria com segurança total
                            db.query("DELETE FROM categoria WHERE id = ?", [id], (erro) => {
                                if (erro) return res.status(500).json({ erro: erro.message });
                                res.json({
                                    mensagem: `Categoria "${nomeCategoria}" removida com sucesso! Os pratos foram realocados para "Cardápio Geral".`
                                });
                            });
                        }
                    );
                }
            );
        }
    );
};

module.exports = { listarCategorias, criarCategoria, editarCategoria, reordenarCategorias, deletarCategoria };
