// ============================================================
// backend/src/routes/categoriaRoutes.js
// ============================================================

const express = require("express");
const router  = express.Router();

const { listarCategorias, criarCategoria, reordenarCategorias, deletarCategoria } = require("../controllers/categoriaController");
const { verificarToken, apenasAdmin } = require("../middleware/authMiddleware");

// GET  /categorias           — público
router.get("/", listarCategorias);

// PUT  /categorias/reordenar — admin
router.put("/reordenar", verificarToken, apenasAdmin, reordenarCategorias);

// POST /categorias           — admin
router.post("/", verificarToken, apenasAdmin, criarCategoria);

// DELETE /categorias/:id     — admin
router.delete("/:id", verificarToken, apenasAdmin, deletarCategoria);

module.exports = router;
