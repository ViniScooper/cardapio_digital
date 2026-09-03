// ============================================================
// backend/src/controllers/configController.js
// ============================================================

const db = require("../config/database");

// GET /config — público (usado no cardápio / home)
const obterConfig = (req, res) => {
    db.query("SELECT * FROM configuracao WHERE id = 1", (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        if (resultado.length === 0) {
            return res.json({
                hh_ativo: 1,
                hh_dias: "Segunda, Terça e Quarta",
                hh_inicio: "19:00",
                hh_fim: "22:00"
            });
        }
        res.json(resultado[0]);
    });
};

// PUT /config/happy-hour — admin
const atualizarHappyHour = (req, res) => {
    const { hh_ativo, hh_dias, hh_inicio, hh_fim } = req.body;

    const ativo = (hh_ativo === true || hh_ativo === "true" || hh_ativo === 1 || hh_ativo === "1") ? 1 : 0;
    const dias = hh_dias || "Segunda, Terça e Quarta";
    const inicio = hh_inicio || "19:00";
    const fim = hh_fim || "22:00";

    const sql = `
        INSERT INTO configuracao (id, hh_ativo, hh_dias, hh_inicio, hh_fim)
        VALUES (1, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            hh_ativo = VALUES(hh_ativo),
            hh_dias = VALUES(hh_dias),
            hh_inicio = VALUES(hh_inicio),
            hh_fim = VALUES(hh_fim)
    `;

    db.query(sql, [ativo, dias, inicio, fim], (erro) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        res.json({
            mensagem: "Configurações de Happy Hour atualizadas com sucesso!",
            config: { hh_ativo: ativo, hh_dias: dias, hh_inicio: inicio, hh_fim: fim }
        });
    });
};

module.exports = { obterConfig, atualizarHappyHour };
