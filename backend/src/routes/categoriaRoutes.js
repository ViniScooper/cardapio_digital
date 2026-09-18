// ============================================================
// backend/src/routes/categoriaRoutes.js
// ============================================================

const express = require("express");
const router  = express.Router();

const { listarCategorias, criarCategoria, editarCategoria, reordenarCategorias, deletarCategoria } = require("../controllers/categoriaController");
const { verificarToken, apenasAdmin } = require("../middleware/authMiddleware");
const { upload } = require("../config/upload");

// GET  /categorias           — público
router.get("/", listarCategorias);

// PUT  /categorias/reordenar — admin
router.put("/reordenar", verificarToken, apenasAdmin, reordenarCategorias);

// POST /categorias           — admin (com suporte a upload de imagem)
router.post("/", verificarToken, apenasAdmin, upload.single("imagem"), criarCategoria);

// PUT  /categorias/:id       — admin (com suporte a alteração de imagem/dados)
router.put("/:id", verificarToken, apenasAdmin, upload.single("imagem"), editarCategoria);

// DELETE /categorias/:id     — admin
router.delete("/:id", verificarToken, apenasAdmin, deletarCategoria);

module.exports = router;
