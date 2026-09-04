// ============================================================
// backend/src/routes/pratoRoutes.js
// ============================================================

const express = require("express");
const router  = express.Router();

const { 
    listarPratos, 
    criarPrato, 
    editarPrato, 
    deletarPrato,
    registrarVisualizacao,
    obterMatrizEngenharia,
    reordenarPratos
} = require("../controllers/pratoController");
const { verificarToken, apenasAdmin } = require("../middleware/authMiddleware");
const upload = require("../config/upload");

// PUT  /pratos/reordenar        — admin: salvar ordem manual dos pratos
router.put("/reordenar", verificarToken, apenasAdmin, reordenarPratos);

// GET  /pratos/matriz           — admin: dados agregados de margem e popularidade
router.get("/matriz", verificarToken, apenasAdmin, obterMatrizEngenharia);

// POST /pratos/:id/visualizacao — público: contabiliza interesse do cliente
router.post("/:id/visualizacao", registrarVisualizacao);

// GET  /pratos                  — público: cardápio com ordenação inteligente
router.get("/", listarPratos);

// POST /pratos                  — admin + imagem opcional
router.post("/", verificarToken, apenasAdmin, upload.single("imagem"), criarPrato);

// PUT  /pratos/:id              — admin + imagem opcional (edição)
router.put("/:id", verificarToken, apenasAdmin, upload.single("imagem"), editarPrato);

// DELETE /pratos/:id            — admin
router.delete("/:id", verificarToken, apenasAdmin, deletarPrato);

module.exports = router;
