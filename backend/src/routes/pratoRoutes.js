// ============================================================
// backend/src/routes/pratoRoutes.js
// ============================================================

const express = require("express");
const router  = express.Router();

const { listarPratos, criarPrato, editarPrato, deletarPrato } = require("../controllers/pratoController");
const { verificarToken, apenasAdmin } = require("../middleware/authMiddleware");
const upload = require("../config/upload");

// GET  /pratos         — público
router.get("/", listarPratos);

// POST /pratos         — admin + imagem opcional
router.post("/", verificarToken, apenasAdmin, upload.single("imagem"), criarPrato);

// PUT  /pratos/:id     — admin + imagem opcional (edição)
router.put("/:id", verificarToken, apenasAdmin, upload.single("imagem"), editarPrato);

// DELETE /pratos/:id   — admin
router.delete("/:id", verificarToken, apenasAdmin, deletarPrato);

module.exports = router;
